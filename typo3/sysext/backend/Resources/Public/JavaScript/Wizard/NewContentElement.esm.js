import { SeverityEnum } from '../Enum/Severity.esm.js';
import Modal from '../Modal.esm.js';
import NewContentElementWizard from '../NewContentElementWizard.esm.js';

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
 * Module: TYPO3/CMS/Backend/Wizard/NewContentElement
 * NewContentElement JavaScript
 * @exports TYPO3/CMS/Backend/Wizard/NewContentElement
 */
class NewContentElement {
    static wizard(url, title) {
        const $modal = Modal.advanced({
            callback: (currentModal) => {
                currentModal.find('.t3js-modal-body').addClass('t3-new-content-element-wizard-window');
            },
            content: url,
            severity: SeverityEnum.notice,
            size: Modal.sizes.medium,
            title,
            type: Modal.types.ajax,
        }).on('modal-loaded', () => {
            // This rather works in local environments only
            $modal.on('shown.bs.modal', () => {
                const wizard = new NewContentElementWizard($modal);
                wizard.focusSearchField();
            });
        }).on('shown.bs.modal', () => {
            // This is the common case with any latency that the modal is rendered before the content is loaded
            $modal.on('modal-loaded', () => {
                const wizard = new NewContentElementWizard($modal);
                wizard.focusSearchField();
            });
        });
    }
}

export default NewContentElement;
