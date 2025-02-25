/*
 * This file is part of the TYPO3 CMS project.
 *
 * It is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License, either version 2
 * of the License, or any later version.
 *
 * For the full copyright and license information, please read the
 * LICENSE.txt file that was distributed with this source code.
 *
 * The TYPO3 project - inspiring people to share!
 */

import { html, LitElement, TemplateResult, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators';
import { repeat } from 'lit/directives/repeat';
import { unsafeHTML } from 'lit/directives/unsafe-html';
import { styleMap } from 'lit/directives/style-map';
import { Task } from '@lit/task';
import '@typo3/backend/element/icon-element';
import AjaxRequest from '@typo3/core/ajax/ajax-request';
import ClientStorage from '@typo3/backend/storage/client';
import { lll, delay } from '@typo3/core/lit-helper';
import Modal, { ModalElement } from '@typo3/backend/modal';
import { SeverityEnum } from '@typo3/backend/enum/severity';
import RegularEvent from '@typo3/core/event/regular-event';
import { AjaxResponse } from '@typo3/core/ajax/ajax-response';
import { Categories } from '@typo3/backend/new-record-wizard';
import { topLevelModuleImport } from '@typo3/backend/utility/top-level-module-import';
import Notification from '@typo3/backend/notification';

export enum DashboardActionEvent {
  dashboardAdd = 'typo3:dashboard:dashboard:add',
  dashboardEdit = 'typo3:dashboard:dashboard:edit',
  dashboardUpdate = 'typo3:dashboard:dashboard:update',
  dashboardDelete = 'typo3:dashboard:dashboard:delete',
  widgetAdd = 'typo3:dashboard:widget:add',
  widgetRemove = 'typo3:dashboard:widget:remove',
  widgetRefresh = 'typo3:dashboard:widget:refresh',
  widgetMoveIntend = 'typo3:dashboard:widget:moveIntend',
  widgetContentRendered = 'typo3:dashboard:widget:content:rendered',
}

enum DashboardWidgetMoveIntend {
  start = 'start',
  end = 'end',
  left = 'left',
  right = 'right',
  up = 'up',
  down = 'down',
}

interface DashboardWidgetMoveIntendEvent {
  identifier: string;
  intend: DashboardWidgetMoveIntend;
}

interface DashboardWidgetRefreshEventInterface {
  identifier: string;
}

interface DashboardPresetInterface {
  identifier: string;
  title: string;
  description: string;
  icon: string;
  widgets: Array<string>;
  showInWizard: boolean;
}

interface DashboardAddEventInterface {
  preset: string;
  title: string;
}

interface DashboardEditEventInterface {
  identifier: string;
  title: string;
}

interface DashboardUpdateEventInterface {
  identifier: string;
  widgets: DashboardWidgetConfigurationInterface[];
  widgetPositions: Record<number, DashboardWidgetPosition[]>
}

interface DashboardDeleteEventInterface {
  identifier: string;
}

interface DashboardWidgetRemoveEventInterface {
  widget: string;
}

interface DashboardInterface {
  identifier: string,
  title: string,
  widgets: DashboardWidgetConfigurationInterface[]
  widgetPositions: Record<number, DashboardWidgetPosition[]>
}

interface DashboardWidgetPosition {
  identifier: string,
  height: number,
  width: number,
  y: number,
  x: number,
}

interface DashboardDragInformation {
  identifier: string;
  element: HTMLElement;
  height: number,
  width: number,
  offsetY: number;
  offsetX: number;
  currentY: number;
  currentX: number;
  initialPositions: DashboardWidgetPosition[];
}

interface DashboardWidgetConfigurationInterface {
  identifier: string,
  type: string,
  height: string,
  width: string,
}

interface DashboardWidgetInterface extends DashboardWidgetConfigurationInterface {
  label: string,
  content: string,
  options: Record<string, any>,
  eventdata: Record<string, string>,
}

function createSet(item: DashboardWidgetPosition): Set<string> {
  const set = new Set<string>();
  for (let y = 0; y < item.height; y++) {
    for (let x = 0; x < item.width; x++) {
      const cellKey = `${item.y + y}-${item.x + x}`;
      set.add(cellKey);
    }
  }
  return set;
}

@customElement('typo3-dashboard')
export class Dashboard extends LitElement {
  @state() loading: boolean = false;
  @state() dashboards: DashboardInterface[] = [];
  @state() currentDashboard: DashboardInterface | null = null;
  @state() columns: number = 4;
  @state() dragInformation: DashboardDragInformation | null = null
  private resizeObserver: ResizeObserver | null = null;
  private readonly clientStorageIdentifier: string = 'dashboard/current_dashboard';

  // Set to `true` to utilize `document.startViewTransition()` for the next render cycle
  private useViewTransition: boolean = false;
  private enableViewTransitions: boolean = true;
  private viewTransition: ViewTransition | null = null;
  private mql: MediaQueryList | null = null;

  private dragOverTimeout: number | null = null;

  private activeElementRef: HTMLElement | null = null;

  constructor() {
    super();

    // Refresh Widget
    new RegularEvent(DashboardActionEvent.widgetRefresh, (event: CustomEvent<DashboardWidgetRefreshEventInterface>): void => {
      event.preventDefault();
      const element = this.getGridItemByIdentifier(event.detail.identifier);
      const widgetElement = element.querySelector('typo3-dashboard-widget');
      widgetElement.refresh();
    }).bindTo(this);

    // Remove Widget
    new RegularEvent(DashboardActionEvent.widgetRemove, (event: CustomEvent): void => {
      event.preventDefault();
      const detail: DashboardWidgetRemoveEventInterface = event.detail;
      (new AjaxRequest(TYPO3.settings.ajaxUrls.dashboard_widget_remove))
        .post({
          dashboard: this.currentDashboard.identifier,
          widget: detail.widget,
        })
        .then(async (response: AjaxResponse): Promise<void> => {
          const data = await response.resolve();
          if (data.status === 'ok') {
            // drop widget
            this.currentDashboard.widgets = this.currentDashboard.widgets.filter((widget) => {
              return widget.identifier !== detail.widget;
            });
            // drop widget position
            for (const [dashboardSize, dashboardSizeSet] of Object.entries(this.currentDashboard.widgetPositions)) {
              const dashboardSizeNumber = Number(dashboardSize);
              this.currentDashboard.widgetPositions[dashboardSizeNumber] = dashboardSizeSet.filter((widgetPosition) => widgetPosition.identifier !== detail.widget);
            }
            this.useViewTransition = true;
            this.requestUpdate();
          } else {
            // @TODO ERROR
          }
        });
    }).bindTo(top.document);

    // Try to move widget
    new RegularEvent(DashboardActionEvent.widgetMoveIntend, (event: CustomEvent): void => {
      event.preventDefault();
      const detail: DashboardWidgetMoveIntendEvent = event.detail;
      const intend = detail.intend;
      const widgetPosition = this.widgetPositionByIdentifier(detail.identifier);

      switch (intend) {
        case DashboardWidgetMoveIntend.up:
          widgetPosition.y = Math.max(0, widgetPosition.y - 1);
          break;
        case DashboardWidgetMoveIntend.down:
          widgetPosition.y++;
          break;
        case DashboardWidgetMoveIntend.left:
          widgetPosition.x = Math.max(0, widgetPosition.x - 1);
          break;
        case DashboardWidgetMoveIntend.right:
          widgetPosition.x = Math.min(this.columns - widgetPosition.width, widgetPosition.x + 1);
          break;
        case DashboardWidgetMoveIntend.end:
          // Rearranging DOM elements in `widgetPositionsSort` will cause a focus-state loss,
          // caused by `insertBefore` limitation, see
          // https://developer.chrome.com/blog/movebefore-api#losing_state_during_dom_mutations
          if (document.activeElement instanceof HTMLElement && document.activeElement.closest('typo3-dashboard') === this) {
            // Keep a reference to the focussed element and re-set in `this.updated()`
            this.activeElementRef = document.activeElement;
          }
          this.widgetPositionsSort(this.currentDashboard.widgetPositions[this.columns]);

          top.document.dispatchEvent(new CustomEvent<DashboardUpdateEventInterface>(DashboardActionEvent.dashboardUpdate, {
            detail: {
              identifier: this.currentDashboard.identifier,
              widgets: this.currentDashboard.widgets,
              widgetPositions: this.currentDashboard.widgetPositions
            }
          }));
          return;
        default:
          return;
      }

      this.widgetPositionChange(this.currentDashboard.widgetPositions[this.columns], widgetPosition);

    }).bindTo(top.document);

    // Add dashboard
    new RegularEvent(DashboardActionEvent.dashboardAdd, (event: CustomEvent): void => {
      event.preventDefault();
      const detail: DashboardAddEventInterface = event.detail;
      (new AjaxRequest(TYPO3.settings.ajaxUrls.dashboard_dashboard_add))
        .post({
          preset: detail.preset,
          title: detail.title,
        })
        .then(async (response: AjaxResponse): Promise<void> => {
          const data = await response.resolve();
          if (data.status === 'ok') {
            const currentDashboard = data.dashboard;
            this.dashboards.push(currentDashboard);
            const selectedDashboard = this.getDashboardByIdentifier(currentDashboard.identifier) || this.getDashboardFirst();
            this.selectDashboard(selectedDashboard);
            this.requestUpdate();
          } else {
            // @TODO ERROR
          }
        });
    }).bindTo(top.document);

    // Edit dashboard
    new RegularEvent(DashboardActionEvent.dashboardEdit, (event: CustomEvent): void => {
      event.preventDefault();
      const detail: DashboardEditEventInterface = event.detail;
      (new AjaxRequest(TYPO3.settings.ajaxUrls.dashboard_dashboard_edit))
        .post({
          identifier: detail.identifier,
          title: detail.title,
        })
        .then(async (response: AjaxResponse): Promise<void> => {
          const data = await response.resolve();
          if (data.status === 'ok') {
            const oldDashboard: DashboardInterface = this.dashboards.filter((dashboard: DashboardInterface): boolean => {
              return dashboard.identifier === detail.identifier;
            })[0];
            const index = this.dashboards.indexOf(oldDashboard);
            const updatedDashboard = data.dashboard;
            this.dashboards[index] = updatedDashboard;
            if (oldDashboard.identifier === updatedDashboard.identifier) {
              this.selectDashboard(updatedDashboard);
            }
            this.requestUpdate();
          } else {
            // @TODO ERROR
          }
        });
    }).bindTo(top.document);

    // Update dashboard
    new RegularEvent(DashboardActionEvent.dashboardUpdate, (event: CustomEvent): void => {
      event.preventDefault();
      const detail: DashboardUpdateEventInterface = event.detail;
      (new AjaxRequest(TYPO3.settings.ajaxUrls.dashboard_dashboard_update))
        .post({
          identifier: detail.identifier,
          widgets: detail.widgets,
          widgetPositions: detail.widgetPositions,
        })
        .then(async (response: AjaxResponse): Promise<void> => {
          const data = await response.resolve();
          if (data.status === 'ok') {
            const oldDashboard: DashboardInterface = this.dashboards.filter((dashboard: DashboardInterface): boolean => {
              return dashboard.identifier === detail.identifier;
            })[0];
            const index = this.dashboards.indexOf(oldDashboard);
            const updatedDashboard = data.dashboard;
            this.dashboards[index] = updatedDashboard;
            if (oldDashboard.identifier === updatedDashboard.identifier) {
              this.selectDashboard(updatedDashboard);
            }
            this.requestUpdate();
          } else {
            // @TODO ERROR
          }
        });
    }).bindTo(top.document);

    // Delete dashboard
    new RegularEvent(DashboardActionEvent.dashboardDelete, (event: CustomEvent): void => {
      event.preventDefault();
      const detail: DashboardDeleteEventInterface = event.detail;
      (new AjaxRequest(TYPO3.settings.ajaxUrls.dashboard_dashboard_delete))
        .post({
          identifier: detail.identifier,
        })
        .then(async (response: AjaxResponse): Promise<void> => {
          const data = await response.resolve();
          if (data.status === 'ok') {
            this.dashboards = this.dashboards.filter((dashboard: DashboardInterface): boolean => {
              return dashboard.identifier !== detail.identifier;
            });
            const selectedDashboard = this.getDashboardFirst();
            this.selectDashboard(selectedDashboard);
            this.requestUpdate();
          } else {
            // @TODO ERROR
          }
        });
    }).bindTo(top.document);
  }

  public override connectedCallback() {
    super.connectedCallback();

    // Attach resize observer to set available columns
    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        if (width > 950) {
          this.columns = 4;
        } else if (width > 750) {
          this.columns = 2;
        } else {
          this.columns = 1;
        }
      }
    });
    this.resizeObserver.observe(this);

    if (('startViewTransition' in document)) {
      // Add a media query listener to disable `this.enableViewTransitions` if requested by the user agent
      this.mql = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.mqListener(this.mql);
      this.mql.addEventListener('change', this.mqListener);
    } else {
      // This case (currently needed for firefox) can be removed
      // once view transitions enter baseline "Widely available":
      // https://webstatus.dev/features/view-transitions?q=view+transition
      this.enableViewTransitions = false;
    }
  }

  public override disconnectedCallback() {
    super.disconnectedCallback();

    this.resizeObserver?.disconnect();
    this.resizeObserver = null;

    this.mql?.removeEventListener('change', this.mqListener);
    this.mql = null;
  }

  protected readonly mqListener = (mql: MediaQueryList|MediaQueryListEvent): void => {
    this.enableViewTransitions = !mql.matches;
  }

  protected override firstUpdated(): void {
    this.load();
  }

  protected override updated(): void {
    if (this.activeElementRef) {
      this.activeElementRef.focus();
      this.activeElementRef = null;
    }
  }

  protected override createRenderRoot(): HTMLElement | ShadowRoot {
    return this;
  }

  protected override scheduleUpdate(): void | Promise<unknown> {
    const { useViewTransition } = this;
    this.useViewTransition = false;
    if (useViewTransition && this.enableViewTransitions) {
      return (async () => {
        // `super.scheduleUpdate()` will call `this.performUpdate()` which will perform a
        // synchronous DOM update within the view transformation callback.
        this.viewTransition = document.startViewTransition(() => super.scheduleUpdate())
        // Delay the next render cycle until the view transition has been finished (or skipped)
        await this.viewTransition.finished;
        this.viewTransition = null;
      })();
    }

    return super.scheduleUpdate();
  }

  protected override render(): TemplateResult {
    if (this.loading) {
      return html`${this.renderLoader()}`;
    }

    return html`
      ${this.renderHeader()}
      <div class="dashboard-container">
        ${this.renderContent()}
      </div>
      ${this.renderFooter()}
      `;
  }

  private skipCurrentViewTransition(): void {
    this.viewTransition?.skipTransition();
  }

  private async load(): Promise<void> {
    this.loading = true;
    this.dashboards = await this.fetchDashboards();
    const currentDashboardIdentifier = ClientStorage.get(this.clientStorageIdentifier);
    const selectedDashboard = this.getDashboardByIdentifier(currentDashboardIdentifier) || this.getDashboardFirst();
    this.selectDashboard(selectedDashboard);
    this.loading = false;
  }

  private async fetchData(url: string): Promise<any> {
    try {
      return (await new AjaxRequest(url).get({ cache: 'no-cache' })).resolve();
    } catch (error: any) {
      console.error(error);
      return [];
    }
  }

  private async fetchPresets(): Promise<DashboardPresetInterface[]> {
    const data = await this.fetchData(TYPO3.settings.ajaxUrls.dashboard_presets_get);
    return Object.values(data);
  }

  private async fetchCategories(): Promise<Categories> {
    const data = await this.fetchData(TYPO3.settings.ajaxUrls.dashboard_categories_get);
    return Categories.fromData(data);
  }

  private async fetchDashboards(): Promise<DashboardInterface[]> {
    const data = await this.fetchData(TYPO3.settings.ajaxUrls.dashboard_dashboards_get);
    return data;
  }

  private getDashboardByIdentifier(identifier: string): DashboardInterface | null {
    return this.dashboards.find(dashboard => dashboard.identifier === identifier) || null;
  }

  private getDashboardFirst(): DashboardInterface | null {
    return this.dashboards.length > 0 ? this.dashboards[0] : null;
  }

  private async createDashboard(): Promise<void> {
    const presets = await this.fetchPresets();
    const filteredPresets = presets.filter((preset: DashboardPresetInterface): boolean => {
      return preset.showInWizard;
    });

    const content = html`
      <form>
        <div class="form-group">
          <label class="form-label" for="dashboard-form-add-title">${lll('dashboard.title')}</label>
          <input class="form-control" id="dashboard-form-add-title" type="text" name="title" required="required">
        </div>
        <div class="dashboard-modal-items">
          ${repeat(filteredPresets, (preset: DashboardPresetInterface) => preset.identifier, (preset: DashboardPresetInterface, index: number) => html`
            <div class="dashboard-modal-item">
              <input
                type="radio"
                name="preset"
                value=${preset.identifier}
                class="dashboard-modal-item-checkbox"
                id="dashboard-form-add-preset-${preset.identifier}"
                ?checked=${index === 0}
              >
              <label for="dashboard-form-add-preset-${preset.identifier}" class="dashboard-modal-item-block">
                <span class="dashboard-modal-item-icon">
                  <typo3-backend-icon identifier=${preset.icon} size="medium"></typo3-backend-icon>
                </span>
                <span class="dashboard-modal-item-details">
                  <span class="dashboard-modal-item-title">${preset.title}</span>
                  <span class="dashboard-modal-item-description">${preset.description}</span>
                </span>
              </label>
            </div>
          `)}
        </div>
      </form>
    `;

    Modal.advanced({
      type: Modal.types.default,
      title: lll('dashboard.add'),
      size: Modal.sizes.medium,
      severity: SeverityEnum.notice,
      content: content,
      callback: (currentModal: ModalElement): void => {

        currentModal.addEventListener('typo3-modal-shown', (): void => {
          (currentModal.querySelector('#dashboard-form-add-title') as HTMLInputElement)?.focus();
        });

        currentModal.addEventListener('button.clicked', (e: Event): void => {
          const button = e.target as HTMLButtonElement;
          if (button.getAttribute('name') === 'save') {
            const formElement = currentModal.querySelector('form');
            formElement.requestSubmit();
          } else {
            currentModal.hideModal();
          }
        });

        currentModal.querySelector('form').addEventListener('submit', (e: Event): void => {
          e.preventDefault();
          const form = e.target as HTMLFormElement;
          const formData = new FormData(form);
          const detail: DashboardAddEventInterface = {
            preset: formData.get('preset') as string,
            title: formData.get('title') as string,
          }
          top.document.dispatchEvent(new CustomEvent(DashboardActionEvent.dashboardAdd, { detail: detail }));
          currentModal.hideModal();
        });

      },
      buttons: [
        {
          text: lll('dashboard.add.button.close'),
          btnClass: 'btn-default',
          name: 'cancel',
        },
        {
          text: lll('dashboard.add.button.ok'),
          btnClass: 'btn-primary',
          name: 'save',
        },
      ]
    });
  }

  private editDashboard(dashboard: DashboardInterface): void {
    const content = html`
      <form>
        <div class="form-group">
          <label class="form-label" for="dashboard-form-edit-title">${lll('dashboard.title')}</label>
          <input class="form-control" id="dashboard-form-edit-title" type="text" name="title" value=${dashboard.title || ''} required="required">
        </div>
      </form>
    `;

    Modal.advanced({
      type: Modal.types.default,
      title: lll('dashboard.configure'),
      size: Modal.sizes.small,
      severity: SeverityEnum.notice,
      content: content,
      callback: (currentModal: ModalElement): void => {

        currentModal.addEventListener('typo3-modal-shown', (): void => {
          (currentModal.querySelector('#dashboard-form-edit-title') as HTMLInputElement)?.focus();
        });

        currentModal.addEventListener('button.clicked', (e: Event): void => {
          const button = e.target as HTMLButtonElement;
          if (button.getAttribute('name') === 'save') {
            const formElement = currentModal.querySelector('form');
            formElement.requestSubmit();
          } else {
            currentModal.hideModal();
          }
        });

        currentModal.querySelector('form').addEventListener('submit', (e: Event): void => {
          e.preventDefault();
          const form = e.target as HTMLFormElement;
          const formData = new FormData(form);
          const detail: DashboardEditEventInterface = {
            identifier: dashboard.identifier,
            title: formData.get('title') as string,
          }
          top.document.dispatchEvent(new CustomEvent(DashboardActionEvent.dashboardEdit, { detail: detail }));
          currentModal.hideModal();
        });

      },
      buttons: [
        {
          text: lll('dashboard.configure.button.close'),
          btnClass: 'btn-default',
          name: 'cancel',
        },
        {
          text: lll('dashboard.configure.button.ok'),
          btnClass: 'btn-primary',
          name: 'save',
        },
      ]
    });
  }

  private deleteDashboard(dashboard: DashboardInterface): void {
    const modal = Modal.confirm(
      lll('dashboard.delete'),
      lll('dashboard.delete.sure'),
      SeverityEnum.warning, [
        {
          text: lll('dashboard.delete.cancel'),
          active: true,
          btnClass: 'btn-default',
          name: 'cancel',
        },
        {
          text: lll('dashboard.delete.ok'),
          btnClass: 'btn-warning',
          name: 'delete',
        },
      ]
    );

    modal.addEventListener('button.clicked', (e: Event): void => {
      const target = e.target as HTMLButtonElement;
      if (target.getAttribute('name') === 'delete') {
        const detail: DashboardDeleteEventInterface = { identifier: dashboard.identifier };
        top.document.dispatchEvent(new CustomEvent(DashboardActionEvent.dashboardDelete, { detail: detail }));
      }
      modal.hideModal();
    });
  }

  private selectDashboard(dashboard: DashboardInterface | null): void {
    if (dashboard !== null) {
      ClientStorage.set(this.clientStorageIdentifier, dashboard.identifier);
    }
    this.currentDashboard = dashboard;
  }

  private async addWidget(): Promise<void> {
    topLevelModuleImport('@typo3/backend/new-record-wizard.js');

    const wizard = top.document.createElement('typo3-backend-new-record-wizard');
    wizard.searchPlaceholder = lll('widget.addToDashboard.searchLabel');
    wizard.searchNothingFoundLabel = lll('widget.addToDashboard.searchNotFound');
    wizard.categories = await this.fetchCategories();
    wizard.addEventListener(DashboardActionEvent.widgetAdd, async (event: CustomEvent): Promise<void> => {
      const item = event.detail.item;
      const response = await new AjaxRequest(TYPO3.settings.ajaxUrls.dashboard_widget_add)
        .post({
          dashboard: this.currentDashboard.identifier,
          type: item.identifier,
        });
      const data = await response.resolve();
      this.currentDashboard.widgets.push(data);
      this.requestUpdate();
    });

    Modal.advanced({
      type: Modal.types.default,
      title: lll('widget.addToDashboard', this.currentDashboard.title),
      size: Modal.sizes.medium,
      severity: SeverityEnum.notice,
      content: wizard,
      callback: (currentModal: ModalElement): void => {
        currentModal.addEventListener('button.clicked', (): void => {
          currentModal.hideModal();
        });
      },
      buttons: [
        {
          text: lll('widget.add.button.close'),
          btnClass: 'btn-default',
          name: 'cancel',
        }
      ]
    });
  }

  private renderLoader(): TemplateResult {
    return html`
      <div class="dashboard-loader">
          <typo3-backend-icon identifier="spinner-circle" size="medium"></typo3-backend-icon>
      </div>
      `;
  }

  private renderHeader(): TemplateResult {
    const createButton: TemplateResult = html`
      <button
        class="dashboard-button dashboard-button-tab-add"
        title=${lll('dashboard.add')}
        @click=${() => { this.createDashboard() }}
      >
        <typo3-backend-icon identifier="actions-plus" size="small"></typo3-backend-icon>
        <span class="visually-hidden">${lll('dashboard.add')}</span>
      </button>
      `;

    const editButton = this.currentDashboard !== null
      ? html`
        <button
          class="btn btn-default btn-sm"
          title=${lll('dashboard.configure')}
          @click=${() => { this.editDashboard(this.currentDashboard) }}
        >
          <typo3-backend-icon identifier="actions-cog" size="small"></typo3-backend-icon>
          <span class="visually-hidden">${lll('dashboard.configure')}</span>
        </button>
        `
      : nothing;

    const deleteButton = this.currentDashboard !== null
      ? html`
        <button
          class="btn btn-default btn-sm"
          title=${lll('dashboard.delete')}
          @click=${() => { this.deleteDashboard(this.currentDashboard) }}
        >
          <typo3-backend-icon identifier="actions-delete" size="small"></typo3-backend-icon>
          <span class="visually-hidden">${lll('dashboard.delete')}</span>
        </button>
        `
      : nothing;

    return html`
      <div class="dashboard-header">
        <h1 class="visually-hidden">${this.currentDashboard?.title}</h1>
        <div class="dashboard-header-container">
          <div class="dashboard-tabs">
            ${repeat(this.dashboards, (dashboard: DashboardInterface) => dashboard.identifier, (dashboard: DashboardInterface) => html`
              <button
                @click=${() => { this.selectDashboard(dashboard); }}
                class="dashboard-tab${dashboard === this.currentDashboard ? ' dashboard-tab--active' : ''}"
              >
                ${dashboard.title}
              </button>
            `)}
            ${createButton}
          </div>
          ${editButton || deleteButton ? html`<div class="dashboard-configuration btn-toolbar" role="toolbar">${editButton}${deleteButton}</div>` : nothing}
        </div>
      </div>`;
  }

  private renderContent(): TemplateResult {
    if (this.currentDashboard) {
      if (this.currentDashboard.widgets.length > 0) {
        this.initializeCurrentDashboard();

        return html`
          <div
            class="dashboard-grid"
            style=${styleMap({ '--columns': this.columns })}
            @dragend=${this.handleDragEnd}
            @dragover=${this.handleDragOver}
            @dragstart=${this.handleDragStart}
          >
            ${repeat(this.currentDashboard.widgetPositions[this.columns], (widget: DashboardWidgetPosition) => widget.identifier, (widget: DashboardWidgetPosition) => html`
              <div
                class="dashboard-item"
                style=${styleMap({ '--col-start': widget.x + 1, '--col-span': widget.width, '--row-start': widget.y + 1, '--row-span': widget.height, 'view-transition-name': 'dashboard-item-' + widget.identifier })}
                draggable="true"
                data-widget-hash=${widget.identifier}
                data-widget-key=${this.widgetByIdentifier(widget.identifier)?.type}
                data-widget-identifier=${widget.identifier}
                @widgetRefresh="${() => this.handleLegacyWidgetRefreshEvent(widget)}"
              >
                <typo3-dashboard-widget .identifier=${widget.identifier}></typo3-dashboard-widget>
              </div>
            `)}
          </div>
        `;
      }

      return html`
        <div class="dashboard-empty">
          <div class="dashboard-empty-content">
            <h3>${lll('dashboard.empty.content.title')}</h3>
            <p>${lll('dashboard.empty.content.description')}</p>
            <button
              title=${lll('widget.add')}
              class="btn dashboard-button"
              @click=${() => { this.addWidget() }}
            >
              <span class="dashboard-button-icon"><typo3-backend-icon identifier="actions-plus" size="small"></typo3-backend-icon></span>
              <span class="dashboard-button-text">${lll('dashboard.empty.content.button')}</span>
            </button>
          </div>
        </div>
        `;
    }

    return html`${nothing}`;
  }

  private renderFooter(): TemplateResult {
    return this.currentDashboard !== null
      ? html`
        <div class="dashboard-add-item">
          <button
            class="btn btn-primary btn-dashboard-add"
            style="view-transition-name: dashboard-add-item"
            title=${lll('widget.addToDashboard', this.currentDashboard.title)}
            @click=${() => { this.addWidget() }}
          >
            <typo3-backend-icon identifier="actions-plus" size="small"></typo3-backend-icon>
            <span class="visually-hidden">${lll('widget.addToDashboard', this.currentDashboard.title)}</span>
          </button>
        </div>
        `
      : html`${nothing}`;
  }

  private getGridItemByIdentifier(identifier: string): HTMLElement | null {
    return this.querySelector('.dashboard-item[data-widget-identifier="' + identifier + '"]') ?? null;
  }

  private handleDragStart(event: DragEvent): void {
    const target = event.target as HTMLElement;
    const isDashboardItem = target.classList.contains('dashboard-item');
    const isWidgetHeader = document.elementFromPoint(event.clientX, event.clientY).closest('.widget-header') !== null;
    if (!isDashboardItem || !isWidgetHeader) {
      event.preventDefault();
      return;
    }

    const identifier = target.dataset.widgetIdentifier;
    const element = this.getGridItemByIdentifier(identifier);
    const widgetPosition = this.widgetPositionByIdentifier(identifier);
    const rect = element.getBoundingClientRect();

    this.dragInformation = {
      identifier: identifier,
      element: element,
      height: widgetPosition.height,
      width: widgetPosition.width,
      offsetY: event.clientY - rect.top,
      offsetX: event.clientX - rect.left,
      currentY: widgetPosition.y,
      currentX: widgetPosition.x,
      initialPositions: this.currentDashboard.widgetPositions[this.columns].map(item => ({ ...item })),
    };

    event.dataTransfer.setData('text/plain', '');
    event.dataTransfer.effectAllowed = 'move';
    this.dragInformation.element.style.opacity = '0.5';
  }

  private handleDragEnd(): void {
    if (this.dragInformation) {
      this.dragInformation.element.style.opacity = '';
      this.dragInformation = null;
      this.widgetPositionsSort(this.currentDashboard.widgetPositions[this.columns]);
      top.document.dispatchEvent(new CustomEvent<DashboardUpdateEventInterface>(DashboardActionEvent.dashboardUpdate, {
        detail: {
          identifier: this.currentDashboard.identifier,
          widgets: this.currentDashboard.widgets,
          widgetPositions: this.currentDashboard.widgetPositions
        }
      }));
      this.skipCurrentViewTransition();
    }
  }

  private handleDragOver(event: DragEvent): void {
    if (this.dragInformation) {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';

      const container = this.querySelector('.dashboard-grid');
      const rect = container.getBoundingClientRect();
      const gap = parseInt(getComputedStyle(container).gap, 10);
      const rowHeight = parseInt(getComputedStyle(container).gridAutoRows, 10) + gap;
      const colWidth = (rect.width + gap) / this.columns;
      const currentY = Math.max(0, event.clientY - rect.top - this.dragInformation.offsetY);
      const currentX = Math.max(0, event.clientX - rect.left - this.dragInformation.offsetX);
      const row = Math.max(0, Math.round(currentY / rowHeight));
      const col = Math.max(0, Math.min(Math.round(currentX / colWidth), this.columns - this.dragInformation.width))

      // Reduce dragover recalculations when nothing changed
      if (this.dragInformation.currentY !== row || this.dragInformation.currentX !== col) {
        this.dragInformation.currentY = row;
        this.dragInformation.currentX = col;
        if (this.dragOverTimeout) {
          clearTimeout(this.dragOverTimeout);
        }
        this.dragOverTimeout = window.setTimeout(() => {
          this.skipCurrentViewTransition();
          if (this.dragInformation) {
            const draggedWidgetPosition = this.widgetPositionByIdentifier(this.dragInformation.identifier);
            draggedWidgetPosition.y = this.dragInformation.currentY;
            draggedWidgetPosition.x = this.dragInformation.currentX;
            this.widgetPositionChange(this.currentDashboard.widgetPositions[this.columns], draggedWidgetPosition);
          }
        }, 100);
      }
    }
  }

  private readonly handleLegacyWidgetRefreshEvent = (widget: DashboardWidgetPosition): void =>
  {
    const event = new CustomEvent<DashboardWidgetRefreshEventInterface>(
      DashboardActionEvent.widgetRefresh,
      {
        detail: { identifier: widget.identifier },
        bubbles: true,
        composed: true,
      }
    );
    this.dispatchEvent(event);
  }

  private initializeCurrentDashboard(): void {
    this.currentDashboard.widgetPositions = this.currentDashboard.widgetPositions ?? {};
    let items = this.currentDashboard.widgetPositions?.[this.columns] ?? [];
    const widgetSizeWidth: Record<string, number> = { small: 1, medium: 2, large: 4 };
    const widgetSizeHeight: Record<string, number> = { small: 1, medium: 2, large: 3 };

    this.currentDashboard.widgets.forEach(widget => {
      if (items.find(widgetPosition => widgetPosition.identifier === widget.identifier) === undefined) {
        const height = widgetSizeHeight[widget.height] ?? 1;
        const width = widgetSizeWidth[widget.width] ?? 1;
        const widgetPosition: DashboardWidgetPosition = {
          identifier: widget.identifier,
          height: height,
          width: width < this.columns ? width : this.columns,
          y: 0,
          x: 0,
        };
        items.push(widgetPosition);
      }
    });

    items = this.widgetPositionsArrange(items);
    this.widgetPositionsCollapseRows(items);
    this.currentDashboard.widgetPositions[this.columns] = items;
  }

  private widgetByIdentifier(identifier: string): DashboardWidgetConfigurationInterface | null {
    return this.currentDashboard.widgets.find(item => item.identifier === identifier) ?? null;
  }

  private widgetPositionByIdentifier(identifier: string): DashboardWidgetPosition | null {
    return this.currentDashboard.widgetPositions[this.columns].find(item => item.identifier === identifier) ?? null;
  }

  private widgetPositionCanPlace(widget: DashboardWidgetPosition, col: number, row: number, occupiedCells: Set<string>): boolean {
    if (col < 0 || col > this.columns - widget.width || row < 0) {
      return false;
    }

    return occupiedCells.isDisjointFrom(createSet({ ...widget, x: col, y: row }));
  }

  private widgetPositionChange(items: DashboardWidgetPosition[], changedItem: DashboardWidgetPosition): void {
    // For the drag, we need to access the initial position of the widgets
    // and reevaluate them them every time. If dragInformation is not set we
    // directly work on the dataset that is also used for later rendering.
    let initialPositions = structuredClone(this.dragInformation?.initialPositions ?? items);
    //const itemsCopy = initialPositions.map(item => ({ ...item }));
    const index = initialPositions.findIndex((widget) => widget.identifier === changedItem.identifier);

    let origItem: DashboardWidgetPosition;
    if (index > -1) {
      const [item] = initialPositions.splice(index, 1);
      origItem = { ...item };
      item.y = changedItem.y;
      item.x = changedItem.x;
      initialPositions.unshift(item);
    }

    initialPositions = this.widgetPositionsArrange(initialPositions, this.dragInformation?.initialPositions ?? items, origItem);
    items.forEach(originalItem => {
      const updatedItem = initialPositions.find(copyItem => copyItem.identifier === originalItem.identifier);
      originalItem.y = updatedItem.y;
      originalItem.x = updatedItem.x;
    });
    this.widgetPositionsCollapseRows(items);
    this.useViewTransition = true;
    this.requestUpdate();
  }

  private widgetTryPlacementInNeighbourCells(
    item: DashboardWidgetPosition,
    occupiedCells: Set<string>,
    allowedDistance?: { height: number, width: number }
  ): DashboardWidgetPosition | null {
    const maxCol = this.columns;
    // Try place left on the same row, moving max 1 position
    for (let newCol = item.x; newCol >= Math.max(0, item.x - item.width); newCol--) {
      if (this.widgetPositionCanPlace(item, newCol, item.y, occupiedCells)) {
        return {
          ...item,
          x: newCol
        }
      }
    }

    // Try place above, moving max 1 position
    for (let newRow = item.y; newRow >= 0; newRow--) {
      if (this.widgetPositionCanPlace(item, item.x, newRow, occupiedCells)) {
        return {
          ...item,
          y: newRow
        }
      }
    }

    // Try place right on the same row, moving max 1 position
    for (let newCol = item.x; newCol <= Math.min(maxCol, item.x + item.width); newCol++) {
      if (this.widgetPositionCanPlace(item, newCol, item.y, occupiedCells)) {
        return {
          ...item,
          x: newCol
        }
      }
    }

    // Try place below, moving max 1 position
    for (let newRow = item.y; newRow <= item.y + (allowedDistance?.height ?? 3); newRow++) {
      if (this.widgetPositionCanPlace(item, item.x, newRow, occupiedCells)) {
        return {
          ...item,
          y: newRow
        }
      }
    }

    return null;
  }

  private widgetPositionsArrange(
    items: DashboardWidgetPosition[],
    origItems?: DashboardWidgetPosition[],
    origItem?: DashboardWidgetPosition
  ): DashboardWidgetPosition[] {

    let occupiedCells = new Set<string>();
    const occupy = (widgetPosition: DashboardWidgetPosition): DashboardWidgetPosition => {
      occupiedCells = occupiedCells.union(createSet(widgetPosition));
      return widgetPosition;
    };

    const placeInCurrentPosition = (item: DashboardWidgetPosition) =>
      this.widgetPositionCanPlace(item, item.x, item.y, occupiedCells) ? { ...item } : null;

    const placeInNeighboursWithoutShiftingPreviousArrangements = (item: DashboardWidgetPosition) => origItems === undefined ? null :
      this.widgetTryPlacementInNeighbourCells(
        item,
        // Create an occupy map that contains all cells from the previous arrangement
        // and the cells that have already been occupied in this run.
        // => Do this do find a "free" slot (without having to move existing widget) for this widget
        origItems
          .reduce((set, item) => set.union(createSet(item)), new Set<string>())
          .difference(createSet(origItem))
          .union(occupiedCells),
        // allow items to be moved to "free" places by the dimension of the moved item (allowing items to swap)
        origItem
      );

    const placeInNeighbours = (item: DashboardWidgetPosition) =>
      this.widgetTryPlacementInNeighbourCells(item, occupiedCells);

    const placeSomewhere = (item: DashboardWidgetPosition) => {
      const row = Math.max(0, item.y);
      const col = Math.max(0, Math.min(this.columns - item.width, item.x));
      const minCol = Math.max(0, col);
      const maxCol = this.columns;
      for (let newRow = item.y; newRow < (row + 100); newRow++) {
        for (let newCol = minCol; newCol < maxCol; newCol++) {
          if (this.widgetPositionCanPlace(item, newCol, newRow, occupiedCells)) {
            return { ...item, x: newCol, y: newRow };
          }
        }
      }
      throw new Error('Logic error: could not occupy cells');
    };

    return items.map(item => occupy(
      placeInCurrentPosition(item) ??
      placeInNeighboursWithoutShiftingPreviousArrangements(item) ??
      placeInNeighbours(item) ??
      placeSomewhere(item)
    ));
  }

  private widgetPositionsCollapseRows(items: DashboardWidgetPosition[]): void {
    const rowsWithItems = new Set<number>();
    items.forEach(item => {
      for (let r = 0; r < item.height; r++) {
        rowsWithItems.add(item.y + r);
      }
    });
    const occupiedRows = Array.from(rowsWithItems).sort((a, b) => a - b);
    const rowMapping: Record<number, number> = {};
    let newRowIndex = 0;
    for (let i = 0; i <= Math.max(...occupiedRows); i++) {
      if (rowsWithItems.has(i)) {
        rowMapping[i] = newRowIndex++;
      }
    }

    items.forEach(item => {
      item.y = rowMapping[item.y];
    });
  }

  private widgetPositionsSort(items: DashboardWidgetPosition[]): void {
    items.sort((a, b) => {
      if (a.y !== b.y) {
        return a.y - b.y;
      }
      return a.x - b.x;
    });
  }
}

