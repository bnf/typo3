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
import e from"nprogress";import t from"@typo3/core/event/regular-event.js";var r;!function(e){e.actionsContainerSelector=".t3js-reference-index-actions"}(r||(r={}));var o=new class{constructor(){this.registerActionButtonEvents()}registerActionButtonEvents(){new t("click",((t,r)=>{e.configure({showSpinner:!1}),e.start(),Array.from(r.parentNode.querySelectorAll("button")).forEach((e=>{e.classList.add("disabled")}))})).delegateTo(document.querySelector(r.actionsContainerSelector),"button")}};export{o as default};