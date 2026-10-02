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

import Modal from '@typo3/backend/modal.js';
import Notification from '@typo3/backend/notification.js';
import { expect } from '@open-wc/testing';

describe('@typo3/backend/modal:', () => {
  afterEach((): void => {
    document.querySelectorAll('typo3-backend-modal').forEach((modal: Element): void => modal.remove());
  });

  it('keeps the notification container out of a modal that is closed while it opens', async (): Promise<void> => {
    Notification.info('Shown before the modal is opened');
    const modal = Modal.confirm('Title', 'Content');
    await modal.updateComplete;

    // The lifecycle events are dispatched by hand, as the transitions of the modal take their time
    modal.dispatchEvent(new CustomEvent('typo3-modal-show'));
    modal.dispatchEvent(new CustomEvent('typo3-modal-hide'));
    // Dispatched once the opening transition has finished, after the modal has already been closed
    modal.dispatchEvent(new CustomEvent('typo3-modal-shown'));

    expect(document.getElementById('alert-container')?.closest('typo3-backend-modal') === null).to.equal(true);
  });

  it('moves the notification container into a modal that has been opened', async (): Promise<void> => {
    Notification.info('Shown before the modal is opened');
    const modal = Modal.confirm('Title', 'Content');
    await modal.updateComplete;

    modal.dispatchEvent(new CustomEvent('typo3-modal-show'));
    modal.dispatchEvent(new CustomEvent('typo3-modal-shown'));

    expect(document.getElementById('alert-container')?.closest('typo3-backend-modal') === modal).to.equal(true);
  });
});