@customElement('typo3-dashboard-widget')
export class DashboardWidget extends LitElement {
  @property({ type: String, reflect: true }) public identifier: string;
  @state() moving: boolean = false;

  private triggerContentRenderedEvent: boolean = false;

  private readonly fetchTask = new Task(this, {
    args: () => [this.identifier] as const,
    task: async ([identifier], { signal }): Promise<DashboardWidgetInterface> => {
      const url = TYPO3.settings.ajaxUrls.dashboard_widget_get;
      const response = await new AjaxRequest(url)
        .withQueryArguments({ widget: identifier })
        .get({ signal });
      return await response.resolve();
    },
    onComplete: async () => {
      this.triggerContentRenderedEvent = true;
    },
    onError: (error: Error|AjaxResponse) => {
      if (error instanceof AjaxResponse) {
        Notification.error('', error.response.status + ' ' + error.response.statusText, 5);
      } else {
        Notification.error('', `Error while retrieving widget [${this.identifier}] content: ${error.message}`);
      }
    },
  })

  private get widget(): DashboardWidgetInterface | null {
    return this.fetchTask.value ?? null;
  }

  public refresh(): void {
    this.handleRefresh();
  }

  protected override createRenderRoot(): HTMLElement | ShadowRoot {
    return this;
  }

