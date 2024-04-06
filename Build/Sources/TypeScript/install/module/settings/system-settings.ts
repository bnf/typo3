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

import { AbstractInteractableModule/*, ModuleLoadedResponseWithButtons*/ } from '../abstract-interactable-module';
import Router from '../../router';
import AjaxRequest from '@typo3/core/ajax/ajax-request';
import { topLevelModuleImport } from '@typo3/backend/utility/top-level-module-import';
import type { ModalElement } from '@typo3/backend/modal';

//import '@typo3/backend/settings/editor';

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
    }

    const isInIframe = window.location !== window.parent.location;
    if (isInIframe) {
      topLevelModuleImport('@typo3/backend/settings/editor.js')
    } else {
      import('@typo3/backend/settings/editor');
    }

    // data.success is so dumb
    if (!data.success) {
      throw new Error('data.success is so dumb');
    }

    this.currentModal.buttons = data.buttons;
    const categories = data.categories;

    const container = top.document.createElement('div');
    container.classList.add('container');
    const editor = top.document.createElement('typo3-backend-settings-editor');

    editor.setAttribute('action-url', Router.getUrl('systemSettingsWrite'));
    editor.setAttribute('ajax', '');
    if (!data.isWritable) {
      editor.setAttribute('readonly', '');
    }
    editor.categories = categories;

    container.append(editor);
    modalContent.replaceChildren(container);
  }
}

export default new SystemSettings();
