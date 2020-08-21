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
define(["./Enum/Severity"],(function(e){"use strict";class n{static getCssClass(n){let r;switch(n){case e.SeverityEnum.notice:r="notice";break;case e.SeverityEnum.ok:r="success";break;case e.SeverityEnum.warning:r="warning";break;case e.SeverityEnum.error:r="danger";break;case e.SeverityEnum.info:default:r="info"}return r}}let r;n.notice=e.SeverityEnum.notice,n.info=e.SeverityEnum.info,n.ok=e.SeverityEnum.ok,n.warning=e.SeverityEnum.warning,n.error=e.SeverityEnum.error;try{window.opener&&window.opener.TYPO3&&window.opener.TYPO3.Severity&&(r=window.opener.TYPO3.Severity),parent&&parent.window.TYPO3&&parent.window.TYPO3.Severity&&(r=parent.window.TYPO3.Severity),top&&top.TYPO3&&top.TYPO3.Severity&&(r=top.TYPO3.Severity)}catch(e){}return r||(r=n,"undefined"!=typeof TYPO3&&(TYPO3.Severity=r)),r}));