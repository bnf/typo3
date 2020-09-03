define(['../../../../core/Resources/Public/JavaScript/Contrib/jquery', '../../../../backend/Resources/Public/JavaScript/Tooltip'], function (jquery, Tooltip$2) { 'use strict';

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
            jquery(() => {
                Tooltip$2.initialize('.table-fit a[title]', {
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
    var Tooltip$1 = new Tooltip();

    return Tooltip$1;

});
