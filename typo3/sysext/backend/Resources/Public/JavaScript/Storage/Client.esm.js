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
 * Module: TYPO3/CMS/Backend/Storage/Client
 * Wrapper for localStorage
 * @exports TYPO3/CMS/Backend/Storage/Client
 */
class Client extends AbstractClientStorage {
    constructor() {
        super();
        this.storage = localStorage;
    }
}
var Client$1 = new Client();

export default Client$1;
