define(['../../../../core/Resources/Public/JavaScript/Contrib/jquery/jquery'], function (jquery) { 'use strict';

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
            jquery(() => {
                jquery('.fieldSelectBox .checkAll').on('change', (event) => {
                    const checked = jquery(event.currentTarget).prop('checked');
                    const $checkboxes = jquery('.fieldSelectBox tbody').find(':checkbox');
                    $checkboxes.each((index, elem) => {
                        if (!jquery(elem).prop('disabled')) {
                            jquery(elem).prop('checked', checked);
                        }
                    });
                });
            });
        }
    }
    var FieldSelectBox$1 = new FieldSelectBox();

    return FieldSelectBox$1;

});
