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
import{Resizable as e}from"@typo3/backend/form-engine/element/modifier/resizable.js";import{Tabbable as t}from"@typo3/backend/form-engine/element/modifier/tabbable.js";class n extends HTMLElement{constructor(){super(...arguments),this.element=null}connectedCallback(){this.element=document.getElementById(this.getAttribute("recordFieldId")||""),this.element&&(e.enable(this.element),t.enable(this.element))}}window.customElements.define("typo3-formengine-element-json",n);