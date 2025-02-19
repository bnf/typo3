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
import e from"@typo3/core/document-service.js";import{AbstractSortableSelectItems as t}from"@typo3/backend/form-engine/element/abstract-sortable-select-items.js";import{selector as r}from"@typo3/core/literals.js";class s extends t{registerEventHandler(e){this.registerSortableEventHandler(e)}}class n extends HTMLElement{constructor(){super(...arguments),this.recordField=null}async connectedCallback(){const t=this.getAttribute("recordFieldId");null!==t&&(await e.ready(),this.recordField=this.querySelector(r`#${t}`),this.recordField&&this.registerEventHandler())}registerEventHandler(){(new s).registerEventHandler(this.recordField)}}window.customElements.define("typo3-formengine-element-folder",n);