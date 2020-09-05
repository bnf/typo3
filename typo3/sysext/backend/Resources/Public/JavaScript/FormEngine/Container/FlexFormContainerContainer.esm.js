import { Collapse } from '../../../../../../core/Resources/Public/JavaScript/Contrib/bootstrap.esm.js';
import SecurityUtility from '../../../../../../core/Resources/Public/JavaScript/SecurityUtility.esm.js';
import Severity from '../../Severity.esm.js';
import Modal from '../../Modal.esm.js';
import RegularEvent from '../../../../../../core/Resources/Public/JavaScript/Event/RegularEvent.esm.js';

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
var Selectors;
(function (Selectors) {
    Selectors["toggleSelector"] = "[data-bs-toggle=\"flexform-inline\"]";
    Selectors["actionFieldSelector"] = ".t3js-flex-control-action";
    Selectors["toggleFieldSelector"] = ".t3js-flex-control-toggle";
    Selectors["controlSectionSelector"] = ".t3js-formengine-irre-control";
    Selectors["sectionContentContainerSelector"] = ".t3js-flex-section-content";
    Selectors["deleteContainerButtonSelector"] = ".t3js-delete";
    Selectors["contentPreviewSelector"] = ".content-preview";
})(Selectors || (Selectors = {}));
class FlexFormContainerContainer {
    constructor(parentContainer, container) {
        this.securityUtility = new SecurityUtility();
        this.parentContainer = parentContainer;
        this.container = container;
        this.containerContent = container.querySelector(Selectors.sectionContentContainerSelector);
        this.containerId = container.dataset.flexformContainerId;
        this.panelHeading = container.querySelector('[data-bs-target="#flexform-container-' + this.containerId + '"]');
        this.panelButton = this.panelHeading.querySelector('[aria-controls="flexform-container-' + this.containerId + '"]');
        this.toggleField = container.querySelector(Selectors.toggleFieldSelector);
        this.registerEvents();
        this.generatePreview();
    }
    static getCollapseInstance(container) {
        var _a;
        return (_a = Collapse.getInstance(container)) !== null && _a !== void 0 ? _a : new Collapse(container, { toggle: false });
    }
    getStatus() {
        return {
            id: this.containerId,
            collapsed: this.panelButton.getAttribute('aria-expanded') === 'false',
        };
    }
    registerEvents() {
        if (this.parentContainer.isRestructuringAllowed()) {
            this.registerDelete();
        }
        this.registerToggle();
        this.registerPanelToggle();
    }
    registerDelete() {
        new RegularEvent('click', () => {
            const title = TYPO3.lang['flexform.section.delete.title'] || 'Delete this container?';
            const content = TYPO3.lang['flexform.section.delete.message'] || 'Are you sure you want to delete this container?';
            const $modal = Modal.confirm(title, content, Severity.warning, [
                {
                    text: TYPO3.lang['buttons.confirm.delete_record.no'] || 'Cancel',
                    active: true,
                    btnClass: 'btn-default',
                    name: 'no',
                },
                {
                    text: TYPO3.lang['buttons.confirm.delete_record.yes'] || 'Yes, delete this container',
                    btnClass: 'btn-warning',
                    name: 'yes',
                },
            ]);
            $modal.on('button.clicked', (modalEvent) => {
                if (modalEvent.target.name === 'yes') {
                    const actionField = this.container.querySelector(Selectors.actionFieldSelector);
                    actionField.value = 'DELETE';
                    this.container.appendChild(actionField);
                    this.container.classList.add('t3-flex-section--deleted');
                    new RegularEvent('transitionend', () => {
                        this.container.classList.add('hidden');
                        const event = new CustomEvent('formengine:flexform:container-deleted', {
                            detail: {
                                containerId: this.containerId
                            }
                        });
                        this.parentContainer.getContainer().dispatchEvent(event);
                    }).bindTo(this.container);
                }
                Modal.dismiss();
            });
        }).bindTo(this.container.querySelector(Selectors.deleteContainerButtonSelector));
    }
    registerToggle() {
        new RegularEvent('click', () => {
            FlexFormContainerContainer.getCollapseInstance(this.containerContent).toggle();
            this.generatePreview();
        }).delegateTo(this.container, `${Selectors.toggleSelector} .form-irre-header-cell:not(${Selectors.controlSectionSelector}`);
    }
    registerPanelToggle() {
        ['hide.bs.collapse', 'show.bs.collapse'].forEach((eventName) => {
            new RegularEvent(eventName, (e) => {
                const collapseTriggered = e.type === 'hide.bs.collapse';
                this.toggleField.value = collapseTriggered ? '1' : '0';
                this.panelButton.setAttribute('aria-expanded', collapseTriggered ? 'false' : 'true');
                this.panelButton.parentElement.classList.toggle('collapsed', collapseTriggered);
            }).bindTo(this.containerContent);
        });
    }
    generatePreview() {
        let previewContent = '';
        if (this.getStatus().collapsed) {
            const formFields = this.containerContent.querySelectorAll('input[type="text"], textarea');
            for (let field of formFields) {
                let content = this.securityUtility.stripHtml(field.value);
                if (content.length > 50) {
                    content = content.substring(0, 50) + '...';
                }
                previewContent += (previewContent ? ' / ' : '') + content;
            }
        }
        this.panelHeading.querySelector(Selectors.contentPreviewSelector).textContent = previewContent;
    }
}

export default FlexFormContainerContainer;
