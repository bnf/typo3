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

import { SeverityEnum } from '@typo3/backend/enum/severity';
import Modal from '@typo3/backend/modal';
import RegularEvent from '@typo3/core/event/regular-event';
import Notification from '@typo3/backend/notification';
import Viewport from '@typo3/backend/viewport';
import labels from '~labels/filelist.transfer_handler';
import { type FileListDragDropDetail, FileListDragDropEvent } from '@typo3/filelist/file-list-dragdrop';
import type { ResourceInterface } from '@typo3/backend/resource/resource';
import { createResource, updateFile, updateFolder, notifyError, type FileData, type FolderData } from '@typo3/backend/resource/resource-api';
import fileMessages from '~labels/core.file_messages';
import resourceLabels from '~labels/backend.resource';

enum FileListTransferType {
  move = 'move',
  copy = 'copy',
}

class FileListTransferHandler {
  constructor() {

    new RegularEvent(FileListDragDropEvent.transfer, (event: CustomEvent): void => {
      const detail: FileListDragDropDetail = event.detail;
      const target = detail.target;
      const resources = detail.resources;

      let modalTitle;
      let modalText;
      if (detail.resources.length === 1) {
        const resource = detail.resources[0];
        modalTitle = labels.get('message.transfer_resource.title');
        modalText = labels.get('message.transfer_resource.text', [resource.name, target.name]);
      } else {
        modalTitle = labels.get('message.transfer_resources.title');
        modalText = labels.get('message.transfer_resources.text', [resources.length, target.name]);
      }

      const modal = Modal.confirm(
        modalTitle,
        modalText,
        SeverityEnum.notice,
        [
          {
            text: labels.get('message.button.cancel'),
            active: true,
            btnClass: 'btn-default',
            name: 'cancel',
            trigger: (): void => {
              modal.hideModal();
            }
          },
          {
            text: labels.get('message.button.copy'),
            btnClass: 'btn-primary',
            name: 'copy',
            trigger: (): void => {
              this.transfer(FileListTransferType.copy, resources, target);
              modal.hideModal();
            }
          },
          {
            text: labels.get('message.button.move'),
            btnClass: 'btn-primary',
            name: 'move',
            trigger: (): void => {
              this.transfer(FileListTransferType.move, resources, target);
              modal.hideModal();
            }
          }
        ]
      );
    }).bindTo(top.document);
  }

  private transfer(type: FileListTransferType, resources: ResourceInterface[], target: ResourceInterface): void {
    const requests = resources.map(async (resource): Promise<void> => {
      const isFolder = resource.type === 'folder';
      let result: FileData | FolderData;
      if (type === FileListTransferType.move) {
        result = isFolder
          // Moved folders are renamed on name conflicts, as the file list did before
          ? await updateFolder(resource.identifier, { parent: target.identifier, conflictMode: 'rename' })
          : await updateFile(resource.uid, { folder: target.identifier });
      } else {
        result = await createResource(target.identifier, { copyFrom: isFolder ? { folder: resource.identifier } : { file: resource.uid } });
      }
      const message = type === FileListTransferType.move
        ? (isFolder ? 'FileUtility.DirectoryMovedTo' : 'FileUtility.FileMovedTo')
        : (isFolder ? 'FileUtility.DirectoryCopiedTo' : 'FileUtility.FileCopiedTo');
      Notification.success(resourceLabels.get('ajax.success'), fileMessages.get(message, [resource.identifier, result.identifier]));
    });
    Promise.allSettled(requests).then(async (results): Promise<void> => {
      for (const result of results) {
        if (result.status === 'rejected') {
          await notifyError(result.reason);
        }
      }
      Viewport.ContentContainer.refresh();
      top.document.dispatchEvent(new CustomEvent('typo3:filestoragetree:refresh'));
    });
  }
}

export default new FileListTransferHandler();
