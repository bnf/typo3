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

import AjaxRequest from '@typo3/core/ajax/ajax-request';
import type { AjaxResponse } from '@typo3/core/ajax/ajax-response';
import { JavaScriptItemProcessor, type JavaScriptItem } from '@typo3/core/java-script-item-processor';
import RegularEvent from '@typo3/core/event/regular-event';
import FormEngine from '@typo3/backend/form-engine';
import FormEngineValidation from '@typo3/backend/form-engine-validation';
import Modal from '@typo3/backend/modal';
import Notification from '@typo3/backend/notification';
import Severity from '@typo3/backend/severity';
import Utility from '@typo3/backend/utility';
import '@typo3/backend/element/icon-element';
import { ContextualRecordEditTriggerElement } from '@typo3/backend/element/contextual-record-edit-trigger';
import altDocLabels from '~labels/backend.alt_doc';
import commonLabels from '~labels/core.common';
import layoutLabels from '~labels/backend.layout';

type InlineEditFormResponse = {
  html: string;
  title: string;
  editUrl: string;
  contextualEditUrl: string;
  browserUrl: string;
  stylesheetFiles: string[];
  inlineData: object;
  scriptItems: JavaScriptItem[];
};

type InlineEditSaveResponse = {
  success: boolean;
  messages: string[];
  title: string;
};

/**
 * What opened the form, and gets the focus back once it is closed
 */
type InlineEditOpener = 'trigger' | 'previewLink' | 'element';

const editingClassName = 't3-page-ce-inline-editing';
const triggerSelector = 'button[data-action="content-element-inline-edit"]';
const previewLinkSelector = '.t3-page-ce-body typo3-backend-contextual-record-edit-trigger';

/**
 * FormEngine works on the one form named "editform" of the document. The page
 * module provides it around its content, so the fields of all content elements
 * edited at the same time are part of it, like several records in the full
 * editing view.
 */
const getFormElement = (): HTMLFormElement | null => document.forms.namedItem('editform');
const sessions = new Map<HTMLElement, InlineEditSession>();
const pendingRefreshes = new Map<string, Promise<void>>();
let formEngineReady: Promise<void> | null = null;
let lastFocusedSession: InlineEditSession | null = null;

const getElementBox = (contentElement: HTMLElement): HTMLElement => contentElement.querySelector<HTMLElement>('.t3-page-ce-element') ?? contentElement;
const endHeightTransitions = new WeakMap<HTMLElement, () => void>();

/**
 * Lets the height of a content element glide to its new height once its
 * content has been changed, instead of letting the page module jump. Content
 * that grows afterwards, like a rich text editor, is followed as well.
 */
function transitionHeight(box: HTMLElement, change: () => HTMLElement | void): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    change();
    return;
  }
  const fromHeight = box.offsetHeight;
  const targetBox = change() || box;
  endHeightTransitions.get(targetBox)?.();
  const borderHeight = targetBox.offsetHeight - targetBox.clientHeight;
  targetBox.style.height = `${fromHeight}px`;
  // Apply the start height before the transition is enabled
  void targetBox.offsetHeight;
  targetBox.style.transition = 'height .2s ease-out';
  let idleTimeout: number;
  const end = (): void => {
    observer.disconnect();
    window.clearTimeout(idleTimeout);
    window.clearTimeout(maxTimeout);
    targetBox.style.removeProperty('height');
    targetBox.style.removeProperty('transition');
    endHeightTransitions.delete(targetBox);
  };
  const update = (): void => {
    targetBox.style.height = `${targetBox.scrollHeight + borderHeight}px`;
    window.clearTimeout(idleTimeout);
    idleTimeout = window.setTimeout(end, 300);
  };
  const observer = new ResizeObserver(update);
  Array.from(targetBox.children).forEach((child: Element): void => observer.observe(child));
  const maxTimeout = window.setTimeout(end, 3000);
  endHeightTransitions.set(targetBox, end);
  update();
}

/**
 * Module: @typo3/backend/layout-module/inline-edit
 *
 * Replaces the preview of a content element in the page module with a
 * reduced FormEngine form, persists it via AJAX and refreshes the element
 * once editing has finished.
 */
class InlineEditSession {
  private readonly container: HTMLDivElement;
  private readonly headerActions: HTMLDivElement;
  private readonly fullEditLink: HTMLAnchorElement;
  private readonly cancelButton: HTMLButtonElement;
  private readonly previewElement: HTMLElement | null;
  private readonly fieldsElement: HTMLDivElement;
  private editUrl: string = '';
  private contextualEditUrl: string = '';
  private hasSaved: boolean = false;
  private isSaving: boolean = false;

