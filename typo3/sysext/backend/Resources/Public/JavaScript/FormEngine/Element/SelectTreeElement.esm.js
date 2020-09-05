import SelectTree from './SelectTree.esm.js';

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
class SelectTreeElement {
    constructor(treeWrapperId, treeRecordFieldId, callback) {
        this.treeWrapper = null;
        this.recordField = null;
        this.callback = null;
        this.treeWrapper = document.getElementById(treeWrapperId);
        this.recordField = document.getElementById(treeRecordFieldId);
        this.callback = callback;
        this.initialize();
    }
    initialize() {
        const dataUrl = this.generateRequestUrl();
        const tree = new SelectTree();
        const settings = {
            dataUrl: dataUrl,
            showIcons: true,
            showCheckboxes: true,
            readOnlyMode: parseInt(this.recordField.dataset.readOnly, 10) === 1,
            input: this.recordField,
            exclusiveNodesIdentifiers: this.recordField.dataset.treeExclusiveKeys,
            validation: JSON.parse(this.recordField.dataset.formengineValidationRules)[0],
            expandUpToLevel: this.recordField.dataset.treeExpandUpToLevel,
        };
        const initialized = tree.initialize(this.treeWrapper, settings);
        if (!initialized) {
            return;
        }
        tree.dispatch.on('nodeSelectedAfter.requestUpdate', this.callback);
        if (this.recordField.dataset.treeShowToolbar) {
            import('./TreeToolbar.esm.js').then(({ default: TreeToolbar }) => {
                const selectTreeToolbar = new TreeToolbar();
                selectTreeToolbar.initialize(this.treeWrapper);
            });
        }
    }
    generateRequestUrl() {
        const params = {
            tableName: this.recordField.dataset.tablename,
            fieldName: this.recordField.dataset.fieldname,
            uid: this.recordField.dataset.uid,
            recordTypeValue: this.recordField.dataset.recordtypevalue,
            dataStructureIdentifier: this.recordField.dataset.datastructureidentifier !== ''
                ? JSON.parse(this.recordField.dataset.datastructureidentifier)
                : '',
            flexFormSheetName: this.recordField.dataset.flexformsheetname,
            flexFormFieldName: this.recordField.dataset.flexformfieldname,
            flexFormContainerName: this.recordField.dataset.flexformcontainername,
            flexFormContainerIdentifier: this.recordField.dataset.flexformcontaineridentifier,
            flexFormContainerFieldName: this.recordField.dataset.flexformcontainerfieldname,
            flexFormSectionContainerIsNew: this.recordField.dataset.flexformsectioncontainerisnew,
            command: this.recordField.dataset.command,
        };
        return TYPO3.settings.ajaxUrls.record_tree_data + '&' + $.param(params);
    }
}

export default SelectTreeElement;
