import AbstractClientStorage from './AbstractClientStorage.esm.js';

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
 * Module: TYPO3/CMS/Backend/Storage/BrowserSession
 * Wrapper for sessionStorage
 * @exports TYPO3/CMS/Backend/Storage/BrowserSession
 */
class BrowserSession extends AbstractClientStorage {
    constructor() {
        super();
        this.storage = sessionStorage;
    }
}
var BrowserSession$1 = new BrowserSession();

export default BrowserSession$1;