  constructor(
    private readonly contentElement: HTMLElement,
    private readonly opener: InlineEditOpener,
  ) {
    this.previewElement = contentElement.querySelector<HTMLElement>('.t3-page-ce-body');
    this.container = document.createElement('div');
    this.container.className = 't3-page-ce-inline-edit';
    this.fieldsElement = document.createElement('div');
    this.fieldsElement.className = 't3-page-ce-inline-edit-form';
    this.headerActions = document.createElement('div');
    this.headerActions.className = 'btn-group btn-group-sm t3-page-ce-inline-edit-header-actions';
    this.headerActions.append(
      this.createButton('btn-primary t3js-inline-edit-save', 'actions-document-save', commonLabels.get('save')),
    );
    this.cancelButton = document.createElement('button');
    this.cancelButton.type = 'button';
    this.cancelButton.className = 'btn btn-sm btn-default btn-borderless t3js-inline-edit-cancel';
    this.cancelButton.title = commonLabels.get('cancel');
    this.cancelButton.setAttribute('aria-label', commonLabels.get('cancel'));
    this.cancelButton.innerHTML = '<typo3-backend-icon identifier="actions-close" size="small"></typo3-backend-icon>';
    this.fullEditLink = document.createElement('a');
    this.fullEditLink.className = 't3-page-ce-inline-edit-full-link t3js-inline-edit-full';
    this.fullEditLink.title = altDocLabels.get('openFullEditView');
    this.fullEditLink.setAttribute('aria-label', altDocLabels.get('openFullEditView'));
    this.fullEditLink.innerHTML = '<typo3-backend-icon identifier="actions-expand" size="small"></typo3-backend-icon>';
  }

  private get table(): string {
    return this.contentElement.dataset.table ?? '';
  }

  private get uid(): string {
    return this.contentElement.dataset.uid ?? '';
  }

  private get trigger(): HTMLElement | null {
    return this.contentElement.querySelector<HTMLElement>(triggerSelector);
  }

  /**
   * Continues editing with all fields of the record in the contextual edit
   * sheet, or in the full editing view if the editor disabled the sheet.
   */
  public async openFullEditView(): Promise<void> {
    if (!await this.requestClose()) {
      return;
    }
    const trigger = new ContextualRecordEditTriggerElement();
    trigger.url = this.contextualEditUrl;
    trigger.editUrl = this.editUrl;
    trigger.context = this.table;
    trigger.click();
  }

  /**
   * Whether the element is part of the form or the actions of this session
   */
  public contains(element: Element): boolean {
    return this.container.contains(element)
      || this.headerActions.contains(element)
      || this.cancelButton.contains(element)
      || this.fullEditLink.contains(element);
  }

  public hasChange(): boolean {
    return this.container.querySelector('.has-change') !== null;
  }

