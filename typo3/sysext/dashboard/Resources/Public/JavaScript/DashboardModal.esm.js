import { SeverityEnum } from '../../../../backend/Resources/Public/JavaScript/Enum/Severity.esm.js';
import $ from '../../../../core/Resources/Public/JavaScript/Contrib/jquery.esm.js';
import Modal from '../../../../backend/Resources/Public/JavaScript/Modal.esm.js';
import RegularEvent from '../../../../core/Resources/Public/JavaScript/Event/RegularEvent.esm.js';

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
class DashboardModal {
    constructor() {
        this.selector = '.js-dashboard-modal';
        this.initialize();
    }
    initialize() {
        new RegularEvent('click', function (e) {
            e.preventDefault();
            const configuration = {
                type: Modal.types.default,
                title: this.dataset.modalTitle,
                size: Modal.sizes.medium,
                severity: SeverityEnum.notice,
                content: $(document.getElementById(`dashboardModal-${this.dataset.modalIdentifier}`).innerHTML),
                additionalCssClasses: ['dashboard-modal'],
                callback: (currentModal) => {
                    currentModal.on('submit', '.dashboardModal-form', (e) => {
                        currentModal.trigger('modal-dismiss');
                    });
                    currentModal.on('button.clicked', (e) => {
                        if (e.target.getAttribute('name') === 'save') {
                            const formElement = currentModal.find('form');
                            formElement.trigger('submit');
                        }
                        else {
                            currentModal.trigger('modal-dismiss');
                        }
                    });
                },
                buttons: [
                    {
                        text: this.dataset.buttonCloseText,
                        btnClass: 'btn-default',
                        name: 'cancel',
                    },
                    {
                        text: this.dataset.buttonOkText,
                        active: true,
                        btnClass: 'btn-warning',
                        name: 'save',
                    }
                ]
            };
            Modal.advanced(configuration);
        }).delegateTo(document, this.selector);
    }
}
var DashboardModal$1 = new DashboardModal();

export default DashboardModal$1;
