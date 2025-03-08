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
import{ScaffoldIdentifierEnum as t}from"@typo3/backend/enum/viewport/scaffold-identifier.js"
import e from"@typo3/backend/viewport/toolbar.js"
import o from"@typo3/core/ajax/ajax-request.js"
class r{static{this.topbarSelector=t.header}constructor(){this.Toolbar=new e}refresh(){new o(TYPO3.settings.ajaxUrls.topbar).get().then((async t=>{const e=await t.resolve(),o=document.querySelector(r.topbarSelector)
null!==o&&(o.innerHTML=e.topbar,o.dispatchEvent(new Event("t3-topbar-update")))}))}}export default r
