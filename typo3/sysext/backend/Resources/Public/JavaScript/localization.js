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
import e from"@typo3/core/document-service.js"
import t from"jquery"
import{SeverityEnum as a}from"@typo3/backend/enum/severity.js"
import o from"@typo3/core/ajax/ajax-request.js"
import n from"@typo3/backend/icons.js"
import l from"@typo3/backend/modal.js"
import c from"@typo3/backend/multi-step-wizard.js"
import"@typo3/backend/element/icon-element.js"
export default new class{constructor(){this.triggerButton=".t3js-localize",e.ready().then((()=>{this.initialize()}))}async initialize(){const e=await n.getIcon("actions-localize",n.sizes.large),o=await n.getIcon("actions-edit-copy",n.sizes.large)
t(this.triggerButton).removeClass("disabled"),t(document).on("click",this.triggerButton,(async s=>{s.preventDefault()
const i=t(s.currentTarget),d=[],r=[]
if(0===i.data("allowTranslate")&&0===i.data("allowCopy"))return void l.confirm(TYPO3.lang["window.localization.mixed_mode.title"],TYPO3.lang["window.localization.mixed_mode.message"],a.warning,[{text:TYPO3?.lang?.["button.ok"]||"OK",btnClass:"btn-warning",name:"ok",trigger:(e,t)=>t.hideModal()}])
const g=await(await this.loadAvailableLanguages(parseInt(i.data("pageId"),10),parseInt(i.data("languageId"),10))).resolve()
if(i.data("allowTranslate")&&(d.push('<div class="row"><div class="col-sm-3"><input class="btn-check t3js-localization-option" type="radio" name="mode" id="mode_translate" value="localize"><label class="btn btn-default btn-block-vertical" for="mode_translate" data-action="localize">'+e+TYPO3.lang["localize.wizard.button.translate"]+'</label></div><div class="col-sm-9"><p class="text-body-secondary">'+TYPO3.lang["localize.educate.translate"]+"</p></div></div>"),r.push("localize")),i.data("allowCopy")&&(d.push('<div class="row"><div class="col-sm-3"><input class="btn-check t3js-localization-option" type="radio" name="mode" id="mode_copy" value="copyFromLanguage"><label class="btn btn-default btn-block-vertical" for="mode_copy" data-action="copy">'+o+TYPO3.lang["localize.wizard.button.copy"]+'</label></div><div class="col-sm-9"><p class="t3js-helptext t3js-helptext-copy text-body-secondary">'+TYPO3.lang["localize.educate.copy"]+"</p></div></div>"),r.push("copyFromLanguage")),1===r.length)c.set("localizationMode",r[0])
else{const e=document.createElement("div")
e.dataset.bsToggle="buttons",e.append(...d.map((e=>document.createRange().createContextualFragment(e)))),c.addSlide("localize-choose-action",TYPO3.lang["localize.wizard.header_page"].replace("{0}",i.data("page")).replace("{1}",i.data("languageName")),e,a.notice,TYPO3.lang["localize.wizard.step.selectMode"],((e,t)=>{void 0!==t.localizationMode&&c.unlockNextStep()}))}1===g.length?c.set("sourceLanguage",g[0].uid):c.addSlide("localize-choose-language",TYPO3.lang["localize.view.chooseLanguage"],"",a.notice,TYPO3.lang["localize.wizard.step.chooseLanguage"],(async(e,a)=>{void 0!==a.sourceLanguage&&c.unlockNextStep(),e.html('<div class="text-center">'+await n.getIcon("spinner-circle",n.sizes.large)+"</div>"),c.getComponent().on("change",".t3js-language-option",(e=>{c.set("sourceLanguage",t(e.currentTarget).val()),c.unlockNextStep()}))
const o=t("<div />",{class:"row"})
for(const e of g){const a="language"+e.uid,n=t("<input />",{type:"radio",name:"language",id:a,value:e.uid,class:"btn-check t3js-language-option"}),l=t("<label />",{class:"btn btn-default btn-block",for:a}).text(" "+e.title).prepend(e.flagIcon)
o.append(t("<div />",{class:"col-sm-4"}).append(n).append(l))}e.empty().append(o)})),c.addSlide("localize-summary",TYPO3.lang["localize.view.summary"],"",a.notice,TYPO3.lang["localize.wizard.step.selectRecords"],(async(e,a)=>{e.empty().html('<div class="text-center">'+await n.getIcon("spinner-circle",n.sizes.large)+"</div>")
const o=await(await this.getSummary(parseInt(i.data("pageId"),10),parseInt(i.data("languageId"),10),a.sourceLanguage)).resolve()
e.empty(),c.set("records",[])
const l=o.columns.columns
o.columns.columnList.forEach((t=>{if(void 0===o.records[t])return
const n=l[t],c=document.createElement("div")
c.classList.add("row","gy-2"),o.records[t].forEach((e=>{const t=" ("+e.uid+") "+e.title
a.records.push(e.uid)
const o=document.createElement("div")
o.classList.add("col-sm-6")
const n=document.createElement("div")
n.classList.add("input-group")
const l=document.createElement("span")
l.classList.add("input-group-text")
const s=document.createElement("span")
s.classList.add("form-check","form-check-type-toggle")
const i=document.createElement("input")
i.type="checkbox",i.id="record-uid-"+e.uid,i.classList.add("form-check-input","t3js-localization-toggle-record"),i.checked=!0,i.dataset.uid=e.uid.toString(),i.ariaLabel=t
const d=document.createElement("label")
d.classList.add("form-control"),d.htmlFor="record-uid-"+e.uid,d.innerHTML=e.icon,d.appendChild(document.createTextNode(t)),s.appendChild(i),l.appendChild(s),n.appendChild(l),n.appendChild(d),o.appendChild(n),c.appendChild(o)}))
const s=document.createElement("fieldset")
s.classList.add("localization-fieldset")
const i=document.createElement("div")
i.classList.add("form-check","form-check-type-toggle")
const d=document.createElement("input")
d.classList.add("form-check-input","t3js-localization-toggle-column"),d.id="records-column-"+t,d.type="checkbox",d.checked=!0
const r=document.createElement("label")
r.classList.add("form-check-label"),r.htmlFor="records-column-"+t,r.textContent=n,i.appendChild(d),i.appendChild(r),s.appendChild(i),s.appendChild(c),e.append(s)})),c.unlockNextStep(),c.getComponent().on("change",".t3js-localization-toggle-record",(e=>{const o=t(e.currentTarget),n=o.data("uid"),l=o.closest("fieldset"),s=l.find(".t3js-localization-toggle-column")
if(o.is(":checked"))a.records.push(n)
else{const e=a.records.indexOf(n)
e>-1&&a.records.splice(e,1)}const i=l.find(".t3js-localization-toggle-record"),d=l.find(".t3js-localization-toggle-record:checked")
s.prop("checked",d.length>0),s.prop("__indeterminate",d.length>0&&d.length<i.length),a.records.length>0?c.unlockNextStep():c.lockNextStep()})).on("change",".t3js-localization-toggle-column",(e=>{const a=t(e.currentTarget),o=a.closest("fieldset").find(".t3js-localization-toggle-record")
o.prop("checked",a.is(":checked")),o.trigger("change")}))})),c.addFinalProcessingSlide((async(e,t)=>{await this.localizeRecords(parseInt(i.data("pageId"),10),parseInt(i.data("languageId"),10),t.sourceLanguage,t.localizationMode,t.records),c.dismiss(),document.location.reload()})).then((()=>{c.show(),c.getComponent().on("change",".t3js-localization-option",(e=>{c.set("localizationMode",t(e.currentTarget).val()),c.unlockNextStep()}))}))}))}loadAvailableLanguages(e,t){return new o(TYPO3.settings.ajaxUrls.page_languages).withQueryArguments({pageId:e,languageId:t}).get()}getSummary(e,t,a){return new o(TYPO3.settings.ajaxUrls.records_localize_summary).withQueryArguments({pageId:e,destLanguageId:t,languageId:a}).get()}localizeRecords(e,t,a,n,l){return new o(TYPO3.settings.ajaxUrls.records_localize).withQueryArguments({pageId:e,srcLanguageId:a,destLanguageId:t,action:n,uidList:l}).get()}}
