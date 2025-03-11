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
class t{constructor(){"function"!=typeof HTMLInputElement.prototype.clearable&&this.registerClearable()}static createCloseButton(t){const e=document.createElement("button")
return e.type="button",e.tabIndex=-1,e.title=t,e.ariaLabel=t,e.innerHTML='\n      <span class="t3js-icon icon icon-size-small icon-state-default icon-actions-close" data-identifier="actions-close">\n        <span class="icon-markup">\n          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">\n            <g fill="currentColor">\n              <path d="M11.9 5.5 9.4 8l2.5 2.5c.2.2.2.5 0 .7l-.7.7c-.2.2-.5.2-.7 0L8 9.4l-2.5 2.5c-.2.2-.5.2-.7 0l-.7-.7c-.2-.2-.2-.5 0-.7L6.6 8 4.1 5.5c-.2-.2-.2-.5 0-.7l.7-.7c.2-.2.5-.2.7 0L8 6.6l2.5-2.5c.2-.2.5-.2.7 0l.7.7c.2.2.2.5 0 .7z"/>\n            </g>\n          </svg>\n        </span>\n      </span>\n    ',e.style.visibility="hidden",e.classList.add("close"),e}registerClearable(){HTMLInputElement.prototype.clearable=function(options={}){if(this.dataset.clearable)return
if("object"!=typeof options)throw new Error("Passed options must be an object, "+typeof options+" given")
this.classList.add("form-control-clearable")
const e=document.createElement("div")
e.classList.add("form-control-clearable-wrapper"),this.parentNode.insertBefore(e,this),e.appendChild(this)
let n="Clear input"
this.dataset.clearableLabel?n=this.dataset.clearableLabel:"lang"in top.TYPO3&&top.TYPO3.lang["labels.inputfield.clearButton.title"]&&(n=top.TYPO3.lang["labels.inputfield.clearButton.title"])
const a=t.createCloseButton(n),l=()=>{a.style.visibility=0===this.value.length?"hidden":"visible"}
a.addEventListener("click",(t=>{t.preventDefault(),this.value="","function"==typeof options.onClear&&options.onClear(this),this.dispatchEvent(new Event("change",{bubbles:!0,cancelable:!0})),l()})),e.appendChild(a),this.addEventListener("focus",l),this.addEventListener("keyup",l),l(),this.dataset.clearable="true"}}}export default new t
