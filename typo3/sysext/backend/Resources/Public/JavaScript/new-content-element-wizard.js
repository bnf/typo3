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
import Modal from"@typo3/backend/modal.js";import Notification from"@typo3/backend/notification.js";import RegularEvent from"@typo3/core/event/regular-event.js";import DebounceEvent from"@typo3/core/event/debounce-event.js";import AjaxRequest from"@typo3/core/ajax/ajax-request.js";var ClassNames,Selectors;!function(e){e.wizardWindow="t3-new-content-element-wizard-window"}(ClassNames||(ClassNames={})),function(e){e.modalBodySelector=".t3js-modal-body",e.modalTabsSelector=".t3js-tabs",e.elementsFilterSelector=".t3js-contentWizard-search",e.noResultSelector=".t3js-filter-noresult",e.wizardWindowSelector=".t3-new-content-element-wizard-window",e.wizardElementSelector=".t3js-media-new-content-element-wizard",e.wizardElementWithTargetSelector="button[data-target]",e.wizardElementWithPositionMapArugmentsSelector="button[data-position-map-arguments]"}(Selectors||(Selectors={}));export class NewContentElementWizard{constructor(e){this.modal=e,this.elementsFilter=this.modal.querySelector(Selectors.elementsFilterSelector),this.modal.querySelector(Selectors.modalBodySelector)?.classList.add(ClassNames.wizardWindow),this.registerEvents()}static getTabIdentifier(e){const t=e.querySelector("a"),[,o]=t.href.split("#");return o}static countVisibleContentElements(e){return e.querySelectorAll(Selectors.wizardElementSelector+":not(.hidden)").length}registerEvents(){new RegularEvent("shown.bs.modal",()=>{this.elementsFilter.focus()}).bindTo(this.modal),new RegularEvent("keydown",e=>{const t=e.target;"Escape"===e.code&&(e.stopImmediatePropagation(),t.value="")}).bindTo(this.elementsFilter),new DebounceEvent("keyup",e=>{this.filterElements(e.target)},150).bindTo(this.elementsFilter),new RegularEvent("search",e=>{this.filterElements(e.target)}).bindTo(this.elementsFilter),new RegularEvent("click",e=>{e.preventDefault(),e.stopPropagation()}).delegateTo(this.modal,[Selectors.modalTabsSelector,".disabled"].join(" ")),new RegularEvent("click",(e,t)=>{e.preventDefault();const o=t.dataset.target;o&&(Modal.dismiss(),top.list_frame.location.href=o)}).delegateTo(this.modal,[Selectors.wizardWindowSelector,Selectors.wizardElementWithTargetSelector].join(" ")),new RegularEvent("click",(e,t)=>{if(e.preventDefault(),!t.dataset.positionMapArguments)return;const o=JSON.parse(t.dataset.positionMapArguments);o.url&&new AjaxRequest(o.url).post({defVals:o.defVals,saveAndClose:o.saveAndClose?"1":"0"}).then(async e=>{this.modal.querySelector(Selectors.wizardWindowSelector).innerHTML=await e.raw().text()}).catch(()=>{Notification.error("Could not load module data")})}).delegateTo(this.modal,[Selectors.wizardWindowSelector,Selectors.wizardElementWithPositionMapArugmentsSelector].join(" "))}filterElements(e){const t=this.modal.querySelector(Selectors.modalTabsSelector),o=this.modal.querySelector(Selectors.noResultSelector);this.modal.querySelectorAll(Selectors.wizardElementSelector).forEach(t=>{const o=t.textContent.trim().replace(/\s+/g," ");t.classList.toggle("hidden",""!==e.value&&!RegExp(e.value,"i").test(o))});const a=NewContentElementWizard.countVisibleContentElements(this.modal);t.parentElement.classList.toggle("hidden",0===a),o.classList.toggle("hidden",a>0),this.switchTabIfNecessary(t)}switchTabIfNecessary(e){const t=e.querySelector(".active").parentElement,o=Array.from(t.parentElement.children);for(let e of o){const t=NewContentElementWizard.getTabIdentifier(e),o=e.querySelector("a");o.classList.toggle("disabled",!this.hasTabContent(t)),o.classList.contains("disabled")?o.setAttribute("tabindex","-1"):o.removeAttribute("tabindex")}if(!this.hasTabContent(NewContentElementWizard.getTabIdentifier(t)))for(let a of o){if(a===t)continue;const o=NewContentElementWizard.getTabIdentifier(a);if(this.hasTabContent(o)){this.switchTab(e.parentElement,o);break}}}hasTabContent(e){const t=this.modal.querySelector("#"+e);return NewContentElementWizard.countVisibleContentElements(t)>0}switchTab(e,t){const o=e.querySelector(`a[href="#${t}"]`),a=this.modal.querySelector("#"+t);e.querySelector("a.active").classList.remove("active"),e.querySelector(".tab-pane.active").classList.remove("active"),o.classList.add("active"),a.classList.add("active")}}