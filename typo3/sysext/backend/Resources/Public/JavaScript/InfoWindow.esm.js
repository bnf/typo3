import { SeverityEnum } from './Enum/Severity.esm.js';
import Modal from './Modal.esm.js';

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
 * Module: TYPO3/CMS/Backend/InfoWindow
 * @exports TYPO3/CMS/Backend/InfoWindow
 */
class InfoWindow {
    /**
     * Shows the info modal
     *
     * @param {string} table
     * @param {string | number} uid
     */
    static showItem(table, uid) {
        Modal.advanced({
            type: Modal.types.iframe,
            size: Modal.sizes.large,
            content: top.TYPO3.settings.ShowItem.moduleUrl
                + '&table=' + encodeURIComponent(table)
                + '&uid=' + (typeof uid === 'number' ? uid : encodeURIComponent(uid)),
            severity: SeverityEnum.notice,
        });
    }
}
if (!top.TYPO3.InfoWindow) {
    top.TYPO3.InfoWindow = InfoWindow;
}
// expose as global object
TYPO3.InfoWindow = InfoWindow;

export default InfoWindow;
