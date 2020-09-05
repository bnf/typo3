import RegularEvent from '../../../../core/Resources/Public/JavaScript/Event/RegularEvent.esm.js';
import documentService from '../../../../core/Resources/Public/JavaScript/DocumentService.esm.js';

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
    Selectors["searchFieldSelector"] = "#search_field";
})(Selectors || (Selectors = {}));
/**
 * Module: TYPO3/CMS/Recordlist/RecordSearch
 * Usability improvements for the record search
 * @exports TYPO3/CMS/Recordlist/RecordSearch
 */
class RecordSearch {
    constructor() {
        this.searchField = document.querySelector(Selectors.searchFieldSelector);
        this.activeSearch = this.searchField ? (this.searchField.value !== '') : false;
        documentService.ready().then(() => {
            // Respond to browser related clearable event
            if (this.searchField) {
                new RegularEvent('search', () => {
                    if (this.searchField.value === '' && this.activeSearch) {
                        this.searchField.closest('form').submit();
                    }
                }).bindTo(this.searchField);
            }
        });
    }
}
var RecordSearch$1 = new RecordSearch();

export default RecordSearch$1;
