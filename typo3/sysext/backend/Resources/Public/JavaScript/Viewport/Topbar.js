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
import{ScaffoldIdentifierEnum}from"@typo3/Backend/Enum/Viewport/ScaffoldIdentifier.js";import Toolbar from"@typo3/Backend/Viewport/Toolbar.js";import AjaxRequest from"@typo3/core/Ajax/AjaxRequest.js";class Topbar{constructor(){this.Toolbar=new Toolbar}refresh(){new AjaxRequest(TYPO3.settings.ajaxUrls.topbar).get().then(async e=>{const o=await e.resolve(),r=document.querySelector(Topbar.topbarSelector);null!==r&&(r.innerHTML=o.topbar,r.dispatchEvent(new Event("t3-topbar-update")))})}}Topbar.topbarSelector=ScaffoldIdentifierEnum.header;export default Topbar;