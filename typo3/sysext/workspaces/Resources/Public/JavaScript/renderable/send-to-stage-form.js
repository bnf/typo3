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
import{property as e,customElement as t}from"lit/decorators.js";import{LitElement as a,html as o,nothing as i}from"lit";var l=function(e,t,a,o){var i,l=arguments.length,n=l<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,a):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,a,o);else for(var s=e.length-1;s>=0;s--)(i=e[s])&&(n=(l<3?i(n):l>3?i(t,a,n):i(t,a))||n);return l>3&&n&&Object.defineProperty(t,a,n),n};let n=class extends a{constructor(){super(...arguments),this.data=null,this.TYPO3lang=null}createRenderRoot(){return this}render(){return o`<form>${void 0!==this.data.sendMailTo&&this.data.sendMailTo.length>0?o`<label class=form-label>${this.TYPO3lang["window.sendToNextStageWindow.itemsWillBeSentTo"]}</label> ${this.renderRecipientCheckboxes()}`:i} ${void 0!==this.data.additional?o`<div class=form-group><label for=additional class=form-label>${this.TYPO3lang["window.sendToNextStageWindow.additionalRecipients"]}</label> <textarea class=form-control name=additional id=additional>${this.data.additional.value}</textarea><div class=form-text>${this.TYPO3lang["window.sendToNextStageWindow.additionalRecipients.hint"]}</div></div>`:i}<div class=form-group><label for=comments class=form-label>${this.TYPO3lang["window.sendToNextStageWindow.comments"]}</label> <textarea class=form-control name=comments id=comments>${this.data.comments.value}</textarea></div></form>`}renderRecipientCheckboxes(){const e=[];return this.data.sendMailTo?.forEach((t=>{e.push(o`<div class=form-check><input type=checkbox name=recipients class="form-check-input t3js-workspace-recipient" id=${t.name} value=${t.value} ?checked=${t.checked} ?disabled=${t.disabled}> <label class=form-check-label for=${t.name}>${t.label}</label></div>`)})),e}};l([e({type:Object})],n.prototype,"data",void 0),l([e({type:Object})],n.prototype,"TYPO3lang",void 0),n=l([t("typo3-workspaces-send-to-stage-form")],n);export{n as SendToStageFormElement};