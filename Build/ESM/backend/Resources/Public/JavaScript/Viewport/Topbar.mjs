import { ScaffoldIdentifierEnum } from '../Enum/Viewport/ScaffoldIdentifier.mjs';
import AjaxRequest from '../../../../../core/Resources/Public/JavaScript/Ajax/AjaxRequest.mjs';
import Toolbar from './Toolbar.mjs';

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
class Topbar {
    constructor() {
        this.Toolbar = new Toolbar();
    }
    refresh() {
        new AjaxRequest(TYPO3.settings.ajaxUrls.topbar).get().then(async (response) => {
            const data = await response.resolve();
            const topbar = document.querySelector(Topbar.topbarSelector);
            if (topbar !== null) {
                topbar.innerHTML = data.topbar;
                topbar.dispatchEvent(new Event('t3-topbar-update'));
            }
        });
    }
}
Topbar.topbarSelector = ScaffoldIdentifierEnum.header;

export default Topbar;
