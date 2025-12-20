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

import { html, nothing, type TemplateResult } from 'lit';
import { until } from 'lit/directives/until.js';
import RegularEvent from '@typo3/core/event/regular-event';
import { FileListActionEvent, type FileListActionDetail } from '@typo3/filelist/file-list-actions';
import { default as Modal, type ModalElement } from '@typo3/backend/modal';
import { fetchFile, replaceFile, notifyError, type FileData } from '@typo3/backend/resource/resource-api';
import resourceLabels from '~labels/backend.resource';
import Notification from '@typo3/backend/notification';
import Viewport from '@typo3/backend/viewport';
import { FormatUtility } from '@typo3/backend/utility/format-utility';
import { ThumbnailSize } from '@typo3/backend/element/thumbnail-element';
import { topLevelModuleImport } from '@typo3/backend/utility/top-level-module-import';
import labels from '~labels/filelist.messages';
import coreCommonLabels from '~labels/core.common';
import coreCoreLabels from '~labels/core.core';
import modFileListLabels from '~labels/filelist.mod_file_list';

const extensionOf = (name: string): string => name.includes('.') ? name.substring(name.lastIndexOf('.') + 1) : '';
const baseNameOf = (name: string): string => name.includes('.') ? name.substring(0, name.lastIndexOf('.')) : name;

class FileListReplaceHandler {
  constructor() {
    new RegularEvent(FileListActionEvent.replace, (event: CustomEvent): void => {
      const detail: FileListActionDetail = event.detail;
      const resource = detail.resources[0];
      const modal = Modal.advanced({
        title: labels.get('file_replace.title', [resource.name]),
        type: Modal.types.default,
        size: Modal.sizes.small,
        content: html`${until(this.loadEditor(resource.uid), html`<typo3-backend-spinner></typo3-backend-spinner>`)}`,
        buttons: [
          {
            text: coreCommonLabels.get('cancel'),
            btnClass: 'btn-default',
            name: 'cancel',
            trigger: (): void => {
              modal.hideModal();
            }
          },
          {
            text: labels.get('file_replace.button.replace'),
            btnClass: 'btn-primary',
            name: 'rename',
            form: 'file-list-replace-form',
          },
        ],
        callback: function (modal: ModalElement) {
          new RegularEvent('submit', (event: SubmitEvent): void => {
            event.preventDefault();

            const form = event.target as HTMLFormElement;
            const file = (form.querySelector('input[type="file"]') as HTMLInputElement).files[0];
            const keepFilename = (form.querySelector('input[name="keepFilename"]') as HTMLInputElement).checked;
            if (file === undefined) {
              Notification.error(resourceLabels.get('ajax.error'), resourceLabels.get('ajax.error.message.resourceNotAvailableToUpload'));
              return;
            }
            let name: string | undefined = file.name;
            if (keepFilename) {
              const extension = extensionOf(file.name);
              // A changed file type requires a matching file extension
              name = extension === extensionOf(resource.name)
                ? undefined
                : baseNameOf(resource.name) + (extension !== '' ? '.' + extension : '');
            }
            replaceFile(resource.uid, file, name).then((result): void => {
              Notification.success(resourceLabels.get('ajax.success'), resourceLabels.get('ajax.success.message.resourceReplaced', [result.name]));
              Viewport.ContentContainer.refresh();
              modal.hideModal();
            }).catch(notifyError);
          }).delegateTo(modal, 'form');
        }
      });
    }).bindTo(document);
  }

  private async loadEditor(uid: number): Promise<TemplateResult> {
    const file = await fetchFile(uid);

    await topLevelModuleImport('@typo3/backend/element/datetime-element.js');
    return this.composeEditForm(file);
  }

  private composeEditForm(resource: FileData): TemplateResult {
    const thumbnailUrl = new URL(top.TYPO3.settings.Resource.thumbnailUrl, window.origin);
    thumbnailUrl.searchParams.set('identifier', resource.uid.toString(10));

    return html`
      <div class="file-replace-dialog">
        ${labels.get('file_replace.intro', [resource.name])}
        <div
          class="file-replace-dialog-summary"
        >
          ${resource.hasPreview ? html`<div class="file-replace-dialog-summary-thumbnail">
            <typo3-backend-thumbnail url=${thumbnailUrl} size=${ThumbnailSize.large} width="96" keepAspectRatio></typo3-backend-thumbnail>
          </div>` : nothing}
          <div class="file-replace-dialog-summary-info">
            <dl>
              <dt>${modFileListLabels.get('c_name')}</dt>
              <dd>${resource.name}</dd>
              <dt>${modFileListLabels.get('c_size')}</dt>
              <dd>${FormatUtility.fileSizeAsString(resource.size)}</dd>
              <dt>${coreCoreLabels.get('labels.crdate')}</dt>
              <dd><typo3-backend-datetime format="datetime" datetime="${resource.createdAt}"></typo3-backend-datetime></dd>
            </dl>
          </div>
        </div>
        <form id="file-list-replace-form">
          <div class="form-group">
            <label class="form-label" for="file_replace">${labels.get('file_replace.new_file.label')}</label>
            <input id="file_replace" type="file" class="form-control" name="replace_1" autofocus>
          </div>
          <div class="form-check">
            <input type="checkbox" value="1" id="keepFilename" name="keepFilename" class="form-check-input" checked>
            <label class="form-check-label" for="keepFilename">${labels.get('file_replace.keepFilename.label', [resource.name])}</label>
          </div>
        </form>
      </div>
    `;
  }
}

export default new FileListReplaceHandler();
