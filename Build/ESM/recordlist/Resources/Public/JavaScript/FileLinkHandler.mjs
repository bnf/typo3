import $ from 'jquery';
import Tree from 'TYPO3/CMS/Backend/LegacyTree';
import LinkBrowser from './LinkBrowser.mjs';

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
 * Module: TYPO3/CMS/Recordlist/FileLinkHandler
 * File link interaction
 * @exports TYPO3/CMS/Recordlist/FileLinkHandler
 */
class FileLinkHandler {
    constructor() {
        this.currentLink = '';
        this.linkFile = (event) => {
            event.preventDefault();
            LinkBrowser.finalizeFunction($(event.currentTarget).attr('href'));
        };
        this.linkCurrent = (event) => {
            event.preventDefault();
            LinkBrowser.finalizeFunction(this.currentLink);
        };
        // until we use onclick attributes, we need the Tree component
        Tree.noop();
        $(() => {
            this.currentLink = $('body').data('currentLink');
            $('a.t3js-fileLink').on('click', this.linkFile);
            $('input.t3js-linkCurrent').on('click', this.linkCurrent);
        });
    }
}
var FileLinkHandler$1 = new FileLinkHandler();

export default FileLinkHandler$1;
