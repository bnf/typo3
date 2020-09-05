import $ from '../../../../core/Resources/Public/JavaScript/Contrib/jquery.esm.js';
import FormEngine from './FormEngine.esm.js';
import '../../../../core/Resources/Public/JavaScript/Contrib/jquery.autocomplete.esm.js';

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
class FormEngineSuggest {
    constructor(element) {
        $(() => {
            this.initialize(element);
        });
    }
    initialize(searchField) {
        const containerElement = searchField.closest('.t3-form-suggest-container');
        const tableName = searchField.dataset.tablename;
        const fieldName = searchField.dataset.fieldname;
        const formEl = searchField.dataset.field;
        const uid = parseInt(searchField.dataset.uid, 10);
        const pid = parseInt(searchField.dataset.pid, 10);
        const dataStructureIdentifier = searchField.dataset.datastructureidentifier;
        const flexFormSheetName = searchField.dataset.flexformsheetname;
        const flexFormFieldName = searchField.dataset.flexformfieldname;
        const flexFormContainerName = searchField.dataset.flexformcontainername;
        const flexFormContainerFieldName = searchField.dataset.flexformcontainerfieldname;
        const minimumCharacters = parseInt(searchField.dataset.minchars, 10);
        const url = TYPO3.settings.ajaxUrls.record_suggest;
        const params = {
            tableName,
            fieldName,
            uid,
            pid,
            dataStructureIdentifier,
            flexFormSheetName,
            flexFormFieldName,
            flexFormContainerName,
            flexFormContainerFieldName,
        };
        function insertValue(element) {
            let insertData = '';
            if (searchField.dataset.fieldtype === 'select') {
                insertData = element.dataset.uid;
            }
            else {
                insertData = element.dataset.table + '_' + element.dataset.uid;
            }
            FormEngine.setSelectOptionFromExternalSource(formEl, insertData, element.dataset.label, element.dataset.label);
            FormEngine.Validation.markFieldAsChanged($(document.querySelector('input[name="' + formEl + '"]')));
        }
        $(searchField).autocomplete({
            // ajax options
            serviceUrl: url,
            params: params,
            type: 'POST',
            paramName: 'value',
            dataType: 'json',
            minChars: minimumCharacters,
            groupBy: 'typeLabel',
            containerClass: 'autocomplete-results',
            appendTo: containerElement,
            forceFixPosition: false,
            preserveInput: true,
            showNoSuggestionNotice: true,
            noSuggestionNotice: '<div class="autocomplete-info">No results</div>',
            minLength: minimumCharacters,
            preventBadQueries: false,
            // put the AJAX results in the right format
            transformResult: (response) => {
                return {
                    suggestions: response.map((dataItem) => {
                        return { value: dataItem.text, data: dataItem };
                    }),
                };
            },
            // Rendering of each item
            formatResult: (suggestion) => {
                return $('<div>').append($('<a class="autocomplete-suggestion-link" href="#">' +
                    suggestion.data.sprite + suggestion.data.text +
                    '</a></div>').attr({
                    'data-label': suggestion.data.label,
                    'data-table': suggestion.data.table,
                    'data-uid': suggestion.data.uid,
                })).html();
            },
            onSearchComplete: function () {
                containerElement.classList.add('open');
            },
            beforeRender: function (container) {
                // Unset height, width and z-index again, should be fixed by the plugin at a later point
                container.attr('style', '');
                containerElement.classList.add('open');
            },
            onHide: function () {
                containerElement.classList.remove('open');
            },
            onSelect: function () {
                insertValue((containerElement.querySelector('.autocomplete-selected a')));
            },
        });
    }
}

export default FormEngineSuggest;
