import { SeverityEnum } from '../../../../backend/Resources/Public/JavaScript/Enum/Severity.mjs';
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
class WidgetRemover {
    constructor() {
        this.selector = '.js-dashboard-remove-widget';
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
var WidgetRemover$1 = new WidgetRemover();

export default WidgetRemover$1;
