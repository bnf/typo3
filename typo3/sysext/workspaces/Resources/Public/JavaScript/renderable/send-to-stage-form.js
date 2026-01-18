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
import{property as m,customElement as h}from"lit/decorators.js";import{LitElement as p,html as s,nothing as f}from"lit";var c=function(l,t,e,n){var d=arguments.length,a=d<3?t:n===null?n=Object.getOwnPropertyDescriptor(t,e):n,i;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")a=Reflect.decorate(l,t,e,n);else for(var r=l.length-1;r>=0;r--)(i=l[r])&&(a=(d<3?i(a):d>3?i(t,e,a):i(t,e))||a);return d>3&&a&&Object.defineProperty(t,e,a),a};let o=class extends p{data=null;TYPO3lang=null;createRenderRoot(){return this}render(){return s`<form>${this.data.sendMailTo!==void 0&&this.data.sendMailTo.length>0?s`<label class=form-label>${this.TYPO3lang["window.sendToNextStageWindow.itemsWillBeSentTo"]}</label> ${this.renderRecipientCheckboxes()}`:f} ${this.data.additional!==void 0?s`<div class=form-group><label for=additional class=form-label>${this.TYPO3lang["window.sendToNextStageWindow.additionalRecipients"]}</label> <textarea class=form-control name=additional id=additional>${this.data.additional.value}</textarea><div class=form-text>${this.TYPO3lang["window.sendToNextStageWindow.additionalRecipients.hint"]}</div></div>`:f}<div class=form-group><label for=comments class=form-label>${this.TYPO3lang["window.sendToNextStageWindow.comments"]}</label> <textarea class=form-control name=comments id=comments>${this.data.comments.value}</textarea></div></form>`}renderRecipientCheckboxes(){const t=[];return this.data.sendMailTo?.forEach(e=>{t.push(s`<div class=form-check><input type=checkbox name=recipients class="form-check-input t3js-workspace-recipient" id=${e.name} value=${e.value} ?checked=${e.checked} ?disabled=${e.disabled}> <label class=form-check-label for=${e.name}>${e.label}</label></div>`)}),t}};c([m({type:Object})],o.prototype,"data",void 0),c([m({type:Object})],o.prototype,"TYPO3lang",void 0),o=c([h("typo3-workspaces-send-to-stage-form")],o);export{o as SendToStageFormElement};
