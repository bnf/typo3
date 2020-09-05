define(['../../../../core/Resources/Public/JavaScript/Contrib/jquery/jquery', './ElementBrowser'], function (jquery, ElementBrowser) { 'use strict';

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
     * Module: TYPO3/CMS/Recordlist/BrowseDatabase
     * Database record selection
     * @exports TYPO3/CMS/Recordlist/BrowseDatabase
     */
    class BrowseDatabase {
        constructor() {
            jquery(() => {
                jquery('[data-close]').on('click', (event) => {
                    event.preventDefault();
                    const data = jquery(event.currentTarget).parents('span').data();
                    ElementBrowser.insertElement(data.table, data.uid, 'db', data.title, '', '', data.icon, '', parseInt(jquery(event.currentTarget).data('close'), 10) === 1);
                });
            });
            // adjust searchbox layout
            const searchbox = document.getElementById('db_list-searchbox-toolbar');
            searchbox.style.display = 'block';
            searchbox.style.position = 'relative';
        }
    }
    var BrowseDatabase$1 = new BrowseDatabase();

    return BrowseDatabase$1;

});
