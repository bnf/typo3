define(['jquery', '../../../../backend/Resources/Public/JavaScript/Modal'], function ($, Modal) { 'use strict';

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
     * Module: TYPO3/CMS/Impexp/ImportExport
     * JavaScript to handle confirm windows in the Import/Export module
     * @exports TYPO3/CMS/Impexp/ImportExport
     */
    class ImportExport {
        constructor() {
            $__default['default'](() => {
                $__default['default'](document).on('click', '.t3js-confirm-trigger', (e) => {
                    const $button = $__default['default'](e.currentTarget);
                    Modal.confirm($button.data('title'), $button.data('message'))
                        .on('confirm.button.ok', () => {
                        $__default['default']('#t3js-submit-field')
                            .attr('name', $button.attr('name'))
                            .closest('form').trigger('submit');
                        Modal.currentModal.trigger('modal-dismiss');
                    })
                        .on('confirm.button.cancel', () => {
                        Modal.currentModal.trigger('modal-dismiss');
                    });
                });
                $__default['default']('.t3js-impexp-toggledisabled').on('click', () => {
                    const $checkboxes = $__default['default']('table.t3js-impexp-preview tr[data-active="hidden"] input.t3js-exclude-checkbox');
                    if ($checkboxes.length) {
                        const $firstCheckbox = $checkboxes.get(0);
                        $checkboxes.prop('checked', !$firstCheckbox.checked);
                    }
                });
            });
        }
    }
    var ImportExport$1 = new ImportExport();

    return ImportExport$1;

});
