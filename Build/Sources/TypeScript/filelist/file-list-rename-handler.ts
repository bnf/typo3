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

import RegularEvent from '@typo3/core/event/regular-event';
import { html, type TemplateResult } from 'lit';
import type { ResourceInterface } from '@typo3/backend/resource/resource';
import { FileListActionEvent, type FileListActionDetail } from '@typo3/filelist/file-list-actions';
import { default as Modal, type ModalElement } from '@typo3/backend/modal';
import { updateFile, updateFolder, notifyError } from '@typo3/backend/resource/resource-api';
import Notification from '@typo3/backend/notification';
import Viewport from '@typo3/backend/viewport';
import labels from '~labels/core.core';
import fileMessages from '~labels/core.file_messages';
import resourceLabels from '~labels/backend.resource';

class FileListRenameHandler {
  constructor() {

    new RegularEvent(FileListActionEvent.rename, (event: CustomEvent): void => {
      const detail: FileListActionDetail = event.detail;
      const resource = detail.resources[0];
      const modal = Modal.advanced({
        title: labels.get('file_rename.title'),
        type: Modal.types.default,
        size: Modal.sizes.small,
        content: this.composeEditForm(resource),
        buttons: [
          {
            text: labels.get('file_rename.button.cancel'),
            btnClass: 'btn-default',
            name: 'cancel',
            trigger: (): void => {
              modal.hideModal();
            }
          },
          {
            text: labels.get('file_rename.button.rename'),
            btnClass: 'btn-primary',
            name: 'rename',
            form: 'file-list-rename-form',
          },
        ],
        callback: function (modal: ModalElement) {
          const form = modal.querySelector('form');
          form.addEventListener('submit', (event: SubmitEvent): void => {
            event.preventDefault();
            const formData = new FormData(event.target as HTMLFormElement);
            const submittedData = Object.fromEntries(formData);
            const resourceName = submittedData.name.toString();
            if (resource.name !== resourceName) {
              const isFolder = resource.type === 'folder';
              const request = isFolder
                ? updateFolder(resource.identifier, { name: resourceName })
                : updateFile(resource.uid, { name: resourceName });
              request.then((result): void => {
                Notification.success(
                  resourceLabels.get('ajax.success'),
                  fileMessages.get(isFolder ? 'FileUtility.DirectoryRenamedFromTo' : 'FileUtility.FileRenamedFromTo', [resource.name, result.name])
                );

                const currentUrl = Viewport.ContentContainer.getUrl();
                const params = (new URL(currentUrl, window.location.origin)).searchParams;
                if (isFolder && params.get('id') === resource.identifier) {
                  Viewport.ContentContainer.setUrl(currentUrl + '&id=' + result.identifier);
                } else {
                  Viewport.ContentContainer.refresh();
                }

                top.document.dispatchEvent(new CustomEvent('typo3:filestoragetree:refresh'));
                modal.hideModal();
              }).catch(notifyError);
            }
          });

          modal.addEventListener('typo3-modal-shown', (): void => {
            const renameInput = form.querySelector('input');
            if (renameInput !== null) {
              renameInput.focus();
              renameInput.setSelectionRange(0, resource.name.lastIndexOf('.'));
            }
          });
        }
      });

    }).bindTo(document);
  }

  private composeEditForm(resource: ResourceInterface): TemplateResult {
    const label = resource?.type === 'folder' ?
      labels.get('folder_rename.label') :
      labels.get('file_rename.label');
    return html`
      <form id="file-list-rename-form">
        <label class="form-label" for="rename_target">
          ${label}
        </label>
        <input id="rename_target" name="name" class="form-control" value="${resource.name}" required autofocus>
      </form>
    `;
  }
}

export default new FileListRenameHandler();
