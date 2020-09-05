import { SeverityEnum } from '../../../../backend/Resources/Public/JavaScript/Enum/Severity.esm.js';
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
class DashboardDelete {
    constructor() {
        this.selector = '.js-dashboard-delete';
        this.initialize();
    }
    initialize() {
        new RegularEvent('click', function (e) {
            e.preventDefault();
            const $modal = Modal.confirm(this.dataset.modalTitle, this.dataset.modalQuestion, SeverityEnum.warning, [
                {
                    text: this.dataset.modalCancel,
                    active: true,
                    btnClass: 'btn-default',
                    name: 'cancel',
                },
                {
                    text: this.dataset.modalOk,
                    btnClass: 'btn-warning',
                    name: 'delete',
                },
            ]);
            $modal.on('button.clicked', (e) => {
                if (e.target.getAttribute('name') === 'delete') {
                    window.location.href = this.getAttribute('href');
                }
                Modal.dismiss();
            });
        }).delegateTo(document, this.selector);
    }
}
var DashboardDelete$1 = new DashboardDelete();

export default DashboardDelete$1;
