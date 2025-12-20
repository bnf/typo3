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

import DragUploader from '@typo3/backend/drag-uploader.js';
import Modal, { type ModalElement } from '@typo3/backend/modal.js';
import Notification from '@typo3/backend/notification.js';
import type { FileData, FolderData } from '@typo3/backend/resource/resource-api.js';
import { expect, waitUntil } from '@open-wc/testing';
import {
  stub,
  useFakeTimers,
  useFakeXMLHttpRequest,
  type SinonFakeTimers,
  type SinonFakeXMLHttpRequest,
  type SinonFakeXMLHttpRequestStatic,
  type SinonStub,
} from 'sinon';
import type { } from 'mocha';

describe('@typo3/backend/drag-uploader', (): void => {
  let container: HTMLElement;
  let originalTypo3: typeof window.TYPO3;
  let fakeXhr: SinonFakeXMLHttpRequestStatic;
  let requests: SinonFakeXMLHttpRequest[];
  let fetchStub: SinonStub;
  let clock: SinonFakeTimers;
  let infoStub: SinonStub;
  let errorStub: SinonStub;
  let showMessageStub: SinonStub;
  let modalStub: SinonStub;
  let dismissStub: SinonStub;
  let modal: ModalElement | null;
  let existingFileNames: string[];
  let uploadFinishedCount: number;

  const countUploadFinished = (): void => {
    uploadFinishedCount++;
  };

  const provideModuleImport = (event: Event): void => {
    (event as CustomEvent<{ importPromise: Promise<unknown> | null }>).detail.importPromise = Promise.resolve();
  };

  // The uploader creates another request to detect upload progress support, it is never sent
  const uploadRequests = (): SinonFakeXMLHttpRequest[] => requests.filter(
    (request: SinonFakeXMLHttpRequest): boolean => request.url?.startsWith('/typo3/api/v1/files?') ?? false
  );

  const createUploader = (): DragUploader => {
    // The uploader is created by hand, the class t3js-drag-uploader would make DragUploader.init() create a second one
    const element = document.createElement('div');
    element.dataset.dropzoneTarget = '#drag-uploader-test-target';
    element.dataset.progressContainer = '#drag-uploader-test-filelist';
    element.dataset.targetFolder = '1:/';
    element.dataset.reloadUrl = '/reload';
    container.append(element);
    return new DragUploader(element);
  };

  const upload = async (fileNames: string[], existing: string[] = []): Promise<void> => {
    existingFileNames = existing;
    createUploader().processFiles([...fileNames, ...existing].map((fileName: string): File => new File(['x'], fileName)));
    await waitUntil((): boolean => uploadRequests().length === fileNames.length && (existing.length === 0 || modal !== null));
  };

  // A folder dropped from the desktop is handed over as a file which cannot be read
  const createFolder = (name: string): File => {
    const folder = new File([], name);
    folder.arrayBuffer = (): Promise<ArrayBuffer> => Promise.reject(new DOMException('', 'NotFoundError'));
    return folder;
  };

  const chooseAction = (fileName: string, action: string): void => {
    const select = modal.querySelector<HTMLSelectElement>(`.t3js-actions[data-override="${existingFileNames.indexOf(fileName)}"]`);
    select.value = action;
    select.dispatchEvent(new Event('change', { bubbles: true }));
  };

  const clickModalButton = async (name: string): Promise<void> => {
    const button = document.createElement('button');
    button.name = name;
    modal.append(button);
    button.dispatchEvent(new CustomEvent('button.clicked', { bubbles: true }));
    await new Promise((resolve): number => window.setTimeout(resolve, 0));
  };

  const respond = async (index: number, status: number, body: object): Promise<void> => {
    uploadRequests()[index].respond(status, { 'Content-Type': 'application/json' }, JSON.stringify(body));
    // The reload notice is shown after the flash messages of the upload have disappeared
    await clock.tickAsync(5000);
  };

  const fileData = (fileName: string): FileData => ({
    _schema: 'sys_file',
    uid: 1,
    identifier: '1:/' + fileName,
    folder: '1:/',
    name: fileName,
    extension: 'txt',
    mimeType: 'text/plain',
    iconIdentifier: 'mimetypes-text-text',
    size: 1,
    createdAt: null,
    modifiedAt: null,
    url: null,
    hasPreview: false,
    permissions: { read: true, write: true, rename: true, delete: true },
  });

  const problem = (status: number, detail: string): object => ({ type: 'about:blank', title: 'Error', status, detail });

  beforeEach((): void => {
    originalTypo3 = window.TYPO3;
    window.TYPO3 = {
      settings: { Resource: { thumbnailUrl: '/thumbnail' } },
    } as unknown as typeof window.TYPO3;
    document.body.dataset.apiPrefix = '/typo3/api';
    document.body.dataset.apiToken = 'token';

    container = document.createElement('div');
    container.innerHTML = '<div id="drag-uploader-test-target"></div>' +
      '<div><table id="drag-uploader-test-filelist"><thead><tr><th></th><th></th></tr></thead><tbody></tbody></table></div>';
    document.body.append(container);

    fetchStub = stub(window, 'fetch').callsFake(async (input: RequestInfo | URL): Promise<Response> => {
      const fileName = new URL(input instanceof Request ? input.url : String(input), window.location.href).searchParams.get('name');
      const folder: FolderData = { _schema: 'sys_folder', identifier: '1:/', parent: null, name: '', permissions: { read: true, write: true, add: true, rename: true, delete: true } };
      const items = existingFileNames.includes(fileName) ? [fileData(fileName)] : [];
      return new Response(JSON.stringify({ folder, items, next: null }), { headers: { 'Content-Type': 'application/json' } });
    });
    requests = [];
    fakeXhr = useFakeXMLHttpRequest();
    fakeXhr.onCreate = (request: SinonFakeXMLHttpRequest): void => {
      requests.push(request);
    };
    infoStub = stub(Notification, 'info');
    errorStub = stub(Notification, 'error');
    showMessageStub = stub(Notification, 'showMessage');

    modal = null;
    existingFileNames = [];
    modalStub = stub(Modal, 'advanced').callsFake((configuration): ModalElement => {
      modal = document.createElement('div') as unknown as ModalElement;
      modal.append(configuration.content as HTMLElement);
      modal.hideModal = (): void => {
        modal.dispatchEvent(new CustomEvent('typo3-modal-hidden'));
      };
      container.append(modal);
      return modal;
    });
    dismissStub = stub(Modal, 'dismiss').callsFake((): void => modal.hideModal());
    // Answers the module import of the top level window, the uploader loads the datetime element for the modal
    document.addEventListener('typo3:import-javascript-module', provideModuleImport);

    uploadFinishedCount = 0;
    document.addEventListener('typo3:drag-uploader:upload-finished', countUploadFinished);
    clock = useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'], shouldAdvanceTime: true });
  });

  afterEach((): void => {
    clock.restore();
    document.removeEventListener('typo3:drag-uploader:upload-finished', countUploadFinished);
    document.removeEventListener('typo3:import-javascript-module', provideModuleImport);
    dismissStub.restore();
    modalStub.restore();
    infoStub.restore();
    errorStub.restore();
    showMessageStub.restore();
    fakeXhr.restore();
    fetchStub.restore();
    container.remove();
    document.querySelectorAll('.upload-file-picker, typo3-backend-progress-bar').forEach((element: Element): void => element.remove());
    delete document.body.dataset.apiPrefix;
    delete document.body.dataset.apiToken;
    window.TYPO3 = originalTypo3;
  });

  it('offers to reload the file list after a successful upload', async (): Promise<void> => {
    await upload(['file.txt']);
    await respond(0, 201, fileData('file.txt'));

    expect(infoStub.callCount).to.equal(1);
    expect(infoStub.firstCall.args[0]).to.equal('file_upload.reload.filelist');
  });

  it('does not offer to reload the file list when the upload failed', async (): Promise<void> => {
    await upload(['file.txt']);
    await respond(0, 500, {});

    expect(infoStub.callCount).to.equal(0);
  });

  it('does not offer to reload the file list when every upload failed', async (): Promise<void> => {
    await upload(['first.txt', 'second.txt']);
    await respond(0, 500, {});
    await respond(1, 409, problem(409, 'File exists'));

    expect(infoStub.callCount).to.equal(0);
  });

  it('offers to reload the file list when one of several uploads succeeded', async (): Promise<void> => {
    await upload(['first.txt', 'second.txt']);
    await respond(0, 500, {});
    await respond(1, 201, fileData('second.txt'));

    expect(infoStub.callCount).to.equal(1);
    expect(infoStub.firstCall.args[0]).to.equal('file_upload.reload.filelist');
  });

  it('offers to reload the file list when the other file of a batch was skipped', async (): Promise<void> => {
    await upload(['new.txt'], ['existing.txt']);
    await respond(0, 201, fileData('new.txt'));
    await clickModalButton('continue');

    expect(infoStub.callCount).to.equal(1);
    expect(uploadFinishedCount).to.equal(1);
  });

  it('finishes the upload after the last file chosen to upload in the modal', async (): Promise<void> => {
    await upload([], ['skipped.txt', 'renamed.txt']);
    chooseAction('renamed.txt', 'rename');
    await clickModalButton('continue');

    expect(uploadFinishedCount).to.equal(0);

    await respond(0, 201, fileData('renamed_01.txt'));

    expect(infoStub.callCount).to.equal(1);
    expect(uploadFinishedCount).to.equal(1);
  });

  it('finishes the upload when every file is skipped', async (): Promise<void> => {
    await upload([], ['existing.txt']);
    await clickModalButton('continue');

    expect(infoStub.callCount).to.equal(0);
    expect(uploadFinishedCount).to.equal(1);
  });

  it('finishes the upload when the modal is cancelled', async (): Promise<void> => {
    await upload(['new.txt'], ['existing.txt']);
    await clickModalButton('cancel');

    expect(uploadFinishedCount).to.equal(0);

    await respond(0, 201, fileData('new.txt'));

    expect(infoStub.callCount).to.equal(1);
    expect(uploadFinishedCount).to.equal(1);
  });

  it('finishes the upload when the modal is closed without a choice', async (): Promise<void> => {
    await upload([], ['existing.txt']);
    modal.hideModal();
    await new Promise((resolve): number => window.setTimeout(resolve, 0));

    expect(infoStub.callCount).to.equal(0);
    expect(uploadFinishedCount).to.equal(1);
  });

  it('rejects a folder and uploads the files next to it', async (): Promise<void> => {
    await createUploader().processFiles([createFolder('folder'), new File(['x'], 'file.txt')]);
    await waitUntil((): boolean => uploadRequests().length === 1);

    expect(errorStub.callCount).to.equal(1);
    expect(errorStub.firstCall.args).to.deep.equal(['file_upload.notUploaded.title', 'file_upload.notUploaded.unreadable']);
    expect(uploadRequests()[0].requestBody).to.have.property('name', 'file.txt');
  });

  it('uploads nothing when only folders are given', async (): Promise<void> => {
    await createUploader().processFiles([createFolder('folder')]);

    expect(errorStub.callCount).to.equal(1);
    expect(fetchStub.callCount).to.equal(0);
    expect(container.querySelectorAll('.upload-queue-item').length).to.equal(0);
  });

  it('uploads an empty file', async (): Promise<void> => {
    await createUploader().processFiles([new File([], 'empty.txt')]);
    await waitUntil((): boolean => uploadRequests().length === 1);

    expect(errorStub.callCount).to.equal(0);
  });
});
