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
import e from"@typo3/core/event/regular-event.js";import t from"@typo3/backend/form-engine-validation.js";import{selector as n}from"@typo3/core/literals.js";import"@typo3/backend/color-picker.js";class r extends HTMLElement{constructor(){super(...arguments),this.element=null}connectedCallback(){const e=this.getAttribute("recordFieldId");null!==e&&(this.element=this.querySelector(n`#${e}`),this.element&&this.registerEventHandler())}registerEventHandler(){const t=document.querySelector(n`input[name="${this.element.dataset.formengineInputName}"]`);new e("blur",(e=>{t.value=e.target.value,this.handleEvent(e)})).bindTo(this.element),new e("formengine.cp.change",(e=>{this.handleEvent(e)})).bindTo(this.element)}handleEvent(e){t.validateField(e.target),t.markFieldAsChanged(e.target),document.querySelectorAll(".module-docheader-bar .btn").forEach((e=>{e.classList.remove("disabled"),e.disabled=!1}))}}window.customElements.define("typo3-formengine-element-color",r);