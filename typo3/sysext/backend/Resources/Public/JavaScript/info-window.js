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
import{SeverityEnum as e}from"@typo3/backend/enum/severity.js"
import o from"@typo3/backend/modal.js"
class t{static showItem(t,n){o.advanced({type:o.types.iframe,size:o.sizes.large,content:top.TYPO3.settings.ShowItem.moduleUrl+"&table="+encodeURIComponent(t)+"&uid="+("number"==typeof n?n:encodeURIComponent(n)),severity:e.notice})}}top.TYPO3.InfoWindow||(top.TYPO3.InfoWindow=t),TYPO3.InfoWindow=t
export default t
