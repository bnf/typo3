import AjaxRequest from '../../../../../../core/Resources/Public/JavaScript/Ajax/AjaxRequest.esm.js';
import { Collapse } from '../../../../../../core/Resources/Public/JavaScript/Contrib/bootstrap.esm.js';
import RegularEvent from '../../../../../../core/Resources/Public/JavaScript/Event/RegularEvent.esm.js';
import documentService from '../../../../../../core/Resources/Public/JavaScript/DocumentService.esm.js';
import FlexFormContainerContainer from './FlexFormContainerContainer.esm.js';
import Sortable from '../../../../../../core/Resources/Public/JavaScript/Contrib/sortablejs.esm.js';
import FormEngine from '../../FormEngine.esm.js';

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
    Selectors["toggleAllSelector"] = ".t3-form-flexsection-toggle";
    Selectors["addContainerSelector"] = ".t3js-flex-container-add";
    Selectors["actionFieldSelector"] = ".t3js-flex-control-action";
    Selectors["sectionContainerSelector"] = ".t3js-flex-section";
    Selectors["sectionContentContainerSelector"] = ".t3js-flex-section-content";
    Selectors["sortContainerButtonSelector"] = ".t3js-sortable-handle";
})(Selectors || (Selectors = {}));
class FlexFormSectionContainer {
    /**
     * @param {string} elementId
     */
    constructor(elementId) {
        this.allowRestructure = false;
        this.flexformContainerContainers = [];
        this.updateSorting = (e) => {
            const actionFields = this.container.querySelectorAll(Selectors.actionFieldSelector);
            actionFields.forEach((element, key) => {
                element.value = key.toString();
            });
            this.updateToggleAllState();
            this.flexformContainerContainers.splice(e.newIndex, 0, this.flexformContainerContainers.splice(e.oldIndex, 1)[0]);
            document.dispatchEvent(new Event('formengine:flexform:sorting-changed'));
        };
        this.sectionContainerId = elementId;
        documentService.ready().then((document) => {
            this.container = document.getElementById(elementId);
            this.sectionContainer = this.container.querySelector(this.container.dataset.section);
            this.allowRestructure = this.sectionContainer.dataset.t3FlexAllowRestructure === '1';
            this.registerEvents();
            this.registerContainers();
        });
    }
    static getCollapseInstance(container) {
        var _a;
        return (_a = Collapse.getInstance(container)) !== null && _a !== void 0 ? _a : new Collapse(container, { toggle: false });
    }
    getContainer() {
        return this.container;
    }
    isRestructuringAllowed() {
        return this.allowRestructure;
    }
    registerEvents() {
        if (this.allowRestructure) {
            this.registerSortable();
            this.registerContainerDeleted();
        }
        this.registerToggleAll();
        this.registerCreateNewContainer();
        this.registerPanelToggle();
    }
    registerContainers() {
        const sectionContainerContainers = this.container.querySelectorAll(Selectors.sectionContainerSelector);
        for (let sectionContainerContainer of sectionContainerContainers) {
            this.flexformContainerContainers.push(new FlexFormContainerContainer(this, sectionContainerContainer));
        }
        this.updateToggleAllState();
    }
    getToggleAllButton() {
        return this.container.querySelector(Selectors.toggleAllSelector);
    }
    registerSortable() {
        new Sortable(this.sectionContainer, {
            group: this.sectionContainer.id,
            handle: Selectors.sortContainerButtonSelector,
            onSort: this.updateSorting,
        });
    }
    registerToggleAll() {
        new RegularEvent('click', (e) => {
            const trigger = e.target;
            const showAll = trigger.dataset.expandAll === 'true';
            const collapsibles = this.container.querySelectorAll(Selectors.sectionContentContainerSelector);
            for (let collapsible of collapsibles) {
                if (showAll) {
                    FlexFormSectionContainer.getCollapseInstance(collapsible).show();
                }
                else {
                    FlexFormSectionContainer.getCollapseInstance(collapsible).hide();
                }
            }
        }).bindTo(this.getToggleAllButton());
    }
    registerCreateNewContainer() {
        new RegularEvent('click', (e, target) => {
            e.preventDefault();
            this.createNewContainer(target.dataset);
        }).delegateTo(this.container, Selectors.addContainerSelector);
    }
    createNewContainer(dataset) {
        (new AjaxRequest(TYPO3.settings.ajaxUrls.record_flex_container_add)).post({
            vanillaUid: dataset.vanillauid,
            databaseRowUid: dataset.databaserowuid,
            command: dataset.command,
            tableName: dataset.tablename,
            fieldName: dataset.fieldname,
            recordTypeValue: dataset.recordtypevalue,
            dataStructureIdentifier: JSON.parse(dataset.datastructureidentifier),
            flexFormSheetName: dataset.flexformsheetname,
            flexFormFieldName: dataset.flexformfieldname,
            flexFormContainerName: dataset.flexformcontainername,
        }).then(async (response) => {
            const data = await response.resolve();
            const createdContainer = new DOMParser().parseFromString(data.html, 'text/html').body.firstElementChild;
            this.flexformContainerContainers.push(new FlexFormContainerContainer(this, createdContainer));
            const sectionContainer = document.querySelector(dataset.target);
            sectionContainer.insertAdjacentElement('beforeend', createdContainer);
            if (data.scriptCall && data.scriptCall.length > 0) {
                $.each(data.scriptCall, function (index, value) {
                    // eslint-disable-next-line no-eval
                    eval(value);
                });
            }
            if (data.stylesheetFiles && data.stylesheetFiles.length > 0) {
                $.each(data.stylesheetFiles, function (index, stylesheetFile) {
                    let element = document.createElement('link');
                    element.rel = 'stylesheet';
                    element.type = 'text/css';
                    element.href = stylesheetFile;
                    document.head.appendChild(element);
                });
            }
            this.updateToggleAllState();
            FormEngine.reinitialize();
            FormEngine.Validation.initializeInputFields();
            FormEngine.Validation.validate(sectionContainer);
        });
    }
    registerContainerDeleted() {
        new RegularEvent('formengine:flexform:container-deleted', (e) => {
            const deletedContainerId = e.detail.containerId;
            this.flexformContainerContainers = this.flexformContainerContainers.filter(flexformContainerContainer => flexformContainerContainer.getStatus().id !== deletedContainerId);
            FormEngine.Validation.validate(this.container);
            this.updateToggleAllState();
        }).bindTo(this.container);
    }
    registerPanelToggle() {
        ['hide.bs.collapse', 'show.bs.collapse'].forEach((eventName) => {
            new RegularEvent(eventName, () => {
                this.updateToggleAllState();
            }).delegateTo(this.container, Selectors.sectionContentContainerSelector);
        });
    }
    updateToggleAllState() {
        if (this.flexformContainerContainers.length > 0) {
            const firstContainer = this.flexformContainerContainers.find(Boolean);
            this.getToggleAllButton().dataset.expandAll = firstContainer.getStatus().collapsed === true ? 'true' : 'false';
        }
    }
}

export default FlexFormSectionContainer;
