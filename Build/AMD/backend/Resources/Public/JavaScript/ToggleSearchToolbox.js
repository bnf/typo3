define(['jquery', './Input/Clearable', './DocumentHeader'], function ($, Clearable, DocumentHeader) { 'use strict';

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    var $__default = /*#__PURE__*/_interopDefaultLegacy($);

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
     * Module: TYPO3/CMS/Backend/ToggleSearchToolbox
     * Toggle the search toolbox
     * @exports TYPO3/CMS/Backend/ToggleSearchToolbox
     */
    class ToggleSearchToolbox {
        constructor() {
            $__default['default'](() => {
                this.initialize();
            });
        }
        initialize() {
            const $toolbar = $__default['default']('#db_list-searchbox-toolbar');
            $__default['default']('.t3js-toggle-search-toolbox').on('click', () => {
                $toolbar.toggle();
                DocumentHeader.reposition();
                if ($toolbar.is(':visible')) {
                    $__default['default']('#search_field').focus();
                }
            });
            let searchField;
            if ((searchField = document.getElementById('search_field')) !== null) {
                const searchResultShown = ('' !== searchField.value);
                // make search field clearable
                searchField.clearable({
                    onClear: (input) => {
                        if (searchResultShown) {
                            input.closest('form').trigger('submit');
                        }
                    },
                });
            }
        }
    }
    var ToggleSearchToolbox$1 = new ToggleSearchToolbox();

    return ToggleSearchToolbox$1;

});
