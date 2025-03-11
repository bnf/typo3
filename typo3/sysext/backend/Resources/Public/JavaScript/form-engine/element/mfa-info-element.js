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
import a from"@typo3/core/event/regular-event.js"
import i from"@typo3/backend/notification.js"
import s from"@typo3/backend/modal.js"
import{SeverityEnum as r}from"@typo3/backend/enum/severity.js"
import{selector as o}from"@typo3/core/literals.js"
var n
!function(t){t.deactivteProviderButton=".t3js-deactivate-provider-button",t.deactivteMfaButton=".t3js-deactivate-mfa-button",t.providerslist=".t3js-mfa-active-providers-list",t.mfaStatusLabel=".t3js-mfa-status-label"}(n||(n={}))
export default class{constructor(t,a){this.options=null,this.fullElement=null,this.deactivteProviderButtons=null,this.deactivteMfaButton=null,this.providersList=null,this.mfaStatusLabel=null,this.request=null,this.options=a,e.ready().then((e=>{this.fullElement=e.querySelector(t),this.deactivteProviderButtons=this.fullElement.querySelectorAll(n.deactivteProviderButton),this.deactivteMfaButton=this.fullElement.querySelector(n.deactivteMfaButton),this.providersList=this.fullElement.querySelector(n.providerslist),this.mfaStatusLabel=this.fullElement.parentElement.querySelector(n.mfaStatusLabel),this.registerEvents()}))}registerEvents(){new a("click",(t=>{t.preventDefault(),this.prepareDeactivateRequest(this.deactivteMfaButton)})).bindTo(this.deactivteMfaButton),this.deactivteProviderButtons.forEach((t=>{new a("click",(e=>{e.preventDefault(),this.prepareDeactivateRequest(t)})).bindTo(t)}))}prepareDeactivateRequest(t){const e=s.show(t.dataset.confirmationTitle||t.getAttribute("title")||"Deactivate provider(s)",t.dataset.confirmationContent||"Are you sure you want to continue? This action cannot be undone and will be applied immediately!",r.warning,[{text:t.dataset.confirmationCancelText||"Cancel",active:!0,btnClass:"btn-default",name:"cancel"},{text:t.dataset.confirmationDeactivateText||"Deactivate",btnClass:"btn-warning",name:"deactivate",trigger:()=>{this.sendDeactivateRequest(t.dataset.provider)}}])
e.addEventListener("button.clicked",(()=>{e.hideModal()}))}sendDeactivateRequest(e){this.request instanceof t&&this.request.abort(),this.request=new t(TYPO3.settings.ajaxUrls.mfa),this.request.post({action:"deactivate",provider:e,userId:this.options.userId,tableName:this.options.tableName}).then((async t=>{const a=await t.resolve()
if(a.status.length>0&&a.status.forEach((t=>{a.success?i.success(t.title,t.message):i.error(t.title,t.message)})),!a.success)return
if(void 0===e||0===a.remaining)return void this.deactivateMfa()
if(null===this.providersList)return
const s=this.providersList.querySelector(o`li#provider-${e}`)
null!==s&&(s.remove(),0===this.providersList.querySelectorAll("li").length&&this.deactivateMfa())})).finally((()=>{this.request=null}))}deactivateMfa(){this.deactivteMfaButton.classList.add("disabled"),this.deactivteMfaButton.setAttribute("disabled","disabled"),null!==this.providersList&&this.providersList.remove(),null!==this.mfaStatusLabel&&(this.mfaStatusLabel.innerText=this.mfaStatusLabel.dataset.alternativeLabel,this.mfaStatusLabel.classList.remove("badge-success"),this.mfaStatusLabel.classList.add("badge-danger"))}}