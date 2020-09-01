define(['jquery', '../../../../backend/Resources/Public/TypeScript/Tooltip'], function ($, Tooltip$1) { 'use strict';

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
     * Module: TYPO3/CMS/Recordlist/Tooltip
     * API for tooltip windows powered by Twitter Bootstrap.
     * @exports TYPO3/CMS/Recordlist/Tooltip
     */
    class Tooltip {
        constructor() {
            $__default['default'](() => {
                Tooltip$1.initialize('.table-fit a[title]', {
                    delay: {
                        show: 500,
                        hide: 100,
                    },
                    trigger: 'hover',
                    container: 'body',
                });
            });
        }
    }
    new Tooltip();

});
