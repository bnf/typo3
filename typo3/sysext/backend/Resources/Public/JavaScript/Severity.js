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
define(["require","exports","./Enum/Severity"],function(e,r,t){"use strict";class n{static getCssClass(e){let r;switch(e){case t.SeverityEnum.notice:r="notice";break;case t.SeverityEnum.ok:r="success";break;case t.SeverityEnum.warning:r="warning";break;case t.SeverityEnum.error:r="danger";break;case t.SeverityEnum.info:default:r="info"}return r}}let i;n.notice=t.SeverityEnum.notice,n.info=t.SeverityEnum.info,n.ok=t.SeverityEnum.ok,n.warning=t.SeverityEnum.warning,n.error=t.SeverityEnum.error;try{parent&&parent.window.TYPO3&&parent.window.TYPO3.Severity&&(i=parent.window.TYPO3.Severity),top&&top.TYPO3.Severity&&(i=top.TYPO3.Severity)}catch(e){}return i||(i=n,"undefined"!=typeof TYPO3&&(TYPO3.Severity=i)),i});