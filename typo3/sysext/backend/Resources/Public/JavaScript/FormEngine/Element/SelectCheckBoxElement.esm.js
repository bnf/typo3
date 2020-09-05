import jQuery from '../../../../../../core/Resources/Public/JavaScript/Contrib/jquery/jquery.esm.js';
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
        this.$table = null;
        this.checkedBoxes = null;
        this.checkBoxId = checkBoxId;
        jQuery(() => {
            this.$table = jQuery('#' + checkBoxId).closest('table');
            this.checkedBoxes = this.$table.find(Identifier.singleItem + ':checked');
            this.enableTriggerCheckBox();
            this.registerEventHandler();
        });
    }
    /**
     * Determines whether all available checkboxes are checked
     *
     * @param {JQuery} $checkBoxes
     * @return {boolean}
     */
    static allCheckBoxesAreChecked($checkBoxes) {
        return $checkBoxes.length === $checkBoxes.filter(':checked').length;
    }
    /**
     * Registers the events for clicking the "Toggle all" and the single item checkboxes
     */
    registerEventHandler() {
        this.$table.on('change', Identifier.toggleAll, (e) => {
            const $me = jQuery(e.currentTarget);
            const $checkBoxes = this.$table.find(Identifier.singleItem);
            const checkIt = !SelectCheckBoxElement.allCheckBoxesAreChecked($checkBoxes);
            $checkBoxes.prop('checked', checkIt);
            $me.prop('checked', checkIt);
            FormEngine.Validation.markFieldAsChanged($me);
        }).on('change', Identifier.singleItem, () => {
            this.setToggleAllState();
        }).on('click', Identifier.revertSelection, () => {
            this.$table.find(Identifier.singleItem).each((_, checkbox) => {
                checkbox.checked = this.checkedBoxes.index(checkbox) > -1;
            });
            this.setToggleAllState();
        });
    }
    setToggleAllState() {
        const $checkBoxes = this.$table.find(Identifier.singleItem);
        const checkIt = SelectCheckBoxElement.allCheckBoxesAreChecked($checkBoxes);
        this.$table.find(Identifier.toggleAll).prop('checked', checkIt);
    }
    /**
     * Enables the "Toggle all" checkbox on document load if all child checkboxes are checked
     */
    enableTriggerCheckBox() {
        const $checkBoxes = this.$table.find(Identifier.singleItem);
        const checkIt = SelectCheckBoxElement.allCheckBoxesAreChecked($checkBoxes);
        jQuery('#' + this.checkBoxId).prop('checked', checkIt);
    }
}

export default SelectCheckBoxElement;
