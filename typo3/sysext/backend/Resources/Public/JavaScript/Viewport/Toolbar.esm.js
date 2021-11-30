import jQuery from '../../../../../core/Resources/Public/JavaScript/Contrib/jquery/jquery.esm.js';
import { ScaffoldIdentifierEnum } from '../Enum/Viewport/ScaffoldIdentifier.esm.js';

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
class Toolbar {
    registerEvent(callback) {
        jQuery(callback);
        jQuery(ScaffoldIdentifierEnum.header).on('t3-topbar-update', callback);
    }
}

export default Toolbar;
