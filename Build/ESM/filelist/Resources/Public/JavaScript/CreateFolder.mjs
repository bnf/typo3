import $ from 'jquery';
import Modal from '../../../../backend/Resources/Public/JavaScript/Modal.mjs';
import RegularEvent from '../../../../core/Resources/Public/JavaScript/Event/RegularEvent.mjs';

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
/**
 * Module: TYPO3/CMS/Filelist/CreateFolder
 * @exports TYPO3/CMS/Filelist/CreateFolder
 */
class CreateFolder {
    constructor() {
        this.changed = false;
        $(() => {
            const mainElement = document.querySelector('.filelist-create-folder-main');
            if (!(mainElement instanceof HTMLElement)) {
                throw new Error('Main element not found');
            }
            this.selfUrl = mainElement.dataset.selfUrl;
            this.confirmTitle = mainElement.dataset.confirmTitle;
            this.confirmText = mainElement.dataset.confirmText;
            this.registerEvents();
        });
    }
    reload(amount) {
        const url = this.selfUrl.replace(/AMOUNT/, amount.toString());
        if (!this.changed) {
            window.location.href = url;
        }
        else {
            const modal = Modal.confirm(this.confirmTitle, this.confirmText);
            modal.on('confirm.button.cancel', () => {
                modal.trigger('modal-dismiss');
            });
            modal.on('confirm.button.ok', () => {
                modal.trigger('modal-dismiss');
                window.location.href = url;
            });
        }
    }
    registerEvents() {
        const inputElementSelectors = [
            'input[type="text"][name^="data[newfolder]"]',
            'input[type="text"][name^="data[newfile]"]',
            'input[type="text"][name^="data[newMedia]"]'
        ];
        new RegularEvent('change', () => {
            this.changed = true;
        }).delegateTo(document, inputElementSelectors.join(','));
        new RegularEvent('change', (e) => {
            const amount = parseInt(e.target.value, 10);
            this.reload(amount);
        }).bindTo(document.getElementById('number-of-new-folders'));
    }
}
var CreateFolder$1 = new CreateFolder();

export default CreateFolder$1;
