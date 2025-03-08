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
var t=function(t,e,o,n){var r,i=arguments.length,a=i<3?e:null===n?n=Object.getOwnPropertyDescriptor(e,o):n
if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,o,n)
else for(var s=t.length-1;s>=0;s--)(r=t[s])&&(a=(i<3?r(a):i>3?r(e,o,a):r(e,o))||a)
return i>3&&a&&Object.defineProperty(e,o,a),a}
import{customElement as e,property as o}from"lit/decorators.js"
import{css as n,html as r,LitElement as i}from"lit"
import a from"@typo3/backend/modal.js"
import{SeverityEnum as s}from"@typo3/backend/enum/severity.js"
import l from"@typo3/backend/action-button/deferred-action.js"
import c from"@typo3/backend/ajax-data-handler.js"
import d from"@typo3/backend/viewport.js"
let p=class extends i{static{this.styles=[n`:host{cursor:pointer;appearance:button}`]}connectedCallback(){super.connectedCallback(),this.hasAttribute("role")||this.setAttribute("role","button"),this.hasAttribute("tabindex")||this.setAttribute("tabindex","0"),this.addEventListener("click",this.showConfirmationModal)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("click",this.showConfirmationModal)}render(){return r`<slot></slot>`}showConfirmationModal(){a.advanced({content:this.modalContent,title:this.modalTitle,severity:s.warning,size:a.sizes.small,buttons:[{text:this.cancelButtonLabel||"Close",btnClass:"btn-default",trigger:function(){a.dismiss()}},{text:this.okButtonLabel||"OK",btnClass:"btn-warning",action:new l((async()=>{await this.deleteRecord()}))}]})}async deleteRecord(){const t=c.process(`cmd[sys_note][${this.uid}][delete]=1`)
return t.then((()=>{d.ContentContainer.setUrl(this.returnUrl)})),t}}
t([o({type:Number})],p.prototype,"uid",void 0),t([o({type:String,attribute:"return-url"})],p.prototype,"returnUrl",void 0),t([o({type:String,attribute:"modal-title"})],p.prototype,"modalTitle",void 0),t([o({type:String,attribute:"modal-content"})],p.prototype,"modalContent",void 0),t([o({type:String,attribute:"modal-button-ok"})],p.prototype,"okButtonLabel",void 0),t([o({type:String,attribute:"modal-button-cancel"})],p.prototype,"cancelButtonLabel",void 0),p=t([e("typo3-sysnote-delete-button")],p)
export{p as DeleteButton}
