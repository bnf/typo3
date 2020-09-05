import $ from '../../../../core/Resources/Public/JavaScript/Contrib/jquery.esm.js';
import LinkBrowser from './LinkBrowser.esm.js';

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
 * Module: TYPO3/CMS/Recordlist/RecordLinkHandler
 * record link interaction
 */
class RecordLinkHandler {
    constructor() {
        this.currentLink = '';
        this.identifier = '';
        /**
         * @param {JQueryEventObject} event
         */
        this.linkRecord = (event) => {
            event.preventDefault();
            const data = $(event.currentTarget).parents('span').data();
            LinkBrowser.finalizeFunction(this.identifier + data.uid);
        };
        /**
         * @param {JQueryEventObject} event
         */
        this.linkCurrent = (event) => {
            event.preventDefault();
            LinkBrowser.finalizeFunction(this.currentLink);
        };
        $(() => {
            const body = $('body');
            this.currentLink = body.data('currentLink');
            this.identifier = body.data('identifier');
            // adjust searchbox layout
            const searchbox = document.getElementById('db_list-searchbox-toolbar');
            searchbox.style.display = 'block';
            searchbox.style.position = 'relative';
            $('[data-close]').on('click', this.linkRecord);
            $('input.t3js-linkCurrent').on('click', this.linkCurrent);
        });
    }
}
var RecordLinkHandler$1 = new RecordLinkHandler();

export default RecordLinkHandler$1;
