import Severity from '../../Severity.esm.js';
import Modal from '../../Modal.esm.js';
import RegularEvent from '../../../../../../core/Resources/Public/JavaScript/Event/RegularEvent.esm.js';
import NotificationService from '../../Notification.esm.js';
import NProgress from '../../../../../../core/Resources/Public/JavaScript/Contrib/nprogress.esm.js';
import Utility from '../../Utility.esm.js';
import { MessageUtility } from '../../Utility/MessageUtility.esm.js';
import FormEngineValidation from '../../FormEngineValidation.esm.js';
import FormEngine from '../../FormEngine.esm.js';
import { AjaxDispatcher } from '../InlineRelation/AjaxDispatcher.esm.js';

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
    Selectors["toggleSelector"] = "[data-bs-toggle=\"formengine-inline\"]";
    Selectors["controlSectionSelector"] = ".t3js-formengine-irre-control";
    Selectors["createNewRecordButtonSelector"] = ".t3js-create-new-button";
    Selectors["createNewRecordBySelectorSelector"] = ".t3js-create-new-selector";
    Selectors["deleteRecordButtonSelector"] = ".t3js-editform-delete-inline-record";
})(Selectors || (Selectors = {}));
var States;
(function (States) {
    States["new"] = "inlineIsNewRecord";
    States["visible"] = "panel-visible";
    States["collapsed"] = "panel-collapsed";
    States["notLoaded"] = "t3js-not-loaded";
})(States || (States = {}));
var Separators;
(function (Separators) {
    Separators["structureSeparator"] = "-";
})(Separators || (Separators = {}));
/**
 * Module: TYPO3/CMS/Backend/FormEngine/Container/SiteLanguageContainer
 *
 * Functionality for the site language container
 *
 * @example
 * <typo3-formengine-container-sitelanguage identifier="some-id">
 *   ...
 * </typo3-formengine-container-sitelanguage>
 *
 * This is based on W3C custom elements ("web components") specification, see
 * https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements
 */
