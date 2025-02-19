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
import{default as e}from"@typo3/backend/modal.js";import{SeverityEnum as t}from"@typo3/backend/enum/severity.js";import o from"@typo3/core/event/regular-event.js";export default new class{constructor(){this.selector=".t3js-linkvalidator-modal",this.initialize()}initialize(){new o("click",(function(o){o.preventDefault();const n=new DocumentFragment;n.append(document.getElementById(`linkvalidatorModal-${this.dataset.modalIdentifier}`).content.cloneNode(!0));const i={type:e.types.default,title:this.dataset.modalTitle,size:e.sizes.large,severity:t.notice,content:n};e.advanced(i)})).delegateTo(document,this.selector)}};