  protected override updated(): void {
    if (this.triggerContentRenderedEvent) {
      this.triggerContentRenderedEvent = false;
      const eventInitDict = <EventInit>{
        bubbles: true,
      };
      this.dispatchEvent(new CustomEvent(DashboardActionEvent.widgetContentRendered, { ...eventInitDict, detail: this.widget.eventdata }));
      // @deprecated v14
      this.dispatchEvent(new CustomEvent('widgetContentRendered', { ...eventInitDict, detail: this.widget.eventdata }));
    }
  }

  protected override render(): TemplateResult | symbol {
    const loader = html`
      <div class="widget-loader">
          <typo3-backend-icon identifier="spinner-circle" size="medium"></typo3-backend-icon>
      </div>
    `;

    const widgetLabel = (widget: DashboardWidgetInterface | null) => widget?.label || 'ERROR';

    const widgetContent = (widget: DashboardWidgetInterface | null) => widget
      ? unsafeHTML(widget.content)
      : html`<div class="widget-content-main">${lll('widget.error')}</div>`;

    /* eslint-disable @stylistic/indent */
    const widgetRenderer = (widget: DashboardWidgetInterface | null, loading: boolean = false) => html`
        <div class="widget-header">
          <div class="widget-title">${widgetLabel(widget)}</div>
          <div class="widget-actions">
            ${widget.options?.refreshAvailable
              ? html`
                <button
                  type="button"
                  title=${lll('widget.refresh')}
                  class="widget-action widget-action-refresh"
                  @click=${this.handleRefresh}
                >
                  ${loading ? html`<typo3-backend-spinner size="small"></typo3-backend-spinner>` : html`<typo3-backend-icon identifier="actions-refresh" size="small"></typo3-backend-icon>`}
                  <span class="visually-hidden">${lll('widget.refresh')}</span>
                </button>
                `
              : nothing
            }
            <button
              type="button"
              title=${lll('widget.move')}
              class="widget-action widget-action-move"
              @click=${this.handleMoveClick}
              @focusout=${this.handleMoveFocusOut}
              @keydown=${this.handleMoveKeyDown}
            >
              <typo3-backend-icon identifier=${this.moving ? 'actions-thumbtack' : 'actions-move'} size="small"></typo3-backend-icon>
              <span class="visually-hidden">${lll('widget.move')}</span>
            </button>
            <button
              type="button"
              title=${lll('widget.remove')}
              class="widget-action widget-action-remove"
              @click=${this.handleRemove}
            >
              <typo3-backend-icon identifier="actions-delete" size="small"></typo3-backend-icon>
              <span class="visually-hidden">${lll('widget.remove')}</span>
            </button>
          </div>
        </div>
        <div class="widget-content">${widgetContent(widget)}</div>
      `;

    const content = this.fetchTask.render({
      initial: () => nothing,
      error: () => widgetRenderer(null),
      pending: () => this.fetchTask.value ?
        // Preserve old content if refreshing, but show a spinning icon
        widgetRenderer(this.fetchTask.value, true) :
        // Delay the (initial) spinner by 80 ms to prevent flickering for fast connections.
        delay(80, () => loader),
      complete: (widget) => widgetRenderer(widget),
    });
    return html`<div class="widget ${this.moving ? ' widget-selected' : ''}">${content}</div>`;
  }

