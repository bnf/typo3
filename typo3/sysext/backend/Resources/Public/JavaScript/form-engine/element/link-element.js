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
import{selector as e}from"@typo3/core/literals.js";var t;!function(e){e.toggleSelector=".t3js-form-field-link-explanation-toggle",e.inputFieldSelector=".t3js-form-field-link-input",e.explanationSelector=".t3js-form-field-link-explanation",e.iconSelector=".t3js-form-field-link-icon",e.containerSelector=".t3js-form-field-link"}(t||(t={}));class i extends HTMLElement{constructor(){super(),this.addEventListener("click",(e=>this.handleClick(e))),this.addEventListener("change",(e=>this.handleChange(e)))}get element(){const t=this.getAttribute("recordFieldId");if(null===t)throw new Error("Missing recordFieldId attribute on <typo3-formengine-element-link>");const i=this.querySelector(e`#${t}`);if(null===i)throw new Error(`recordFieldId #${t} not found in <typo3-formengine-element-link>`);return i}get container(){return this.element.closest(t.containerSelector)}get toggleSelector(){return this.container.querySelector(t.toggleSelector)}get explanationField(){return this.container.querySelector(t.explanationSelector)}get icon(){return this.container.querySelector(t.iconSelector)}handleClick(e){if(null!==e.target.closest(t.toggleSelector)){e.preventDefault();this.explanationField.hasAttribute("hidden")?this.showExplanation():this.hideExplanation()}}handleChange(e){if(null!==e.target.closest(t.inputFieldSelector)){!this.explanationField.hasAttribute("hidden")&&this.hideExplanation(),this.disableToggle(),this.clearIcon()}}showExplanation(){this.explanationField.removeAttribute("hidden"),this.element.setAttribute("hidden","")}hideExplanation(){this.explanationField.setAttribute("hidden",""),this.element.removeAttribute("hidden")}disableToggle(){this.toggleSelector.setAttribute("disabled","")}clearIcon(){this.icon.replaceChildren()}}window.customElements.define("typo3-formengine-element-link",i);