  public async open(): Promise<void> {
    sessions.set(this.contentElement, this);
    changeObserver.observe(this.container, { subtree: true, attributes: true, attributeFilter: ['class'] });
    this.contentElement.classList.add(editingClassName);
    let rendered: Promise<void>;
    try {
      const result = await this.fetchForm();
      if (sessions.get(this.contentElement) !== this) {
        // Closed again while the form was loaded
        return;
      }
      // The form replaces the preview in one step, while it is shown already, so that
      // its fields, like the rich text editor, are initialized with their actual size
      transitionHeight(getElementBox(this.contentElement), (): void => {
        (this.previewElement ?? this.contentElement.querySelector('.t3-page-ce-header'))?.after(this.container);
        if (this.previewElement !== null) {
          this.previewElement.hidden = true;
        }
        rendered = this.renderForm(result);
      });
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        this.container.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: 'ease-out' });
      }
      await rendered;
    } catch (error) {
      await this.reportError(altDocLabels.get('noEditForm'), error);
      this.finish();
      return;
    }
    // "Cancel" takes the place of the edit button, as it closes the form again. "Save"
    // precedes the actions of the header, next to the rarely needed full editing view.
    const trigger = this.trigger;
    if (trigger !== null) {
      trigger.hidden = true;
      trigger.before(this.cancelButton);
    }
    const headerToolbar = this.contentElement.querySelector<HTMLElement>('.t3-page-ce-header-right .btn-toolbar');
    if (headerToolbar !== null) {
      headerToolbar.prepend(this.fullEditLink, this.headerActions);
    } else {
      this.contentElement.querySelector('.t3-page-ce-header-right')?.append(this.fullEditLink, this.headerActions, this.cancelButton);
    }
    this.focusFirstField();
  }

  /**
   * Resolves to true once the form has been closed, or to false if the
   * editor decided to keep editing.
   */
  public requestClose(): Promise<boolean> {
    const focusedField = this.blurFocusedField();
    if (!this.hasChange()) {
      this.finish();
      return Promise.resolve(true);
    }
    return new Promise((resolve): void => {
      let settled = false;
      const settle = (closed: boolean): void => {
        if (settled) {
          return;
        }
        settled = true;
        resolve(closed);
        if (!closed) {
          focusedField?.focus();
        }
      };
      const confirmModal = Modal.confirm(
        altDocLabels.get('label.confirm.close_without_save.title'),
        altDocLabels.get('label.confirm.close_without_save.content'),
        Severity.warning,
        [
          {
            text: altDocLabels.get('buttons.confirm.close_without_save.no'),
            btnClass: 'btn-default',
            trigger: (_e, modal): void => {
              modal.hideModal();
              settle(false);
            },
          },
          {
            text: altDocLabels.get('buttons.confirm.close_without_save.yes'),
            btnClass: 'btn-default',
            trigger: (_e, modal): void => {
              settled = true;
              modal.hideModal();
              this.finish();
              resolve(true);
            },
          },
          {
            text: altDocLabels.get('buttons.confirm.save_and_close'),
            btnClass: 'btn-primary',
            active: true,
            trigger: async (_e, modal): Promise<void> => {
              settled = true;
              modal.hideModal();
              const saved = await this.save(false);
              if (saved) {
                this.finish();
              }
              resolve(saved);
            },
          },
        ]
      );
      confirmModal.addEventListener('typo3-modal-hidden', (): void => settle(false));
    });
  }

  public async saveAndClose(): Promise<boolean> {
    if (!await this.save(false)) {
      return false;
    }
    this.finish();
    return true;
  }

  public hasErrors(): boolean {
    return this.container.querySelector('.' + FormEngineValidation.errorClass) !== null;
  }

  /**
   * Resolves to true if the record has been saved without errors.
   */
  public async save(reloadForm: boolean = true): Promise<boolean> {
    if (this.isSaving) {
      return false;
    }
    const focusedFieldName = this.blurFocusedField()?.dataset.formengineInputName;
    if (this.hasErrors()) {
      FormEngineValidation.showErrorModal();
      return false;
    }
    let result: InlineEditSaveResponse;
    this.isSaving = true;
    // Input while the record is saved and the form is reloaded would get lost
    this.container.inert = true;
    this.headerActions.inert = true;
    this.cancelButton.inert = true;
    this.fullEditLink.inert = true;
    this.container.setAttribute('aria-busy', 'true');
    try {
      const response = await new AjaxRequest(TYPO3.settings.ajaxUrls.page_layout_inline_edit_save)
        .withQueryArguments({ table: this.table, uid: this.uid })
        .post(this.collectFormData());
      result = await response.resolve();
      if (result.success) {
        this.hasSaved = true;
        if (reloadForm) {
          // Reload the form, so that relations created on save are not submitted as new ones again
          await this.loadForm();
        }
      }
    } catch (error) {
      await this.reportError(altDocLabels.get('notification.record_saved.title.singular'), error);
      return false;
    } finally {
      this.isSaving = false;
      this.container.inert = false;
      this.headerActions.inert = false;
      this.cancelButton.inert = false;
      this.fullEditLink.inert = false;
      this.container.removeAttribute('aria-busy');
    }

    if (!result.success) {
      result.messages.forEach((message: string): void => Notification.error(altDocLabels.get('notification.record_saved.title.singular'), message));
      return false;
    }
    Notification.success(
      altDocLabels.get('notification.record_saved.title.singular'),
      result.title !== '' ? altDocLabels.get('notification.record_saved.message', [result.title]) : undefined,
    );
    if (reloadForm) {
      const focusedField = focusedFieldName !== undefined
        ? this.fieldsElement.querySelector<HTMLElement>(`[data-formengine-input-name="${CSS.escape(focusedFieldName)}"]:not([type="hidden"])`)
        : null;
      if (focusedField) {
        focusedField.focus({ preventScroll: true });
      } else {
        this.focusFirstField();
      }
    }
    return true;
  }

  private async loadForm(): Promise<void> {
    await this.renderForm(await this.fetchForm());
  }

  private async fetchForm(): Promise<InlineEditFormResponse> {
    const response = await new AjaxRequest(TYPO3.settings.ajaxUrls.page_layout_inline_edit)
      .withQueryArguments({ table: this.table, uid: this.uid, returnUrl: window.location.href })
      .get();
    return await response.resolve();
  }

  private async renderForm(result: InlineEditFormResponse): Promise<void> {
    this.editUrl = result.editUrl;
    this.contextualEditUrl = result.contextualEditUrl;

    this.fullEditLink.href = this.editUrl;
    this.fullEditLink.hidden = this.editUrl === '';
    this.fieldsElement.innerHTML = result.html;
    this.container.replaceChildren(this.fieldsElement);
    this.applyAssets(result);
    await initializeFormEngine(result.browserUrl);
  }

  /**
   * Only the fields of this session are submitted, as the form contains the
   * fields of all content elements that are edited at the same time
   */
  private collectFormData(): FormData {
    const formData = new FormData();
    const fieldNames = new Set(
      Array.from(this.container.querySelectorAll('[name]')).map((field: Element): string => field.getAttribute('name'))
    );
    for (const [name, value] of new FormData(getFormElement())) {
      if (fieldNames.has(name)) {
        formData.append(name, value);
      }
    }
    return formData;
  }

  private applyAssets(result: InlineEditFormResponse): void {
    result.stylesheetFiles.filter((file: string): boolean => file !== '').forEach((file: string): void => {
      if (document.querySelector(`link[rel="stylesheet"][href="${CSS.escape(file)}"]`) !== null) {
        return;
      }
      const element = document.createElement('link');
      element.rel = 'stylesheet';
      element.href = file;
      document.head.append(element);
    });
    if (typeof result.inlineData === 'object') {
      TYPO3.settings.FormEngineInline = Utility.mergeDeep(TYPO3.settings.FormEngineInline ?? {}, result.inlineData) as typeof TYPO3.settings.FormEngineInline;
    }
    if (Array.isArray(result.scriptItems) && result.scriptItems.length > 0) {
      new JavaScriptItemProcessor().processItems(result.scriptItems);
    }
  }

  private createButton(className: string, icon: string, label: string): HTMLButtonElement {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `btn btn-sm ${className}`;
    button.title = label;
    button.innerHTML = `<typo3-backend-icon identifier="${icon}" size="small"></typo3-backend-icon> `;
    const labelElement = document.createElement('span');
    labelElement.className = 't3-page-ce-inline-edit-header-label';
    labelElement.textContent = label;
    button.append(labelElement);
    return button;
  }

  /**
   * FormEngine normalizes a value and registers it as changed only once its
   * field loses focus, which has to happen before the form is checked.
   */
  private blurFocusedField(): HTMLElement | null {
    const focusedElement = document.activeElement;
    if (!(focusedElement instanceof HTMLElement) || !this.fieldsElement.contains(focusedElement)) {
      return null;
    }
    focusedElement.blur();
    return focusedElement;
  }

  private focusOpener(contentElement: HTMLElement): void {
    if (this.opener === 'element') {
      if (!contentElement.hasAttribute('tabindex')) {
        contentElement.tabIndex = -1;
      }
      contentElement.focus({ preventScroll: true });
      return;
    }
    const opener = this.opener === 'previewLink' ? contentElement.querySelector<HTMLElement>(previewLinkSelector) : null;
    (opener ?? contentElement.querySelector<HTMLElement>(triggerSelector))?.focus({ preventScroll: true });
  }

  private focusFirstField(): void {
    this.fieldsElement.querySelector<HTMLElement>('.form-control:not([type="hidden"]):not([disabled])')?.focus({ preventScroll: true });
  }

  private finish(): void {
    if (sessions.get(this.contentElement) === this) {
      sessions.delete(this.contentElement);
    }
    updateSaveAllButton();
    if (lastFocusedSession === this) {
      lastFocusedSession = null;
    }
    transitionHeight(getElementBox(this.contentElement), (): void => {
      this.container.remove();
      if (this.previewElement !== null) {
        this.previewElement.hidden = false;
      }
    });
    this.headerActions.remove();
    this.cancelButton.remove();
    this.fullEditLink.remove();
    this.contentElement.classList.remove(editingClassName);
    if (this.trigger !== null) {
      this.trigger.hidden = false;
    }
    if (this.hasSaved) {
      const refresh = this.refreshContentElement();
      pendingRefreshes.set(this.contentElement.id, refresh);
      refresh.finally((): void => {
        if (pendingRefreshes.get(this.contentElement.id) === refresh) {
          pendingRefreshes.delete(this.contentElement.id);
        }
      });
    } else {
      this.focusOpener(this.contentElement);
    }
  }

  /**
   * Fetches the current page module view and swaps in the updated markup of
   * the edited content element, so the rest of the page keeps its state.
   */
  private async refreshContentElement(): Promise<void> {
    try {
      const response = await new AjaxRequest(window.location.href).get();
      const updatedElement = new DOMParser()
        .parseFromString(await response.raw().text(), 'text/html')
        .getElementById(this.contentElement.id);
      if (updatedElement === null) {
        window.location.reload();
        return;
      }
      const importedElement = document.importNode(updatedElement, true) as HTMLElement;
      transitionHeight(getElementBox(this.contentElement), (): HTMLElement => {
        this.contentElement.replaceWith(importedElement);
        return getElementBox(importedElement);
      });
      this.focusOpener(importedElement);
    } catch {
      window.location.reload();
    }
  }

  private async reportError(title: string, error: unknown): Promise<void> {
    let messages: string[] = [];
    if (error && typeof (error as AjaxResponse).resolve === 'function') {
      try {
        messages = ((await (error as AjaxResponse).resolve()) as InlineEditSaveResponse).messages ?? [];
      } catch {
        // The response is not JSON, e.g. a server error page
      }
    }
    Notification.error(title, messages.join(' ') || undefined);
  }
}

