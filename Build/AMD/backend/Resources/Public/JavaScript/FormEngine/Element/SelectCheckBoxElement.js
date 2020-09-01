define(['../../../../../../core/Resources/Public/JavaScript/Event/RegularEvent', '../../../../../../core/Resources/Public/JavaScript/DocumentService'], function (RegularEvent, DocumentService) { 'use strict';

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
    var Identifier;
    (function (Identifier) {
        Identifier["toggleAll"] = ".t3js-toggle-checkboxes";
        Identifier["singleItem"] = ".t3js-checkbox";
        Identifier["revertSelection"] = ".t3js-revert-selection";
    })(Identifier || (Identifier = {}));
    class SelectCheckBoxElement {
        /**
         * @param {string} checkBoxId
         */
        constructor(checkBoxId) {
            this.checkBoxId = '';
            this.table = null;
            this.checkedBoxes = null;
            this.checkBoxId = checkBoxId;
            DocumentService.ready().then((document) => {
                this.table = document.getElementById(checkBoxId).closest('table');
                this.checkedBoxes = this.table.querySelectorAll(Identifier.singleItem + ':checked');
                this.enableTriggerCheckBox();
                this.registerEventHandler();
            });
        }
        /**
         * Determines whether all available checkboxes are checked
         *
         * @param {NodeListOf<HTMLInputElement>} checkBoxes
         * @return {boolean}
         */
        static allCheckBoxesAreChecked(checkBoxes) {
            const checkboxArray = Array.from(checkBoxes);
            return checkBoxes.length === checkboxArray.filter((checkBox) => checkBox.checked).length;
        }
        /**
         * Registers the events for clicking the "Toggle all" and the single item checkboxes
         */
        registerEventHandler() {
            new RegularEvent('change', (e, currentTarget) => {
                const checkBoxes = this.table.querySelectorAll(Identifier.singleItem);
                const checkIt = !SelectCheckBoxElement.allCheckBoxesAreChecked(checkBoxes);
                checkBoxes.forEach((checkBox) => {
                    checkBox.checked = checkIt;
                });
                currentTarget.checked = checkIt;
            }).delegateTo(this.table, Identifier.toggleAll);
            new RegularEvent('change', this.setToggleAllState.bind(this)).delegateTo(this.table, Identifier.singleItem);
            new RegularEvent('click', () => {
                const checkBoxes = this.table.querySelectorAll(Identifier.singleItem);
                const checkedCheckBoxesAsArray = Array.from(this.checkedBoxes);
                checkBoxes.forEach((checkBox) => {
                    checkBox.checked = checkedCheckBoxesAsArray.includes(checkBox);
                });
                this.setToggleAllState();
            }).delegateTo(this.table, Identifier.revertSelection);
        }
        setToggleAllState() {
            const checkBoxes = this.table.querySelectorAll(Identifier.singleItem);
            this.table.querySelector(Identifier.toggleAll).checked = SelectCheckBoxElement.allCheckBoxesAreChecked(checkBoxes);
        }
        /**
         * Enables the "Toggle all" checkbox on document load if all child checkboxes are checked
         */
        enableTriggerCheckBox() {
            const checkBoxes = this.table.querySelectorAll(Identifier.singleItem);
            document.getElementById(this.checkBoxId).checked = SelectCheckBoxElement.allCheckBoxesAreChecked(checkBoxes);
        }
    }

    return SelectCheckBoxElement;

});
