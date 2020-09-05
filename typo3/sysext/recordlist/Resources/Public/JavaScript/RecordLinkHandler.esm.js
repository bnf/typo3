import RegularEvent from '../../../../core/Resources/Public/JavaScript/Event/RegularEvent.esm.js';
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
        new RegularEvent('click', (evt, targetEl) => {
            evt.preventDefault();
            const data = targetEl.closest('span').dataset;
            LinkBrowser.finalizeFunction(document.body.dataset.identifier + data.uid);
        }).delegateTo(document, '[data-close]');
        new RegularEvent('click', (evt, targetEl) => {
            evt.preventDefault();
            LinkBrowser.finalizeFunction(document.body.dataset.currentLink);
        }).delegateTo(document, 'input.t3js-linkCurrent');
    }
}
var RecordLinkHandler$1 = new RecordLinkHandler();

export default RecordLinkHandler$1;
