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
import{Collapse}from"bootstrap";import SecurityUtility from"TYPO3/CMS/Core/SecurityUtility";import Modal from"TYPO3/CMS/Backend/Modal";import RegularEvent from"TYPO3/CMS/Core/Event/RegularEvent";import Severity from"TYPO3/CMS/Backend/Severity";var Selectors;!function(e){e.toggleSelector='[data-bs-toggle="flexform-inline"]',e.actionFieldSelector=".t3js-flex-control-action",e.toggleFieldSelector=".t3js-flex-control-toggle",e.controlSectionSelector=".t3js-formengine-irre-control",e.sectionContentContainerSelector=".t3js-flex-section-content",e.deleteContainerButtonSelector=".t3js-delete",e.contentPreviewSelector=".content-preview"}(Selectors||(Selectors={}));class FlexFormContainerContainer{constructor(e,t){this.securityUtility=new SecurityUtility,this.parentContainer=e,this.container=t,this.containerContent=t.querySelector(Selectors.sectionContentContainerSelector),this.containerId=t.dataset.flexformContainerId,this.panelHeading=t.querySelector('[data-bs-target="#flexform-container-'+this.containerId+'"]'),this.panelButton=this.panelHeading.querySelector('[aria-controls="flexform-container-'+this.containerId+'"]'),this.toggleField=t.querySelector(Selectors.toggleFieldSelector),this.registerEvents(),this.generatePreview()}static getCollapseInstance(e){var t;return null!==(t=Collapse.getInstance(e))&&void 0!==t?t:new Collapse(e,{toggle:!1})}getStatus(){return{id:this.containerId,collapsed:"false"===this.panelButton.getAttribute("aria-expanded")}}registerEvents(){this.parentContainer.isRestructuringAllowed()&&this.registerDelete(),this.registerToggle(),this.registerPanelToggle()}registerDelete(){new RegularEvent("click",()=>{const e=TYPO3.lang["flexform.section.delete.title"]||"Delete this container?",t=TYPO3.lang["flexform.section.delete.message"]||"Are you sure you want to delete this container?";Modal.confirm(e,t,Severity.warning,[{text:TYPO3.lang["buttons.confirm.delete_record.no"]||"Cancel",active:!0,btnClass:"btn-default",name:"no"},{text:TYPO3.lang["buttons.confirm.delete_record.yes"]||"Yes, delete this container",btnClass:"btn-warning",name:"yes"}]).on("button.clicked",e=>{if("yes"===e.target.name){const e=this.container.querySelector(Selectors.actionFieldSelector);e.value="DELETE",this.container.appendChild(e),this.container.classList.add("t3-flex-section--deleted"),new RegularEvent("transitionend",()=>{this.container.classList.add("hidden");const e=new CustomEvent("formengine:flexform:container-deleted",{detail:{containerId:this.containerId}});this.parentContainer.getContainer().dispatchEvent(e)}).bindTo(this.container)}Modal.dismiss()})}).bindTo(this.container.querySelector(Selectors.deleteContainerButtonSelector))}registerToggle(){new RegularEvent("click",()=>{FlexFormContainerContainer.getCollapseInstance(this.containerContent).toggle(),this.generatePreview()}).delegateTo(this.container,`${Selectors.toggleSelector} .form-irre-header-cell:not(${Selectors.controlSectionSelector}`)}registerPanelToggle(){["hide.bs.collapse","show.bs.collapse"].forEach(e=>{new RegularEvent(e,e=>{const t="hide.bs.collapse"===e.type;this.toggleField.value=t?"1":"0",this.panelButton.setAttribute("aria-expanded",t?"false":"true"),this.panelButton.parentElement.classList.toggle("collapsed",t)}).bindTo(this.containerContent)})}generatePreview(){let e="";if(this.getStatus().collapsed){const t=this.containerContent.querySelectorAll('input[type="text"], textarea');for(let n of t){let t=this.securityUtility.stripHtml(n.value);t.length>50&&(t=t.substring(0,50)+"..."),e+=(e?" / ":"")+t}}this.panelHeading.querySelector(Selectors.contentPreviewSelector).textContent=e}}export default FlexFormContainerContainer;