class SiteLanguageContainer extends HTMLElement {
    constructor() {
        super(...arguments);
        this.container = null;
        this.ajaxDispatcher = null;
        this.requestQueue = {};
        this.progessQueue = {};
        this.handlePostMessage = (e) => {
            if (!MessageUtility.verifyOrigin(e.origin)) {
                throw 'Denied message sent by ' + e.origin;
            }
            if (e.data.actionName === 'typo3:foreignRelation:insert') {
                if (typeof e.data.objectGroup === 'undefined') {
                    throw 'No object group defined for message';
                }
                if (e.data.objectGroup !== this.container.dataset.objectGroup) {
                    // Received message isn't provisioned for currentSiteLanguageContainer instance
                    return;
                }
                if (this.isUniqueElementUsed(parseInt(e.data.uid, 10))) {
                    NotificationService.error('There is already a relation to the selected element');
                    return;
                }
                this.importRecord([e.data.objectGroup, e.data.uid]).then(() => {
                    if (e.source) {
                        const message = {
                            actionName: 'typo3:foreignRelation:inserted',
                            objectGroup: e.data.objectId,
                            table: e.data.table,
                            uid: e.data.uid,
                        };
                        MessageUtility.send(message, e.source);
                    }
                });
            }
        };
    }
    static getInlineRecordContainer(objectId) {
        return document.querySelector('[data-object-id="' + objectId + '"]');
    }
    static getValuesFromHashMap(hashmap) {
        return Object.keys(hashmap).map((key) => hashmap[key]);
    }
    static selectOptionValueExists(selectElement, value) {
        return selectElement.querySelector('option[value="' + value + '"]') !== null;
    }
    static removeSelectOptionByValue(selectElement, value) {
        const option = selectElement.querySelector('option[value="' + value + '"]');
        if (option !== null) {
            option.remove();
        }
    }
    static reAddSelectOption(selectElement, value, unique) {
        if (SiteLanguageContainer.selectOptionValueExists(selectElement, value)) {
            return;
        }
        const options = selectElement.querySelectorAll('option');
        let index = -1;
        for (let possibleValue of Object.keys(unique.possible)) {
            if (possibleValue === value) {
                break;
            }
            for (let i = 0; i < options.length; ++i) {
                const option = options[i];
                if (option.value === possibleValue) {
                    index = i;
                    break;
                }
            }
        }
        if (index === -1) {
            index = 0;
        }
        else if (index < options.length) {
            index++;
        }
        const readdOption = document.createElement('option');
        readdOption.text = unique.possible[value];
        readdOption.value = value;
        selectElement.insertBefore(readdOption, selectElement.options[index]);
    }
    static collapseExpandRecord(objectId) {
        const recordContainer = SiteLanguageContainer.getInlineRecordContainer(objectId);
        const collapseButton = document.querySelector('[aria-controls="' + objectId + '_fields"]');
        if (recordContainer.classList.contains(States.collapsed)) {
            recordContainer.classList.remove(States.collapsed);
            recordContainer.classList.add(States.visible);
            collapseButton.setAttribute('aria-expanded', 'true');
        }
        else {
            recordContainer.classList.remove(States.visible);
            recordContainer.classList.add(States.collapsed);
            collapseButton.setAttribute('aria-expanded', 'false');
        }
    }
    connectedCallback() {
        const identifier = this.getAttribute('identifier') || '';
        this.container = this.querySelector('#' + identifier);
        if (this.container !== null) {
            this.ajaxDispatcher = new AjaxDispatcher(this.container.dataset.objectGroup);
            this.registerEvents();
        }
    }
    registerEvents() {
        this.registerCreateRecordButton();
        this.registerCreateRecordBySelector();
        this.registerRecordToggle();
        this.registerDeleteButton();
        new RegularEvent('message', this.handlePostMessage).bindTo(window);
    }
    registerCreateRecordButton() {
        const me = this;
        new RegularEvent('click', function (e) {
            var _a, _b;
            e.preventDefault();
            e.stopImmediatePropagation();
            let objectId = me.container.dataset.objectGroup;
            if (typeof this.dataset.recordUid !== 'undefined') {
                objectId += Separators.structureSeparator + this.dataset.recordUid;
            }
            me.importRecord([objectId, (_a = me.container.querySelector(Selectors.createNewRecordBySelectorSelector)) === null || _a === void 0 ? void 0 : _a.value], (_b = this.dataset.recordUid) !== null && _b !== void 0 ? _b : null);
        }).delegateTo(this.container, Selectors.createNewRecordButtonSelector);
    }
    registerCreateRecordBySelector() {
        const me = this;
        new RegularEvent('change', function (e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            const selectTarget = this;
            const recordUid = selectTarget.options[selectTarget.selectedIndex].getAttribute('value');
            me.importRecord([me.container.dataset.objectGroup, recordUid]);
        }).delegateTo(this.container, Selectors.createNewRecordBySelectorSelector);
    }
    registerRecordToggle() {
        const me = this;
        new RegularEvent('click', function (e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            me.loadRecordDetails(this.closest(Selectors.toggleSelector).parentElement.dataset.objectId);
        }).delegateTo(this.container, `${Selectors.toggleSelector} .form-irre-header-cell:not(${Selectors.controlSectionSelector}`);
    }
    registerDeleteButton() {
        const me = this;
        new RegularEvent('click', function (e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            const title = TYPO3.lang['label.confirm.delete_record.title'] || 'Delete this record?';
            const content = TYPO3.lang['label.confirm.delete_record.content'] || 'Are you sure you want to delete this record?';
            Modal.confirm(title, content, Severity.warning, [
                {
                    text: TYPO3.lang['buttons.confirm.delete_record.no'] || 'Cancel',
                    active: true,
                    btnClass: 'btn-default',
                    name: 'no',
                },
                {
                    text: TYPO3.lang['buttons.confirm.delete_record.yes'] || 'Yes, delete this record',
                    btnClass: 'btn-warning',
                    name: 'yes',
                    trigger: () => {
                        me.deleteRecord(this.closest('[data-object-id]').dataset.objectId);
                        Modal.currentModal.trigger('modal-dismiss');
                    }
                },
            ]);
        }).delegateTo(this.container, Selectors.deleteRecordButtonSelector);
    }
    createRecord(uid, markup, afterUid = null, selectedValue = null) {
        let objectId = this.container.dataset.objectGroup;
        if (afterUid !== null) {
            objectId += Separators.structureSeparator + afterUid;
            SiteLanguageContainer.getInlineRecordContainer(objectId).insertAdjacentHTML('afterend', markup);
            this.memorizeAddRecord(uid, afterUid, selectedValue);
        }
        else {
            document.getElementById(this.container.getAttribute('id') + '_records').insertAdjacentHTML('beforeend', markup);
            this.memorizeAddRecord(uid, null, selectedValue);
        }
    }
    async importRecord(params, afterUid) {
        return this.ajaxDispatcher.send(this.ajaxDispatcher.newRequest(this.ajaxDispatcher.getEndpoint('site_configuration_inline_create')), params).then(async (response) => {
            this.createRecord(response.compilerInput.uid, response.data, typeof afterUid !== 'undefined' ? afterUid : null, typeof response.compilerInput.childChildUid !== 'undefined' ? response.compilerInput.childChildUid : null);
        });
    }
    loadRecordDetails(objectId) {
        const recordFieldsContainer = document.getElementById(objectId + '_fields');
        const recordContainer = SiteLanguageContainer.getInlineRecordContainer(objectId);
        const isLoading = typeof this.requestQueue[objectId] !== 'undefined';
        const isLoaded = recordFieldsContainer !== null && !recordContainer.classList.contains(States.notLoaded);
        if (!isLoaded) {
            const progress = this.getProgress(objectId, recordContainer.dataset.objectIdHash);
            if (!isLoading) {
                const ajaxRequest = this.ajaxDispatcher.newRequest(this.ajaxDispatcher.getEndpoint('site_configuration_inline_details'));
                const request = this.ajaxDispatcher.send(ajaxRequest, [objectId]);
                request.then(async (response) => {
                    delete this.requestQueue[objectId];
                    delete this.progessQueue[objectId];
                    recordContainer.classList.remove(States.notLoaded);
                    recordFieldsContainer.innerHTML = response.data;
                    SiteLanguageContainer.collapseExpandRecord(objectId);
                    progress.done();
                    FormEngine.reinitialize();
                    FormEngineValidation.initializeInputFields();
                    FormEngineValidation.validate(this.container);
                    this.removeUsed(SiteLanguageContainer.getInlineRecordContainer(objectId));
                });
                this.requestQueue[objectId] = ajaxRequest;
                progress.start();
            }
            else {
                // Abort loading if collapsed again
                this.requestQueue[objectId].abort();
                delete this.requestQueue[objectId];
                delete this.progessQueue[objectId];
                progress.done();
            }
            return;
        }
        SiteLanguageContainer.collapseExpandRecord(objectId);
    }
    memorizeAddRecord(newUid, afterUid = null, selectedValue = null) {
        const formField = this.getFormFieldForElements();
        if (formField === null) {
            return;
        }
        let records = Utility.trimExplode(',', formField.value);
        if (afterUid) {
            const newRecords = [];
            for (let i = 0; i < records.length; i++) {
                if (records[i].length) {
                    newRecords.push(records[i]);
                }
                if (afterUid === records[i]) {
                    newRecords.push(newUid);
                }
            }
            records = newRecords;
        }
        else {
            records.push(newUid);
        }
        formField.value = records.join(',');
        formField.classList.add('has-change');
        document.dispatchEvent(new Event('change'));
        this.setUnique(newUid, selectedValue);
        FormEngine.reinitialize();
        FormEngineValidation.initializeInputFields();
        FormEngineValidation.validate(this.container);
    }
    memorizeRemoveRecord(objectUid) {
        const formField = this.getFormFieldForElements();
        if (formField === null) {
            return [];
        }
        let records = Utility.trimExplode(',', formField.value);
        const indexOfRemoveUid = records.indexOf(objectUid);
        if (indexOfRemoveUid > -1) {
            delete records[indexOfRemoveUid];
            formField.value = records.join(',');
            formField.classList.add('has-change');
            document.dispatchEvent(new Event('change'));
        }
        return records;
    }
    deleteRecord(objectId, forceDirectRemoval = false) {
        const recordContainer = SiteLanguageContainer.getInlineRecordContainer(objectId);
        const objectUid = recordContainer.dataset.objectUid;
        recordContainer.classList.add('t3js-inline-record-deleted');
        if (!recordContainer.classList.contains(States.new) && !forceDirectRemoval) {
            const deleteCommandInput = this.container.querySelector('[name="cmd' + recordContainer.dataset.fieldName + '[delete]"]');
            deleteCommandInput.removeAttribute('disabled');
            // Move input field to inline container so we can remove the record container
            recordContainer.parentElement.insertAdjacentElement('afterbegin', deleteCommandInput);
        }
        new RegularEvent('transitionend', () => {
            recordContainer.parentElement.removeChild(recordContainer);
            FormEngineValidation.validate(this.container);
        }).bindTo(recordContainer);
        this.revertUnique(objectUid);
        this.memorizeRemoveRecord(objectUid);
        recordContainer.classList.add('form-irre-object--deleted');
    }
    getProgress(objectId, objectIdHash) {
        const headerIdentifier = '#' + objectIdHash + '_header';
        let progress;
        if (typeof this.progessQueue[objectId] !== 'undefined') {
            progress = this.progessQueue[objectId];
        }
        else {
            progress = NProgress;
            progress.configure({ parent: headerIdentifier, showSpinner: false });
            this.progessQueue[objectId] = progress;
        }
        return progress;
    }
    getFormFieldForElements() {
        const formFields = document.getElementsByName(this.container.dataset.formField);
        if (formFields.length > 0) {
            return formFields[0];
        }
        return null;
    }
    isUniqueElementUsed(uid) {
        const unique = TYPO3.settings.FormEngineInline.unique[this.container.dataset.objectGroup];
        return SiteLanguageContainer.getValuesFromHashMap(unique.used).indexOf(uid) !== -1;
    }
    removeUsed(recordContainer) {
        const unique = TYPO3.settings.FormEngineInline.unique[this.container.dataset.objectGroup];
        const values = SiteLanguageContainer.getValuesFromHashMap(unique.used);
        let uniqueValueField = recordContainer.querySelector('[name="data[' + unique.table + '][' + recordContainer.dataset.objectUid + '][' + unique.field + ']"]');
        if (uniqueValueField !== null) {
            const selectedValue = uniqueValueField.options[uniqueValueField.selectedIndex].value;
            for (let value of values) {
                if (value !== selectedValue) {
                    SiteLanguageContainer.removeSelectOptionByValue(uniqueValueField, value);
                }
            }
        }
    }
    setUnique(recordUid, selectedValue) {
        const unique = TYPO3.settings.FormEngineInline.unique[this.container.dataset.objectGroup];
        const selectorElement = document.getElementById(this.container.dataset.objectGroup + '_selector');
        if (unique.max !== -1) {
            const formField = this.getFormFieldForElements();
            const recordObjectId = this.container.dataset.objectGroup + Separators.structureSeparator + recordUid;
            const recordContainer = SiteLanguageContainer.getInlineRecordContainer(recordObjectId);
            let uniqueValueField = recordContainer.querySelector('[name="data[' + unique.table + '][' + recordUid + '][' + unique.field + ']"]');
            const values = SiteLanguageContainer.getValuesFromHashMap(unique.used);
            if (selectorElement !== null) {
                // remove all items from the new select-item which are already used in other children
                if (uniqueValueField !== null) {
                    for (let value of values) {
                        SiteLanguageContainer.removeSelectOptionByValue(uniqueValueField, value);
                    }
                }
                for (let value of values) {
                    SiteLanguageContainer.removeSelectOptionByValue(uniqueValueField, value);
                }
                if (typeof unique.used.length !== 'undefined') {
                    unique.used = {};
                }
                unique.used[recordUid] = {
                    table: unique.elTable,
                    uid: selectedValue,
                };
            }
            // remove the newly used item from each select-field of the child records
            if (formField !== null && SiteLanguageContainer.selectOptionValueExists(selectorElement, selectedValue)) {
                const records = Utility.trimExplode(',', formField.value);
                for (let record of records) {
                    uniqueValueField = document.querySelector('[name="data[' + unique.table + '][' + record + '][' + unique.field + ']"]');
                    if (uniqueValueField !== null && record !== recordUid) {
                        SiteLanguageContainer.removeSelectOptionByValue(uniqueValueField, selectedValue);
                    }
                }
            }
        }
        // remove used items from the selector
        if (SiteLanguageContainer.selectOptionValueExists(selectorElement, selectedValue)) {
            SiteLanguageContainer.removeSelectOptionByValue(selectorElement, selectedValue);
            unique.used[recordUid] = {
                table: unique.elTable,
                uid: selectedValue,
            };
        }
    }
    revertUnique(recordUid) {
        const unique = TYPO3.settings.FormEngineInline.unique[this.container.dataset.objectGroup];
        const recordObjectId = this.container.dataset.objectGroup + Separators.structureSeparator + recordUid;
        const recordContainer = SiteLanguageContainer.getInlineRecordContainer(recordObjectId);
        let uniqueValueField = recordContainer.querySelector('[name="data[' + unique.table + '][' + recordContainer.dataset.objectUid + '][' + unique.field + ']"]');
        let uniqueValue;
        if (uniqueValueField !== null) {
            uniqueValue = uniqueValueField.value;
        }
        else if (recordContainer.dataset.tableUniqueOriginalValue !== '') {
            uniqueValue = recordContainer.dataset.tableUniqueOriginalValue.replace(unique.table + '_', '');
        }
        else {
            return;
        }
        // 9223372036854775807 is the PHP_INT_MAX placeholder, used to allow creation of new records.
        // This option however should never be displayed in the selector box at is therefore checked.
        if (!isNaN(parseInt(uniqueValue, 10)) && parseInt(uniqueValue, 10) !== 9223372036854775807) {
            const selectorElement = document.getElementById(this.container.dataset.objectGroup + '_selector');
            SiteLanguageContainer.reAddSelectOption(selectorElement, uniqueValue, unique);
        }
        if (unique.max === -1) {
            return;
        }
        const formField = this.getFormFieldForElements();
        if (formField === null) {
            return;
        }
        const records = Utility.trimExplode(',', formField.value);
        let recordObj;
        // walk through all records on that level and get the select field
        for (let i = 0; i < records.length; i++) {
            recordObj = document.querySelector('[name="data[' + unique.table + '][' + records[i] + '][' + unique.field + ']"]');
            if (recordObj !== null) {
                SiteLanguageContainer.reAddSelectOption(recordObj, uniqueValue, unique);
            }
        }
        delete unique.used[recordUid];
    }
}
window.customElements.define('typo3-formengine-container-sitelanguage', SiteLanguageContainer);
