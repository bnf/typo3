define(['jquery'], function ($) { 'use strict';

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
     * Module: TYPO3/CMS/Recordlist/FieldSelectBox
     * Check-all / uncheck-all for the Database Recordlist fieldSelectBox
     * @exports TYPO3/CMS/Recordlist/FieldSelectBox
     */
    class FieldSelectBox {
        constructor() {
            $__default['default'](() => {
                $__default['default']('.fieldSelectBox .checkAll').on('change', (event) => {
                    const checked = $__default['default'](event.currentTarget).prop('checked');
                    const $checkboxes = $__default['default']('.fieldSelectBox tbody').find(':checkbox');
                    $checkboxes.each((index, elem) => {
                        if (!$__default['default'](elem).prop('disabled')) {
                            $__default['default'](elem).prop('checked', checked);
                        }
                    });
                });
            });
        }
    }
    var FieldSelectBox$1 = new FieldSelectBox();

    return FieldSelectBox$1;

});
