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
define(["./Enum/Severity","./Modal"],(function(e,t){"use strict";class n{static showItem(n,o){t.advanced({type:t.types.iframe,size:t.sizes.large,content:top.TYPO3.settings.ShowItem.moduleUrl+"&table="+encodeURIComponent(n)+"&uid="+("number"==typeof o?o:encodeURIComponent(o)),severity:e.SeverityEnum.notice})}}return top.TYPO3.InfoWindow||(top.TYPO3.InfoWindow=n),TYPO3.InfoWindow=n,n}));