/**
 * FormEngine is initialized once for the form, fields loaded later on are
 * initialized on their own, as initializing it again would bind its
 * validation to the form once more.
 */
async function initializeFormEngine(browserUrl: string): Promise<void> {
  if (formEngineReady === null) {
    formEngineReady = new Promise<void>((resolve): void => {
      getFormElement().addEventListener('typo3:form-engine:ready', (): void => resolve(), { once: true });
      FormEngine.initialize(browserUrl);
    });
    await formEngineReady;
    return;
  }
  await formEngineReady;
  FormEngineValidation.initializeInputFields();
  FormEngineValidation.validate();
  FormEngine.reinitialize();
}

/**
 * The doc header offers to save all content elements with unsaved changes at once
 */
const saveAllButton = document.querySelector<HTMLButtonElement>('.t3js-inline-edit-save-all');
const saveAllLabel = document.createElement('span');
if (saveAllButton !== null) {
  Array.from(saveAllButton.childNodes)
    .filter((node: Node): boolean => node.nodeType === Node.TEXT_NODE)
    .forEach((node: Node): void => {
      saveAllButton.removeChild(node);
    });
  saveAllButton.append(saveAllLabel);
}

function getChangedSessions(): InlineEditSession[] {
  return Array.from(sessions.values()).filter((session: InlineEditSession): boolean => session.hasChange());
}

