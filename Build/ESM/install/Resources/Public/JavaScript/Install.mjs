import jQuery from '../../../../core/Resources/Public/JavaScript/Contrib/jquery.mjs';
import Router from './Router.mjs';

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
 * Walk through the installation process of TYPO3
 */
class Install {
    constructor() {
        jQuery(() => {
            Router.initialize();
        });
    }
}
var Install$1 = new Install();

export default Install$1;
