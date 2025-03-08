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
var s=function(s,e,o,r){var t,a=arguments.length,l=a<3?e:null===r?r=Object.getOwnPropertyDescriptor(e,o):r
if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)l=Reflect.decorate(s,e,o,r)
else for(var i=s.length-1;i>=0;i--)(t=s[i])&&(l=(a<3?t(l):a>3?t(e,o,l):t(e,o))||l)
return a>3&&l&&Object.defineProperty(e,o,l),l}
import{customElement as e,property as o,query as r,state as t}from"lit/decorators.js"
import{html as a,LitElement as l,nothing as i}from"lit"
import d from"@typo3/core/ajax/ajax-request.js"
import{lll as n}from"@typo3/core/lit-helper.js"
import c from"@typo3/backend/viewport.js"
let p=class extends l{constructor(){super(...arguments),this.useInstallToolPassword=!1,this.errorMessage=null}createRenderRoot(){return this}render(){return a`<div id="sudo-mode-verification" class="modal modal-severity-notice modal-size-small" tabindex="-1" role="dialog"><div class="modal-dialog" role="document"><div class="modal-content"><div class="modal-header"><h4 class="modal-title">${n(this.useInstallToolPassword?"verifyWithInstallToolPassword":"verifyWithUserPassword")}</h4></div><div class="modal-body"><div>${this.errorMessage?a`<div class="alert alert-danger" id="invalid-password">${n(this.errorMessage)||this.errorMessage}</div>`:i}<form method="post" class="form" id="verify-sudo-mode" spellcheck="false" @submit="${s=>this.verifyPassword(s)}"><div class="form-group"><label class="form-label" for="password">${n("password")}</label> <input required="required" class="form-control" id="password" type="password" name="password" autocomplete="${this.useInstallToolPassword?"section-install current-password":"current-password"}"></div></form><div class="text-end"><a href="#" @click="${s=>this.toggleUseInstallToolPassword(s)}">${n(this.useInstallToolPassword?"userPasswordMode":"installToolPasswordMode")}</a></div></div></div><div class="modal-footer"><button type="submit" form="verify-sudo-mode" class="btn btn-primary" role="button">${n("verify")}</button></div></div></div></div>`}firstUpdated(s){super.firstUpdated(s),this.passwordElement.focus()}verifyPassword(s){s.preventDefault(),this.errorMessage=null,new d(this.verifyActionUri).post({password:this.passwordElement.value,useInstallToolPassword:this.useInstallToolPassword?1:0}).then((async s=>{const e=await s.resolve("application/json")
e.redirect&&c.ContentContainer.setUrl(e.redirect.uri)})).catch((async s=>{const e=await s.resolve("application/json")
this.errorMessage=e.message}))}toggleUseInstallToolPassword(s){s.preventDefault(),this.useInstallToolPassword=!this.useInstallToolPassword}}
s([o({type:String})],p.prototype,"verifyActionUri",void 0),s([t()],p.prototype,"useInstallToolPassword",void 0),s([t()],p.prototype,"errorMessage",void 0),s([r("#password")],p.prototype,"passwordElement",void 0),p=s([e("typo3-backend-security-sudo-mode")],p)
export{p as SudoMode}
