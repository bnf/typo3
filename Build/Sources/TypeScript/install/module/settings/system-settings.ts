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

import { AbstractInteractableModule } from '../abstract-interactable-module';
import Router from '../../router';
import AjaxRequest from '@typo3/core/ajax/ajax-request';
import { topLevelModuleImport } from '@typo3/backend/utility/top-level-module-import';
import Notification from '@typo3/backend/notification';
import type { ModalElement } from '@typo3/backend/modal';
import type MessageInterface from '@typo3/install/message-interface';
import '@typo3/backend/settings/editor';

/**
 * Module: @typo3/install/module/system-settings
 */
class SystemSettings extends AbstractInteractableModule {
  public initialize(currentModal: ModalElement): void {
    super.initialize(currentModal);
    this.getContent();
  }

  private async getContent(): Promise<void> {
    const modalContent = this.getModalBody();
    let data: any;
    try {
      const response = await new AjaxRequest(Router.getUrl('systemSettingsGetData')).get({ cache: 'no-cache' });
      data = await response.resolve();
    } catch (error) {
      Router.handleAjaxError(error, modalContent);
      return;
    }

    // We can not load labels into the top frame via LLL api,
    // so we set them statically for now
    if (!('lang' in top.TYPO3)) {
      (top.TYPO3.lang as any) = {}
    }
    top.TYPO3.lang['edit.yamlExport'] ??= 'YAML export';
    top.TYPO3.lang['edit.resetSetting'] ??= 'Reset setting';
    top.TYPO3.lang['edit.copySettingsIdentifier'] ??= 'Copy identifier';
    top.TYPO3.lang['edit.searchTermVisuallyHiddenLabel'] ??= 'Search settings';
    top.TYPO3.lang['edit.searchTermPlaceholder'] ??= 'Search settings';
    top.TYPO3.lang['edit.search.noResultsTitle'] ??= 'No settings were found.';
    top.TYPO3.lang['edit.search.noResultsMessage'] ??= 'The search filters by setting value, label, description or identifier.';
    top.TYPO3.lang['edit.search.noResultsResetButtonLabel'] ??= 'Reset filter';
    top.TYPO3.lang['copyToClipboard.success'] ??= 'Copied to clipboard';
    top.TYPO3.lang['copyToClipboard.error'] ??= 'Could not be copied to clipboard';
    const isInIframe = window.location !== window.parent.location;
    if (isInIframe) {
      topLevelModuleImport('@typo3/backend/settings/editor.js')
    }

    const { success, systemSettingsWriteToken, categories } = data;

    // data.success is so dumb
    if (!success) {
      throw new Error('data.success is so dumb');
    }

    const container = top.document.createElement('div');
    container.classList.add('container');
    const editor = top.document.createElement('typo3-backend-settings-editor');

    if (!data.isWritable) {
      editor.setAttribute('readonly', '');
    }
    editor.categories = categories;
    editor.provideEvents = true;
    editor.addEventListener('typo3:settings-editor:submit', async (e: CustomEvent) => {
      e.detail.originalEvent.preventDefault();
      try {
        const response = await new AjaxRequest(Router.getUrl()).post({
          'install[action]': 'systemSettingsWrite',
          'install[token]': systemSettingsWriteToken,
          ...e.detail.formData,
        });
        const data = await response.resolve();
        if (data.success === true && Array.isArray(data.status)) {
          data.status.forEach((element: MessageInterface): void => {
            Notification.showMessage(element.title, element.message, element.severity);
          });
        } else {
          Notification.error('Something went wrong', 'The request was not processed successfully. Please check the browser\'s console and TYPO3\'s log.');
        }
      } catch (e) {
        Router.handleAjaxError(e, modalContent);
      }
    });

    this.currentModal.buttons = [
      {
        btnClass: 'btn-default',
        'text': 'Save settings',
        trigger: () => {
          editor.querySelector('form')?.requestSubmit();
        }
      }
    ];

    container.append(editor);
    modalContent.replaceChildren(container);
  }
}

export default new SystemSettings();
