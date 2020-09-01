import $ from 'jquery';
import AjaxRequest from '../../../../../../core/Resources/Public/JavaScript/Ajax/AjaxRequest.mjs';
import Modal from '../../../../../../backend/Resources/Public/JavaScript/Modal.mjs';
import { AbstractInteractableModule } from '../AbstractInteractableModule.mjs';
import Severity from '../../Renderable/Severity.mjs';
import InfoBox from '../../Renderable/InfoBox.mjs';
import ProgressBar from '../../Renderable/ProgressBar.mjs';
import Router from '../../Router.mjs';
import FlashMessage from '../../Renderable/FlashMessage.mjs';

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
 * Module: TYPO3/CMS/Install/Module/TcaMigrationsCheck
 */
class TcaMigrationsCheck extends AbstractInteractableModule {
    constructor() {
        super(...arguments);
        this.selectorCheckTrigger = '.t3js-tcaMigrationsCheck-check';
        this.selectorOutputContainer = '.t3js-tcaMigrationsCheck-output';
    }
    initialize(currentModal) {
        this.currentModal = currentModal;
        this.check();
        currentModal.on('click', this.selectorCheckTrigger, (e) => {
            e.preventDefault();
            this.check();
        });
    }
    check() {
        this.setModalButtonsState(false);
        const $outputContainer = $(this.selectorOutputContainer);
        const modalContent = this.getModalBody();
        const message = ProgressBar.render(Severity.loading, 'Loading...', '');
        $outputContainer.empty().html(message);
        (new AjaxRequest(Router.getUrl('tcaMigrationsCheck')))
            .get({ cache: 'no-cache' })
            .then(async (response) => {
            const data = await response.resolve();
            modalContent.empty().append(data.html);
            Modal.setButtons(data.buttons);
            if (data.success === true && Array.isArray(data.status)) {
                if (data.status.length > 0) {
                    const m = InfoBox.render(Severity.warning, 'TCA migrations need to be applied', 'Check the following list and apply needed changes.');
                    modalContent.find(this.selectorOutputContainer).empty();
                    modalContent.find(this.selectorOutputContainer).append(m);
                    data.status.forEach((element) => {
                        const m2 = InfoBox.render(element.severity, element.title, element.message);
                        modalContent.find(this.selectorOutputContainer).append(m2);
                    });
                }
                else {
                    const m3 = InfoBox.render(Severity.ok, 'No TCA migrations need to be applied', 'Your TCA looks good.');
                    modalContent.find(this.selectorOutputContainer).append(m3);
                }
            }
            else {
                const m4 = FlashMessage.render(Severity.error, 'Something went wrong', 'Use "Check for broken extensions"');
                modalContent.find(this.selectorOutputContainer).append(m4);
            }
        }, (error) => {
            Router.handleAjaxError(error, modalContent);
        });
    }
}
var TcaMigrationsCheck$1 = new TcaMigrationsCheck();

export default TcaMigrationsCheck$1;
