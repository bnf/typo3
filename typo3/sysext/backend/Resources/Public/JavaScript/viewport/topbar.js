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
import{ScaffoldIdentifierEnum as a}from"@typo3/backend/enum/viewport/scaffold-identifier.js";import n from"@typo3/backend/viewport/toolbar.js";import s from"@typo3/core/ajax/ajax-request.js";class e{static topbarSelector=a.header;Toolbar;constructor(){this.Toolbar=new n}refresh(){new s(TYPO3.settings.ajaxUrls.topbar).get().then(async o=>{const r=await o.resolve(),t=document.querySelector(e.topbarSelector);t!==null&&(t.innerHTML=r.topbar,t.dispatchEvent(new Event("t3-topbar-update")))})}}export{e as default};
