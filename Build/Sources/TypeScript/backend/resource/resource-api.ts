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

import { action, actionAuthorization, actionUrl } from '@typo3/core/action/request';
import { AjaxResponse } from '@typo3/core/ajax/ajax-response';
import Notification from '@typo3/backend/notification';
import labels from '~labels/backend.resource';

export interface FileData {
  _schema: 'sys_file';
  uid: number;
  identifier: string;
  folder: string;
  name: string;
  extension: string;
  mimeType: string;
  iconIdentifier: string;
  size: number;
  createdAt: string | null;
  modifiedAt: string | null;
  url: string | null;
  hasPreview: boolean;
  permissions: { read: boolean, write: boolean, rename: boolean, delete: boolean };
}

export interface FolderData {
  _schema: 'sys_folder';
  identifier: string;
  parent: string | null;
  name: string;
  permissions: { read: boolean, write: boolean, add: boolean, rename: boolean, delete: boolean };
}

export type ConflictMode = 'cancel' | 'replace' | 'rename';

const asJson = { headers: { 'Content-Type': 'application/json' } };

/**
 * Module: @typo3/backend/resource/resource-api
 * Client of the file and folder actions
 */
export async function fetchFile(uid: number): Promise<FileData> {
  const response = await action('/files/{uid}', { uid: uid.toString(10) }).get();
  return await response.resolve();
}

export async function fetchFolder(
  identifier: string,
  options: { name?: string, limit?: number, cursor?: string } = {}
): Promise<{ folder: FolderData, items: Array<FileData | FolderData>, next: string | null }> {
  const query: Record<string, string> = { identifier };
  for (const [key, value] of Object.entries(options)) {
    if (value !== undefined) {
      query[key] = String(value);
    }
  }
  const response = await action('/folders').withQueryArguments(query).get({ cache: 'no-cache' });
  return await response.resolve();
}

export async function updateFile(uid: number, changes: { name?: string, folder?: string, conflictMode?: ConflictMode }): Promise<FileData> {
  const response = await action('/files/{uid}', { uid: uid.toString(10) }).patch(changes, asJson);
  return await response.resolve();
}

export async function updateFolder(identifier: string, changes: { name?: string, parent?: string, conflictMode?: ConflictMode }): Promise<FolderData> {
  const response = await action('/folders').withQueryArguments({ identifier }).patch(changes, asJson);
  return await response.resolve();
}

export async function createResource(
  folder: string,
  resource: { type?: 'file' | 'folder', name?: string, content?: string, copyFrom?: { file?: number, folder?: string }, conflictMode?: ConflictMode }
): Promise<FileData | FolderData> {
  const response = await action('/folders').withQueryArguments({ identifier: folder }).post(resource, asJson);
  return await response.resolve();
}

/**
 * Prepares an upload with XMLHttpRequest, which provides upload progress events
 * in contrast to fetch(). The request is to be sent with the file as body.
 */
export function openUploadRequest(folder: string, file: File, conflictMode: ConflictMode = 'cancel'): XMLHttpRequest {
  const query = new URLSearchParams({ folder, name: file.name, conflictMode });
  const xhr = new XMLHttpRequest();
  xhr.open('POST', actionUrl('/files') + '?' + query.toString());
  xhr.setRequestHeader('Authorization', actionAuthorization());
  xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
  return xhr;
}

/**
 * Replaces the content of a file, the name is changed if given
 */
export async function replaceFile(uid: number, file: File, name?: string): Promise<FileData> {
  const request = action('/files/{uid}', { uid: uid.toString(10) });
  const response = await (name !== undefined ? request.withQueryArguments({ name }) : request)
    .put('', { body: file, headers: { 'Content-Type': file.type || 'application/octet-stream' } });
  return await response.resolve();
}

export async function deleteFile(uid: number): Promise<void> {
  await action('/files/{uid}', { uid: uid.toString(10) }).delete();
}

export async function deleteFolder(identifier: string, recursive: boolean = false): Promise<void> {
  await action('/folders').withQueryArguments({ identifier, recursive: recursive ? 'true' : 'false' }).delete();
}

/**
 * Shows the error of a failed action as notification
 */
export async function notifyError(error: unknown): Promise<void> {
  let message = '';
  if (error instanceof AjaxResponse) {
    const data = await error.resolve().catch((): null => null);
    message = typeof data?.error === 'string' ? data.error : error.response.statusText;
  } else if (error instanceof Error) {
    message = error.message;
  }
  Notification.error(labels.get('ajax.error'), message);
}
