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
import t from"@typo3/core/ajax/ajax-request.js"
import e from"@typo3/core/document-service.js"
import i from"@typo3/core/event/regular-event.js"
import a from"@typo3/backend/notification.js"
import s from"@typo3/backend/modal.js"
import{SeverityEnum as r}from"@typo3/backend/enum/severity.js"
import{selector as n}from"@typo3/core/literals.js"
var o
!function(t){t.deactivteProviderButton=".t3js-deactivate-provider-button",t.deactivteMfaButton=".t3js-deactivate-mfa-button",t.providerslist=".t3js-mfa-active-providers-list",t.mfaStatusLabel=".t3js-mfa-status-label"}(o||(o={}))
export default class{constructor(t,i){this.options=null,this.fullElement=null,this.deactivteProviderButtons=null,this.deactivteMfaButton=null,this.providersList=null,this.mfaStatusLabel=null,this.request=null,this.options=i,e.ready().then((e=>{this.fullElement=e.querySelector(t),this.deactivteProviderButtons=this.fullElement.querySelectorAll(o.deactivteProviderButton),this.deactivteMfaButton=this.fullElement.querySelector(o.deactivteMfaButton),this.providersList=this.fullElement.querySelector(o.providerslist),this.mfaStatusLabel=this.fullElement.parentElement.querySelector(o.mfaStatusLabel),this.registerEvents()}))}registerEvents(){new i("click",(t=>{t.preventDefault(),this.prepareDeactivateRequest(this.deactivteMfaButton)})).bindTo(this.deactivteMfaButton),this.deactivteProviderButtons.forEach((t=>{new i("click",(e=>{e.preventDefault(),this.prepareDeactivateRequest(t)})).bindTo(t)}))}prepareDeactivateRequest(t){const e=s.show(t.dataset.confirmationTitle||t.getAttribute("title")||"Deactivate provider(s)",t.dataset.confirmationContent||"Are you sure you want to continue? This action cannot be undone and will be applied immediately!",r.warning,[{text:t.dataset.confirmationCancelText||"Cancel",active:!0,btnClass:"btn-default",name:"cancel"},{text:t.dataset.confirmationDeactivateText||"Deactivate",btnClass:"btn-warning",name:"deactivate",trigger:()=>{this.sendDeactivateRequest(t.dataset.provider)}}])
e.addEventListener("button.clicked",(()=>{e.hideModal()}))}sendDeactivateRequest(e){this.request instanceof t&&this.request.abort(),this.request=new t(TYPO3.settings.ajaxUrls.mfa),this.request.post({action:"deactivate",provider:e,userId:this.options.userId,tableName:this.options.tableName}).then((async t=>{const i=await t.resolve()
if(i.status.length>0&&i.status.forEach((t=>{i.success?a.success(t.title,t.message):a.error(t.title,t.message)})),!i.success)return
if(void 0===e||0===i.remaining)return void this.deactivateMfa()
if(null===this.providersList)return
const s=this.providersList.querySelector(n`li#provider-${e}`)
if(null===s)return
s.remove()
0===this.providersList.querySelectorAll("li").length&&this.deactivateMfa()})).finally((()=>{this.request=null}))}deactivateMfa(){this.deactivteMfaButton.classList.add("disabled"),this.deactivteMfaButton.setAttribute("disabled","disabled"),null!==this.providersList&&this.providersList.remove(),null!==this.mfaStatusLabel&&(this.mfaStatusLabel.innerText=this.mfaStatusLabel.dataset.alternativeLabel,this.mfaStatusLabel.classList.remove("badge-success"),this.mfaStatusLabel.classList.add("badge-danger"))}}