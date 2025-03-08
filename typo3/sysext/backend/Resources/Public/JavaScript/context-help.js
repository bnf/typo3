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
import"bootstrap"
import t from"@typo3/backend/popover.js"
import e from"@typo3/core/event/regular-event.js"
import o from"@typo3/core/document-service.js"
export default new class{constructor(){this.trigger="click",this.placement="auto",this.selector=".help-link",this.initialize()}async initialize(){await o.ready()
const s=document.querySelectorAll(this.selector)
s.forEach((e=>{e.dataset.bsHtml="true",e.dataset.bsPlacement=this.placement,e.dataset.bsTrigger=this.trigger,t.popover(e)})),new e("show.bs.popover",(e=>{const o=e.target,s=o.dataset.description
if(s){const e={title:o.dataset.title||"",content:s}
t.setOptions(o,e)}})).delegateTo(document,this.selector),new e("click",(e=>{const o=e.target
s.forEach((e=>{e.isEqualNode(o)||t.hide(e)}))})).delegateTo(document,"body")}}
