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
import"bootstrap";import i from"@typo3/backend/popover.js";import s from"@typo3/core/event/regular-event.js";import c from"@typo3/core/document-service.js";class n{trigger="click";placement="auto";selector=".help-link";constructor(){this.initialize()}async initialize(){await c.ready();const r=document.querySelectorAll(this.selector);r.forEach(t=>{t.dataset.bsHtml="true",t.dataset.bsPlacement=this.placement,t.dataset.bsTrigger=this.trigger,i.popover(t)}),new s("show.bs.popover",t=>{const e=t.target,o=e.dataset.description;if(o){const a={title:e.dataset.title||"",content:o};i.setOptions(e,a)}}).delegateTo(document,this.selector),new s("click",t=>{const e=t.target;r.forEach(o=>{o.isEqualNode(e)||i.hide(o)})}).delegateTo(document,"body")}}var l=new n;export{l as default};
