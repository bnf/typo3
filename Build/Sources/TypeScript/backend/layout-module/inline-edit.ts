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

const editingClassName = 't3-page-ce-inline-editing';
const triggerSelector = 'button[data-action="content-element-inline-edit"]';

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

  constructor(private readonly contentElement: HTMLElement) {
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
    if (!FormEngine.hasChange()) {
      this.finish();
      return Promise.resolve(true);
    }
    return new Promise((resolve): void => {
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
              resolve(false);
            },
          },
          {
            text: altDocLabels.get('buttons.confirm.close_without_save.yes'),
            btnClass: 'btn-default',
            trigger: (_e, modal): void => {
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
      confirmModal.addEventListener('typo3-modal-hidden', (): void => resolve(false));
    });
  }

  /**
   * Resolves to true if the record has been saved without errors.
   */
  public async save(reloadForm: boolean = true): Promise<boolean> {
    if (this.isSaving) {
      return false;
    }
    if (document.activeElement instanceof HTMLElement && formElement.contains(document.activeElement)) {
      // Blur the focused field to trigger FormEngine's value normalization
      document.activeElement.blur();
    }
    if (!FormEngineValidation.isValid()) {
      FormEngineValidation.showErrorModal();
      return false;
    }
    this.isSaving = true;
    try {
      const response = await new AjaxRequest(TYPO3.settings.ajaxUrls.page_layout_inline_edit_save)
        .withQueryArguments({ table: this.table, uid: this.uid })
        .post(new FormData(formElement));
      const result: InlineEditSaveResponse = await response.resolve();
      if (!result.success) {
        result.messages.forEach((message: string): void => Notification.error(altDocLabels.get('notification.record_saved.title.singular'), message));
        return false;
      }
      this.hasSaved = true;
      Notification.success(
        altDocLabels.get('notification.record_saved.title.singular'),
        result.title !== '' ? altDocLabels.get('notification.record_saved.message', [result.title]) : undefined,
      );
      if (reloadForm) {
        // Reload the form, so that relations created on save are not submitted as new ones again
        await this.loadForm();
        this.focusFirstField();
      }
      return true;
    } catch (error) {
      await this.reportError(error);
      return false;
    } finally {
      this.isSaving = false;
    }
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
      this.createButton('button', 'btn-default t3js-inline-edit-close', 'actions-close', commonLabels.get('close')),
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
      button.name = '_savedok';
      button.value = '1';
      button.setAttribute('form', formElement.id);
    }
    button.innerHTML = `<typo3-backend-icon identifier="${icon}" size="small"></typo3-backend-icon> `;
    button.append(label);
    return button;
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
      this.trigger?.focus();
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
      importedElement.querySelector<HTMLElement>(triggerSelector)?.focus();
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
  activeSession?.save();
}, { capture: true });

async function toggleInlineEditing(contentElement: HTMLElement): Promise<void> {
  if (activeSession !== null) {
    const isOwnSession = activeSession.owns(contentElement);
    if (!await activeSession.requestClose() || isOwnSession) {
      return;
    }
  }
  activeSession = new InlineEditSession(contentElement);
  await activeSession.open();
}

new RegularEvent('click', (event: Event, trigger: HTMLElement): void => {
  event.preventDefault();
  const contentElement = trigger.closest<HTMLElement>('.t3js-page-ce');
  if (contentElement !== null) {
    toggleInlineEditing(contentElement);
  }
}).delegateTo(document, triggerSelector);

new RegularEvent('click', (event: Event): void => {
  event.preventDefault();
  activeSession?.requestClose();
}).delegateTo(document, '.t3js-inline-edit-close');

/**
 * Edit links rendered by preview renderers open the inline form as well,
 * instead of the contextual edit sheet.
 */
const interceptPreviewEditLink = (event: Event): void => {
  if (event instanceof KeyboardEvent && !(event.type === 'keydown' && event.key === 'Enter') && !(event.type === 'keyup' && event.key === ' ')) {
    return;
  }
  const link = (event.target as Element | null)?.closest?.('.t3-page-ce-body typo3-backend-contextual-record-edit-trigger');
  const contentElement = link?.closest<HTMLElement>('.t3js-page-ce');
  if (!contentElement?.querySelector(triggerSelector) || link.closest('.t3js-page-ce') !== contentElement) {
    return;
  }
  event.preventDefault();
  event.stopPropagation();
  toggleInlineEditing(contentElement);
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
    toggleInlineEditing(contentElement);
  }
}).delegateTo(document, '.t3js-page-ce .t3-page-ce-body');
