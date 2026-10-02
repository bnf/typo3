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
 * FormEngine works on a single form named "editform" per document and binds
 * its validation to that very element, so all inline edit sessions share it.
 */
const formElement = document.createElement('form');
formElement.name = 'editform';
formElement.id = 'PageLayoutInlineEdit';
formElement.className = 't3-page-ce-inline-edit-form';
formElement.noValidate = true;
let formEngineInitialized = false;
let activeSession: InlineEditSession | null = null;

/**
 * Module: @typo3/backend/layout-module/inline-edit
 *
 * Replaces the preview of a content element in the page module with a
 * reduced FormEngine form, persists it via AJAX and refreshes the element
 * once editing has finished.
 */
class InlineEditSession {
  private readonly container: HTMLDivElement;
  private readonly previewElement: HTMLElement | null;
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

  public owns(contentElement: HTMLElement): boolean {
    return this.contentElement === contentElement;
  }

  public async open(): Promise<void> {
    this.contentElement.classList.add(editingClassName);
    this.trigger?.setAttribute('aria-pressed', 'true');
    this.trigger?.classList.add('active');
    (this.previewElement ?? this.contentElement.querySelector('.t3-page-ce-header'))?.after(this.container);
    try {
      await this.loadForm();
    } catch (error) {
      await this.reportError(error);
      this.finish();
      return;
    }
    if (this.previewElement !== null) {
      this.previewElement.hidden = true;
    }
    this.focusFirstField();
  }