function updateSaveAllButton(): void {
  if (saveAllButton === null) {
    return;
  }
  const count = getChangedSessions().length;
  saveAllButton.hidden = count === 0;
  saveAllLabel.textContent = ' ' + layoutLabels.get('inlineEdit.saveAll', [String(count)]);
}

// FormEngine marks a changed field with a class, which is what the count follows
const changeObserver = new MutationObserver((): void => updateSaveAllButton());

async function saveAll(): Promise<void> {
  const changedSessions = getChangedSessions();
  // Fields are validated once they lose the focus
  (document.activeElement as HTMLElement | null)?.blur?.();
  const invalidSessions = changedSessions.filter((session: InlineEditSession): boolean => session.hasErrors());
  saveAllButton.disabled = true;
  try {
    for (const session of changedSessions.filter((session: InlineEditSession): boolean => !invalidSessions.includes(session))) {
      await session.saveAndClose();
    }
  } finally {
    saveAllButton.disabled = false;
    updateSaveAllButton();
  }
  if (invalidSessions.length > 0) {
    FormEngineValidation.showErrorModal();
  }
}

saveAllButton?.addEventListener('click', (event: Event): void => {
  event.preventDefault();
  saveAll();
});

function getSession(element: Element | null): InlineEditSession | null {
  const contentElement = element?.closest?.<HTMLElement>('.t3js-page-ce');
  return contentElement ? sessions.get(contentElement) ?? null : null;
}

