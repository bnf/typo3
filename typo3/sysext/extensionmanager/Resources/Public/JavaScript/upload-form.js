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
import e from"@typo3/core/ajax/ajax-request.js";import s from"@typo3/core/event/regular-event.js";export default class{constructor(){this.expandedUploadFormClass="transformed"}initializeEvents(){new s("click",((s,t)=>{const a=document.querySelector(".extension-upload-form");s.preventDefault(),a.classList.contains(this.expandedUploadFormClass)?(a.style.display="none",a.classList.remove(this.expandedUploadFormClass)):(a.style.display="",a.classList.add(this.expandedUploadFormClass),new e(t.href).get().then((async e=>{a.querySelector(".t3js-upload-form-target").innerHTML=await e.resolve()})))})).delegateTo(document,".t3js-upload")}}