  /**
   * Resolves to true once the form has been closed, or to false if the
   * editor decided to keep editing.
   */
  public requestClose(): Promise<boolean> {
    const focusedField = this.blurFocusedField();
    if (!FormEngine.hasChange()) {
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

  public async saveAndClose(): Promise<void> {
    if (await this.save(false)) {
      this.finish();
    }
  }

  /**
   * Resolves to true if the record has been saved without errors.
   */
  public async save(reloadForm: boolean = true): Promise<boolean> {
    if (this.isSaving) {
      return false;
    }
    const focusedFieldName = this.blurFocusedField()?.dataset.formengineInputName;
    if (!FormEngineValidation.isValid()) {
      FormEngineValidation.showErrorModal();
      return false;
    }
    let result: InlineEditSaveResponse;
    this.isSaving = true;
    // Input while the record is saved and the form is reloaded would get lost
    this.container.inert = true;
    this.container.setAttribute('aria-busy', 'true');
    try {
      const response = await new AjaxRequest(TYPO3.settings.ajaxUrls.page_layout_inline_edit_save)
        .withQueryArguments({ table: this.table, uid: this.uid })
        .post(new FormData(formElement));
      result = await response.resolve();
      if (result.success) {
        this.hasSaved = true;
        if (reloadForm) {
          // Reload the form, so that relations created on save are not submitted as new ones again
          await this.loadForm();
        }
      }
    } catch (error) {
      await this.reportError(error);
      return false;
    } finally {
      this.isSaving = false;
      this.container.inert = false;
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
        ? formElement.querySelector<HTMLElement>(`[data-formengine-input-name="${CSS.escape(focusedFieldName)}"]:not([type="hidden"])`)
        : null;
      if (focusedField !== null) {
        focusedField.focus({ preventScroll: true });
      } else {
        this.focusFirstField();
      }
    }
    return true;
  }

  private async loadForm(): Promise<void> {
    const response = await new AjaxRequest(TYPO3.settings.ajaxUrls.page_layout_inline_edit)
      .withQueryArguments({ table: this.table, uid: this.uid, returnUrl: window.location.href })
      .get();
    const result: InlineEditFormResponse = await response.resolve();
    this.editUrl = result.editUrl;
    this.contextualEditUrl = result.contextualEditUrl;

    formElement.innerHTML = result.html;
    this.container.replaceChildren(formElement, this.renderActions());
    this.applyAssets(result);

    if (!formEngineInitialized) {
      formEngineInitialized = true;
      await new Promise<void>((resolve): void => {
        formElement.addEventListener('typo3:form-engine:ready', (): void => resolve(), { once: true });
        FormEngine.initialize(result.browserUrl);
      });
    } else {
      FormEngineValidation.initializeInputFields();
      FormEngineValidation.validate();
      FormEngine.reinitialize();
    }
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

  private renderActions(): HTMLDivElement {
    const actions = document.createElement('div');
    actions.className = 't3-page-ce-inline-edit-actions';

    const buttons = document.createElement('div');
    buttons.className = 't3-page-ce-inline-edit-buttons';
    buttons.append(
      this.createButton('submit', 'btn-primary', 'actions-document-save', commonLabels.get('save')),
      this.createButton('button', 'btn-default t3js-inline-edit-discard', 'actions-undo', layoutLabels.get('inlineEdit.discard')),
    );
    actions.append(buttons);

    if (this.editUrl !== '') {
      const fullEditLink = document.createElement('a');
      fullEditLink.className = 'btn btn-sm btn-default btn-borderless t3js-inline-edit-full';
      fullEditLink.href = this.editUrl;
      fullEditLink.innerHTML = '<typo3-backend-icon identifier="actions-expand" size="small"></typo3-backend-icon> ';
      fullEditLink.append(altDocLabels.get('openFullEditView'));
      actions.append(fullEditLink);
    }
    return actions;
  }

  private createButton(type: 'submit' | 'button', className: string, icon: string, label: string): HTMLButtonElement {
    const button = document.createElement('button');
    button.type = type;
    button.className = `btn btn-sm ${className}`;
    if (type === 'submit') {
      // FormEngine's "save and close" hotkey submits the form with this button
      button.name = '_saveandclosedok';
      button.value = '1';
      button.setAttribute('form', formElement.id);
    }
    button.innerHTML = `<typo3-backend-icon identifier="${icon}" size="small"></typo3-backend-icon> `;
    button.append(label);
    return button;
  }

  /**
   * FormEngine normalizes a value and registers it as changed only once its
   * field loses focus, which has to happen before the form is checked.
   */
  private blurFocusedField(): HTMLElement | null {
    const focusedElement = document.activeElement;
    if (!(focusedElement instanceof HTMLElement) || !formElement.contains(focusedElement)) {
      return null;
    }
    focusedElement.blur();
    return focusedElement;
  }

  private focusOpener(contentElement: HTMLElement): void {
    // The element shrinks once the form is gone, which may move it below the sticky doc header
    contentElement.scrollIntoView({ block: 'nearest' });
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
    formElement.querySelector<HTMLElement>('.form-control:not([type="hidden"]):not([disabled])')?.focus({ preventScroll: true });
  }

  private finish(): void {
    if (activeSession === this) {
      activeSession = null;
    }
    this.container.remove();
    formElement.replaceChildren();
    if (this.previewElement !== null) {
      this.previewElement.hidden = false;
    }
    this.contentElement.classList.remove(editingClassName);
    this.trigger?.setAttribute('aria-pressed', 'false');
    this.trigger?.classList.remove('active');
    if (this.hasSaved) {
      this.refreshContentElement();
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
      const importedElement = document.importNode(updatedElement, true);
      this.contentElement.replaceWith(importedElement);
      this.focusOpener(importedElement);
    } catch {
      window.location.reload();
    }
  }

  private async reportError(error: unknown): Promise<void> {
    let messages: string[] = [];
    if (error && typeof (error as AjaxResponse).resolve === 'function') {
      try {
        messages = ((await (error as AjaxResponse).resolve()) as InlineEditSaveResponse).messages ?? [];
      } catch {
        // The response is not JSON, e.g. a server error page
      }
    }
    Notification.error(altDocLabels.get('noEditForm'), messages.join(' ') || undefined);
  }
}

formElement.addEventListener('submit', (event: SubmitEvent): void => {
  // Never let FormEngine's submit handling navigate the page module
  event.preventDefault();
  event.stopImmediatePropagation();
  // FormEngine appends hidden action fields if no matching submit button exists
  const actionFields = formElement.querySelectorAll<HTMLInputElement>('input[type="hidden"][name^="_save"]');
  const close = event.submitter?.getAttribute('name') === '_saveandclosedok'
    || Array.from(actionFields).some((field): boolean => field.name === '_saveandclosedok');
  actionFields.forEach((field): void => field.remove());
  if (close) {
    activeSession?.saveAndClose();
  } else {
    activeSession?.save();
  }
}, { capture: true });

async function toggleInlineEditing(contentElement: HTMLElement, opener: InlineEditOpener): Promise<void> {
  if (activeSession !== null) {
    const isOwnSession = activeSession.owns(contentElement);
    if (!await activeSession.requestClose() || isOwnSession) {
      return;
    }
  }
  activeSession = new InlineEditSession(contentElement, opener);
  await activeSession.open();
}

new RegularEvent('click', (event: Event, trigger: HTMLElement): void => {
  event.preventDefault();
  const contentElement = trigger.closest<HTMLElement>('.t3js-page-ce');
  if (contentElement !== null) {
    toggleInlineEditing(contentElement, 'trigger');
  }
}).delegateTo(document, triggerSelector);

new RegularEvent('click', (event: Event): void => {
  event.preventDefault();
  activeSession?.requestClose();
}).delegateTo(document, '.t3js-inline-edit-discard');

new RegularEvent('keydown', (event: KeyboardEvent): void => {
  // Widgets inside the form, like the panels of the rich text editor, close on escape themselves
  if (event.key !== 'Escape' || event.defaultPrevented || activeSession === null) {
    return;
  }
  if ((event.target as Element | null)?.closest?.('.t3-page-ce-inline-edit')) {
    event.preventDefault();
    activeSession.requestClose();
  }
}).bindTo(document);

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
  if (!contentElement?.querySelector(triggerSelector) || link.closest('.t3js-page-ce') !== contentElement) {
    return;
  }
  event.preventDefault();
  event.stopPropagation();
  toggleInlineEditing(contentElement, 'previewLink');
};
['click', 'keydown', 'keyup'].forEach((type: string): void => document.addEventListener(type, interceptPreviewEditLink, { capture: true }));

new RegularEvent('click', (event: Event): void => {
  event.preventDefault();
  activeSession?.openFullEditView();
}).delegateTo(document, '.t3js-inline-edit-full');

new RegularEvent('dblclick', (event: Event, previewElement: HTMLElement): void => {
  const contentElement = previewElement.closest<HTMLElement>('.t3js-page-ce');
  if (contentElement?.querySelector(triggerSelector)) {
    event.preventDefault();
    window.getSelection()?.removeAllRanges();
    toggleInlineEditing(contentElement, 'element');
  }
}).delegateTo(document, '.t3js-page-ce .t3-page-ce-body');