async function openInlineEditing(contentElement: HTMLElement, opener: InlineEditOpener): Promise<void> {
  if (getFormElement() === null) {
    return;
  }
  const session = sessions.get(contentElement);
  if (session !== undefined) {
    await session.requestClose();
    return;
  }
  // A saved element is replaced by its refreshed markup, which has to be edited instead
  await pendingRefreshes.get(contentElement.id);
  if (!contentElement.isConnected) {
    const refreshedElement = document.getElementById(contentElement.id);
    if (refreshedElement === null || sessions.has(refreshedElement)) {
      return;
    }
    contentElement = refreshedElement;
  }
  await new InlineEditSession(contentElement, opener).open();
}

new RegularEvent('click', (event: Event, trigger: HTMLElement): void => {
  event.preventDefault();
  const contentElement = trigger.closest<HTMLElement>('.t3js-page-ce');
  if (contentElement !== null) {
    openInlineEditing(contentElement, 'trigger');
  }
}).delegateTo(document, triggerSelector);

new RegularEvent('click', (event: Event, button: HTMLElement): void => {
  event.preventDefault();
  getSession(button)?.saveAndClose();
}).delegateTo(document, '.t3js-inline-edit-save');

new RegularEvent('click', (event: Event, button: HTMLElement): void => {
  event.preventDefault();
  getSession(button)?.requestClose();
}).delegateTo(document, '.t3js-inline-edit-cancel');

new RegularEvent('keydown', (event: KeyboardEvent): void => {
  // Widgets inside the form, like the panels of the rich text editor, close on escape themselves
  if (event.key !== 'Escape' || event.defaultPrevented) {
    return;
  }
  const target = event.target as Element | null;
  const session = getSession(target);
  if (session !== null && session.contains(target)) {
    event.preventDefault();
    session.requestClose();
  }
}).bindTo(document);

// FormEngine's save hotkeys submit the form, which applies to the content element edited last
new RegularEvent('focusin', (event: FocusEvent): void => {
  const target = event.target as Element | null;
  const session = getSession(target);
  if (session !== null && session.contains(target)) {
    lastFocusedSession = session;
  }
}).bindTo(document);

getFormElement()?.addEventListener('submit', (event: SubmitEvent): void => {
  // Never let FormEngine's submit handling navigate the page module. Its submit
  // interceptor is skipped as well, as it would block any further submit once
  // a save failed.
  const formElement = event.currentTarget as HTMLFormElement;
  // FormEngine appends a hidden action field for the hotkey that has been used
  const actionFields = Array.from(formElement.querySelectorAll<HTMLInputElement>(':scope > input[type="hidden"][name^="_save"]'));
  if (actionFields.length === 0 && sessions.size === 0) {
    return;
  }
  event.preventDefault();
  event.stopImmediatePropagation();
  actionFields.forEach((field): void => field.remove());
  if (actionFields.length === 0 || lastFocusedSession === null) {
    return;
  }
  if (actionFields.some((field): boolean => field.name === '_saveandclosedok')) {
    lastFocusedSession.saveAndClose();
  } else {
    lastFocusedSession.save();
  }
}, { capture: true });

/**
 * Edit links rendered by preview renderers open the inline form as well,
 * instead of the contextual edit sheet.
 */
const interceptPreviewEditLink = (event: Event): void => {
  if (event instanceof KeyboardEvent && !(event.type === 'keydown' && event.key === 'Enter') && !(event.type === 'keyup' && event.key === ' ')) {
    return;
  }
  const link = (event.target as Element | null)?.closest?.(previewLinkSelector);
  const contentElement = link?.closest<HTMLElement>('.t3js-page-ce');
  if (!contentElement?.querySelector(triggerSelector)) {
    return;
  }
  event.preventDefault();
  event.stopPropagation();
  openInlineEditing(contentElement, 'previewLink');
};
['click', 'keydown', 'keyup'].forEach((type: string): void => document.addEventListener(type, interceptPreviewEditLink, { capture: true }));

new RegularEvent('click', (event: Event, link: HTMLElement): void => {
  event.preventDefault();
  getSession(link)?.openFullEditView();
}).delegateTo(document, '.t3js-inline-edit-full');

new RegularEvent('dblclick', (event: Event, previewElement: HTMLElement): void => {
  const contentElement = previewElement.closest<HTMLElement>('.t3js-page-ce');
  if (contentElement?.querySelector(triggerSelector)) {
    event.preventDefault();
    window.getSelection()?.removeAllRanges();
    openInlineEditing(contentElement, 'element');
  }
}).delegateTo(document, '.t3js-page-ce .t3-page-ce-body');
