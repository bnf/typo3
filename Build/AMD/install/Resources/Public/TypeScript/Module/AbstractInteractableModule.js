define(['exports'], function (exports) { 'use strict';

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
    class AbstractInteractableModule {
        constructor() {
            this.selectorModalBody = '.t3js-modal-body';
            this.selectorModalContent = '.t3js-module-content';
            this.selectorModalFooter = '.t3js-modal-footer';
        }
        getModalBody() {
            return this.findInModal(this.selectorModalBody);
        }
        getModuleContent() {
            return this.findInModal(this.selectorModalContent);
        }
        getModalFooter() {
            return this.findInModal(this.selectorModalFooter);
        }
        findInModal(selector) {
            return this.currentModal.find(selector);
        }
        setModalButtonsState(interactable) {
            this.getModalFooter().find('button').each((_, elem) => {
                this.setModalButtonState($(elem), interactable);
            });
        }
        setModalButtonState(button, interactable) {
            button.toggleClass('disabled', !interactable).prop('disabled', !interactable);
        }
    }

    exports.AbstractInteractableModule = AbstractInteractableModule;

    Object.defineProperty(exports, '__esModule', { value: true });

});
