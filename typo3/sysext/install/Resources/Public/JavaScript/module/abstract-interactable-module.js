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
import{topLevelModuleImport as t}from"@typo3/backend/utility/top-level-module-import.js"
var e
!function(t){t.modalBody=".t3js-modal-body",t.modalContent=".t3js-module-content",t.modalFooter=".t3js-modal-footer"}(e||(e={}))
export class AbstractInteractableModule{initialize(t){this.currentModal=t}getModalBody(){return this.findInModal(e.modalBody)}getModuleContent(){return this.findInModal(e.modalContent)}getModalFooter(){return this.findInModal(e.modalFooter)}findInModal(t){return this.currentModal.querySelector(t)}setModalButtonsState(t){this.getModalFooter()?.querySelectorAll("button").forEach((e=>{this.setModalButtonState(e,t)}))}setModalButtonState(t,e){t.classList.toggle("disabled",!e),t.disabled=!e}async loadModuleFrameAgnostic(e){window.location!==window.parent.location?await t(e):await import(e)}renderProgressBar(t,e,o){this.loadModuleFrameAgnostic("@typo3/backend/element/progress-bar-element.js")
const a=(t=t||this.currentModal).ownerDocument.createElement("typo3-backend-progress-bar")
return"object"==typeof e&&Object.keys(e).forEach((t=>{a[t]=e[t]})),"append"===o?t.append(a):"prepend"===o?t.prepend(a):t.replaceChildren(a),a}}