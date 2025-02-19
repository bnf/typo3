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
import e from"@typo3/core/document-service.js";import t from"@typo3/core/event/regular-event.js";import n from"@typo3/backend/form-engine-validation.js";import{selector as r}from"@typo3/core/literals.js";import"@typo3/backend/color-picker.js";class o extends HTMLElement{constructor(){super(...arguments),this.element=null}async connectedCallback(){const t=this.getAttribute("recordFieldId");null!==t&&(await e.ready(),this.element=this.querySelector(r`#${t}`),this.element&&this.registerEventHandler())}registerEventHandler(){const e=document.querySelector(r`input[name="${this.element.dataset.formengineInputName}"]`);new t("blur",(t=>{e.value=t.target.value,this.handleEvent(t)})).bindTo(this.element),new t("formengine.cp.change",(e=>{this.handleEvent(e)})).bindTo(this.element)}handleEvent(e){n.validateField(e.target),n.markFieldAsChanged(e.target),document.querySelectorAll(".module-docheader-bar .btn").forEach((e=>{e.classList.remove("disabled"),e.disabled=!1}))}}window.customElements.define("typo3-formengine-element-color",o);