  private moveStart(): void {
    if (this.moving === false) {
      this.moving = true;
      top.document.dispatchEvent(new CustomEvent<DashboardWidgetMoveIntendEvent>(DashboardActionEvent.widgetMoveIntend, {
        detail: {
          identifier: this.widget.identifier,
          intend: DashboardWidgetMoveIntend.start,
        },
        bubbles: true,
        composed: true
      }));
    }
  }

  private moveEnd(): void {
    if (this.moving === true) {
      this.moving = false;
      top.document.dispatchEvent(new CustomEvent<DashboardWidgetMoveIntendEvent>(DashboardActionEvent.widgetMoveIntend, {
        detail: {
          identifier: this.widget.identifier,
          intend: DashboardWidgetMoveIntend.end,
        },
        bubbles: true,
        composed: true
      }));
    }
  }

  private handleMoveClick(): void
  {
    if (!this.moving) {
      this.moveStart();
    } else {
      this.moveEnd();
    }
  }

  private handleMoveFocusOut(): void {
    this.moveEnd();
  }

  private handleMoveKeyDown(event: KeyboardEvent): void {
    if (!this.moving) {
      return
    }

    const handledKeys = [
      'ArrowDown',
      'ArrowUp',
      'ArrowLeft',
      'ArrowRight',
      'Home',
      'End',
      'Enter',
      'Space',
      'Escape',
      'Tab',
    ];
    if (!handledKeys.includes(event.code) || event.altKey || event.ctrlKey) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    let intend: DashboardWidgetMoveIntend = DashboardWidgetMoveIntend.end;
    switch (event.code) {
      case 'Escape':
      case 'Enter':
      case 'Space':
        this.moveEnd();
        return;
      case 'ArrowUp':
        intend = DashboardWidgetMoveIntend.up;
        break;
      case 'ArrowDown':
        intend = DashboardWidgetMoveIntend.down;
        break;
      case 'ArrowLeft':
        intend = DashboardWidgetMoveIntend.left;
        break;
      case 'ArrowRight':
        intend = DashboardWidgetMoveIntend.right;
        break;
      default:
        return;
    }

    top.document.dispatchEvent(new CustomEvent<DashboardWidgetMoveIntendEvent>(DashboardActionEvent.widgetMoveIntend, {
      detail: {
        identifier: this.widget.identifier,
        intend: intend,
      },
      bubbles: true,
      composed: true
    }));
  }

  private async handleRefresh(): Promise<void> {
    this.fetchTask.run()
  }

  private handleRemove(event: Event): void {
    const modal = Modal.confirm(
      lll('widget.remove.confirm.title'),
      lll('widget.remove.confirm.message'),
      SeverityEnum.warning, [
        {
          text: lll('widget.remove.button.close'),
          active: true,
          btnClass: 'btn-default',
          name: 'cancel',
        },
        {
          text: lll('widget.remove.button.ok'),
          btnClass: 'btn-warning',
          name: 'delete',
        },
      ]
    );

    modal.addEventListener('button.clicked', (e: Event): void => {
      const target = e.target as HTMLButtonElement;
      if (target.getAttribute('name') === 'delete') {
        const detail: DashboardWidgetRemoveEventInterface = { widget: this.identifier };
        top.document.dispatchEvent(new CustomEvent(DashboardActionEvent.widgetRemove, { detail: detail }));
      }
      modal.hideModal();
    });

    const trigger = event.currentTarget as HTMLButtonElement;
    modal.addEventListener('typo3-modal-hide', (): void => {
      trigger?.focus();
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'typo3-dashboard': Dashboard;
    'typo3-dashboard-widget': DashboardWidget;
  }
}
