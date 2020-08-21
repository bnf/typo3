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
define(["../Enum/Viewport/ScaffoldIdentifier","./Toolbar","TYPO3/CMS/Core/Ajax/AjaxRequest"],(function(e,t,r){"use strict";class n{constructor(){this.Toolbar=new t}refresh(){new r(TYPO3.settings.ajaxUrls.topbar).get().then(async e=>{const t=await e.resolve(),r=document.querySelector(n.topbarSelector);null!==r&&(r.innerHTML=t.topbar,r.dispatchEvent(new Event("t3-topbar-update")))})}}return n.topbarSelector=e.ScaffoldIdentifierEnum.header,n}));