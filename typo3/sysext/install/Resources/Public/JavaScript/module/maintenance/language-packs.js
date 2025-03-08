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
import"bootstrap"
import{AbstractInteractableModule as t}from"@typo3/install/module/abstract-interactable-module.js"
import a from"@typo3/core/ajax/ajax-request.js"
import{FlashMessage as e}from"@typo3/install/renderable/flash-message.js"
import{InfoBox as i}from"@typo3/install/renderable/info-box.js"
import"@typo3/install/renderable/language-packs.js"
import s from"@typo3/install/renderable/severity.js"
import n from"@typo3/install/router.js"
var o
!function(t){t.outputContainer=".t3js-languagePacks-output",t.contentContainer=".t3js-languagePacks-mainContent",t.notifications=".t3js-languagePacks-notifications"}(o||(o={}))
class d extends t{constructor(){super(...arguments),this.activeLanguages=[],this.activeExtensions=[],this.packsUpdateDetails={toHandle:0,handled:0,updated:0,new:0,failed:0,skipped:0},this.notifications=[]}static pluralize(t,a="pack",e="s",i=0){return 1!==t&&1!==i?a+e:a}initialize(t){super.initialize(t),Promise.all([this.loadModuleFrameAgnostic("@typo3/install/renderable/info-box.js"),this.loadModuleFrameAgnostic("@typo3/install/renderable/flash-message.js"),this.loadModuleFrameAgnostic("@typo3/install/renderable/language-packs.js")]).then((()=>{this.getData()}))}getData(){const t=this.getModalBody()
new a(n.getUrl("languagePacksGetData")).get({cache:"no-cache"}).then((async a=>{const e=await a.resolve(),{success:n,html:d,...l}=e
if(!0===n){this.activeLanguages=e.activeLanguages,this.activeExtensions=e.activeExtensions,t.innerHTML=d
const a=t.parentElement.querySelector(o.contentContainer)
a.innerHTML=""
const i=window.location!==window.parent.location?parent.document:document,s=i.createElement("typo3-install-language-matrix")
s.data=l,"true"===this.getModuleContent().dataset.configurationIsWritable&&s.setAttribute("configurationIsWritable",""),s.addEventListener("activate-language",(t=>{this.activateLanguage(t.detail.iso)})),s.addEventListener("deactivate-language",(t=>{this.deactivateLanguage(t.detail.iso)})),s.addEventListener("download-packs",(t=>{this.updatePacks(t.detail?.iso||void 0,void 0)}))
const n=i.createElement("typo3-install-extension-matrix")
n.data=l,n.addEventListener("download-packs",(t=>{this.updatePacks(t.detail?.iso||void 0,t.detail?.extension||void 0)})),a.append(s,n)}else this.addNotification(i.create(s.error,"Something went wrong"))
this.renderNotifications()}),(a=>{n.handleAjaxError(a,t)}))}activateLanguage(t){const e=this.getModalBody(),d=this.findInModal(o.outputContainer)
this.renderProgressBar(d),this.getNotificationBox().innerHTML="",new a(n.getUrl()).post({install:{action:"languagePacksActivateLanguage",token:this.getModuleContent().dataset.languagePacksActivateLanguageToken,iso:t}}).then((async t=>{const a=await t.resolve()
d.innerHTML="",!0===a.success&&Array.isArray(a.status)?a.status.forEach((t=>{this.addNotification(i.create(t.severity,t.title,t.message))})):this.addNotification(i.create(s.error,"Something went wrong")),this.getData()}),(t=>{n.handleAjaxError(t,e)}))}deactivateLanguage(t){const e=this.getModalBody(),d=this.findInModal(o.outputContainer)
this.renderProgressBar(d),this.getNotificationBox().innerHTML="",new a(n.getUrl()).post({install:{action:"languagePacksDeactivateLanguage",token:this.getModuleContent().dataset.languagePacksDeactivateLanguageToken,iso:t}}).then((async t=>{const a=await t.resolve()
d.innerHTML="",!0===a.success&&Array.isArray(a.status)?a.status.forEach((t=>{this.addNotification(i.create(t.severity,t.title,t.message))})):this.addNotification(i.create(s.error,"Something went wrong")),this.getData()}),(t=>{n.handleAjaxError(t,e)}))}updatePacks(t,e){const i=this.findInModal(o.outputContainer),s=this.findInModal(o.contentContainer),l=void 0===t?this.activeLanguages:[t]
let c=!0,r=this.activeExtensions
void 0!==e&&(r=[e],c=!1),this.packsUpdateDetails={toHandle:l.length*r.length,handled:0,updated:0,new:0,failed:0,skipped:0}
const p=this.renderProgressBar(i,1===this.packsUpdateDetails.toHandle?void 0:{value:0,max:this.packsUpdateDetails.toHandle,label:"0 of "+this.packsUpdateDetails.toHandle+" language "+d.pluralize(this.packsUpdateDetails.toHandle)+" updated"})
s.innerHTML="",l.forEach((t=>{r.forEach((e=>{this.getNotificationBox().innerHTML="",new a(n.getUrl()).post({install:{action:"languagePacksUpdatePack",token:this.getModuleContent().dataset.languagePacksUpdatePackToken,iso:t,extension:e}}).then((async t=>{const a=await t.resolve()
!0===a.success?(this.packsUpdateDetails.handled++,"new"===a.packResult?this.packsUpdateDetails.new++:"update"===a.packResult?this.packsUpdateDetails.updated++:"skipped"===a.packResult?this.packsUpdateDetails.skipped++:this.packsUpdateDetails.failed++,this.packUpdateDone(c,l,p)):(this.packsUpdateDetails.handled++,this.packsUpdateDetails.failed++,this.packUpdateDone(c,l,p))}),(()=>{this.packsUpdateDetails.handled++,this.packsUpdateDetails.failed++,this.packUpdateDone(c,l,p)}))}))}))}packUpdateDone(t,o,l){const c=this.getModalBody()
this.packsUpdateDetails.handled===this.packsUpdateDetails.toHandle?(this.addNotification(i.create(s.ok,"Language packs updated",this.packsUpdateDetails.new+" new language "+d.pluralize(this.packsUpdateDetails.new)+" downloaded, "+this.packsUpdateDetails.updated+" language "+d.pluralize(this.packsUpdateDetails.updated)+" updated, "+this.packsUpdateDetails.skipped+" language "+d.pluralize(this.packsUpdateDetails.skipped)+" skipped, "+this.packsUpdateDetails.failed+" language "+d.pluralize(this.packsUpdateDetails.failed)+" not available")),!0===t?new a(n.getUrl()).post({install:{action:"languagePacksUpdateIsoTimes",token:this.getModuleContent().dataset.languagePacksUpdateIsoTimesToken,isos:o}}).then((async t=>{!0===(await t.resolve()).success?this.getData():this.addNotification(e.create(s.error,"Something went wrong"))}),(t=>{n.handleAjaxError(t,c)})):this.getData()):(l.value=this.packsUpdateDetails.handled,l.label=this.packsUpdateDetails.handled+" of "+this.packsUpdateDetails.toHandle+" language "+d.pluralize(this.packsUpdateDetails.handled,"pack","s",this.packsUpdateDetails.toHandle)+" updated")}getNotificationBox(){return this.findInModal(o.notifications)}addNotification(t){this.notifications.push(t)}renderNotifications(){const t=this.getNotificationBox()
for(const a of this.notifications)t.appendChild(a)
this.notifications=[]}}export default new d
