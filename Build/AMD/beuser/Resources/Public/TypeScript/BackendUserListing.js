define(['../../../../backend/Resources/Public/TypeScript/Input/Clearable'], function (Clearable) { 'use strict';

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
     * Module: TYPO3/CMS/Beuser/BackendUserListing
     * JavaScript for backend user listing
     * @exports TYPO3/CMS/Beuser/BackendUserListing
     */
    class BackendUserListing {
        constructor() {
            let searchField;
            if ((searchField = document.getElementById('tx_Beuser_username')) !== null) {
                const searchResultShown = ('' !== searchField.value);
                // make search field clearable
                searchField.clearable({
                    onClear: (input) => {
                        if (searchResultShown) {
                            input.closest('form').submit();
                        }
                    },
                });
            }
        }
    }
    new BackendUserListing();

});
