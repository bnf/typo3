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
import{property as r,customElement as c}from"lit/decorators.js";import{PseudoButtonLitElement as m}from"@typo3/backend/element/pseudo-button.js";import s from"@typo3/backend/modal.js";import{SeverityEnum as b}from"@typo3/backend/enum/severity.js";import f from"@typo3/backend/action-button/deferred-action.js";import y from"@typo3/backend/ajax-data-handler.js";import v from"@typo3/backend/viewport.js";var n=function(l,t,i,a){var u=arguments.length,o=u<3?t:a===null?a=Object.getOwnPropertyDescriptor(t,i):a,p;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(l,t,i,a);else for(var d=l.length-1;d>=0;d--)(p=l[d])&&(o=(u<3?p(o):u>3?p(t,i,o):p(t,i))||o);return u>3&&o&&Object.defineProperty(t,i,o),o};let e=class extends m{uid;returnUrl;modalTitle;modalContent;okButtonLabel;cancelButtonLabel;buttonActivated(){s.advanced({content:this.modalContent,title:this.modalTitle,severity:b.warning,size:s.sizes.small,buttons:[{text:this.cancelButtonLabel||"Close",btnClass:"btn-default",trigger:function(){s.dismiss()}},{text:this.okButtonLabel||"OK",btnClass:"btn-warning",action:new f(async()=>{await this.deleteRecord()})}]})}async deleteRecord(){const t=y.process(`cmd[sys_note][${this.uid}][delete]=1`);return t.then(()=>{v.ContentContainer.setUrl(this.returnUrl)}),t}};n([r({type:Number})],e.prototype,"uid",void 0),n([r({type:String,attribute:"return-url"})],e.prototype,"returnUrl",void 0),n([r({type:String,attribute:"modal-title"})],e.prototype,"modalTitle",void 0),n([r({type:String,attribute:"modal-content"})],e.prototype,"modalContent",void 0),n([r({type:String,attribute:"modal-button-ok"})],e.prototype,"okButtonLabel",void 0),n([r({type:String,attribute:"modal-button-cancel"})],e.prototype,"cancelButtonLabel",void 0),e=n([c("typo3-sysnote-delete-button")],e);export{e as DeleteButton};
