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
import{lll as e}from"@typo3/core/lit-helper.js"
import t from"@typo3/backend/modal.js"
import"@typo3/backend/element/icon-element.js"
import"@typo3/backend/input/clearable.js"
import"@typo3/backend/live-search/element/result/result-pagination.js"
import"@typo3/backend/live-search/element/search-option-item.js"
import"@typo3/backend/live-search/live-search-shortcut.js"
import o from"@typo3/core/document-service.js"
import r from"@typo3/core/event/regular-event.js"
import n from"@typo3/core/event/debounce-event.js"
import{SeverityEnum as a}from"@typo3/backend/enum/severity.js"
import s from"@typo3/core/ajax/ajax-request.js"
import i from"@typo3/backend/storage/browser-session.js"
import{componentName as c}from"@typo3/backend/live-search/element/result/result-container.js"
import{ModuleStateStorage as l}from"@typo3/backend/storage/module-state-storage.js"
var p
!function(e){e.toolbarItem=".t3js-topbar-button-search",e.searchOptionDropdownToggle=".t3js-search-provider-dropdown-toggle"}(p||(p={}))
class u{constructor(){this.search=async e=>{if(""===e.get("query").toString())this.updateSearchResults(null)
else{document.querySelector(c).loading=!0
const t=await(await new s(TYPO3.settings.ajaxUrls.livesearch).post(e)).raw().json()
this.updateSearchResults(t)}},o.ready().then((()=>{this.registerEvents()}))}registerEvents(){new r("click",(()=>{this.openSearchModal()})).delegateTo(document,p.toolbarItem),new r("typo3:live-search:trigger-open",(()=>{t.currentModal||this.openSearchModal()})).bindTo(document)}openSearchModal(){const o=new URL(TYPO3.settings.ajaxUrls.livesearch_form,window.location.origin),s=l.current("web")
s.identifier&&o.searchParams.set("pageId",s.identifier),o.searchParams.set("query",i.get("livesearch-term")??""),o.searchParams.set("offset",i.get("livesearch-offset")??"0")
const c=Object.entries(i.getByPrefix("livesearch-option-")).filter((e=>"1"===e[1])).map((e=>{const t=e[0].replace("livesearch-option-",""),[key,value]=t.split("-",2)
return{key,value}})),u=this.composeSearchOptions(c)
for(const[optionKey,optionValues]of Object.entries(u))for(const d of optionValues)o.searchParams.append(`${optionKey}[]`,d)
const h=t.advanced({type:t.types.ajax,content:o.toString(),title:e("labels.search"),severity:a.notice,size:t.sizes.medium,ajaxCallback:()=>{const e=h.querySelector("typo3-backend-live-search"),o=e.querySelector("form"),a=o.querySelector('input[type="search"]'),s=o.querySelector('input[name="offset"]')
new r("livesearch:demand-changed",(()=>{s.value="0"})).bindTo(e),new r("livesearch:pagination-selected",(e=>{s.value=e.detail.offset.toString(10),o.requestSubmit()})).bindTo(e),new r("submit",(e=>{e.preventDefault()
const t=new FormData(o)
this.search(t).then((()=>{const e=t.get("query").toString(),o=t.get("offset")?.toString()
i.set("livesearch-term",e),o&&i.set("livesearch-offset",o)}))
const r=o.querySelector("[data-active-options-counter]"),n=parseInt(r.dataset.activeOptionsCounter,10)
r.querySelector("output").textContent=n.toString(10),r.classList.toggle("hidden",0===n)})).bindTo(o),a.clearable({onClear:()=>{o.requestSubmit()}})
const c=document.querySelector("typo3-backend-live-search-result-container")
new r("live-search:item-chosen",(()=>{t.dismiss()})).bindTo(c),new r("typo3:live-search:option-invoked",(t=>{e.dispatchEvent(new CustomEvent("livesearch:demand-changed"))
const r=o.querySelector("[data-active-options-counter]")
let n=parseInt(r.dataset.activeOptionsCounter,10)
n=t.detail.active?n+1:n-1,r.dataset.activeOptionsCounter=n.toString(10)})).bindTo(e),new r("hide.bs.dropdown",(()=>{o.requestSubmit()})).bindTo(h.querySelector(p.searchOptionDropdownToggle)),new n("input",(()=>{e.dispatchEvent(new CustomEvent("livesearch:demand-changed")),o.requestSubmit()})).bindTo(a),new r("keydown",this.handleKeyDown).bindTo(a),o.requestSubmit()}});["modal-loaded","typo3-modal-shown"].forEach((e=>{h.addEventListener(e,(()=>{const e=h.querySelector('input[type="search"]')
null!==e&&(e.focus(),e.select())}))}))}composeSearchOptions(e){const t={}
return e.forEach((e=>{void 0===t[e.key]&&(t[e.key]=[]),t[e.key].push(e.value)})),t}handleKeyDown(e){if("ArrowDown"!==e.key)return
e.preventDefault()
const t=document.querySelector("typo3-backend-live-search").querySelector("typo3-backend-live-search-result-item")
t?.focus()}updateSearchResults(e){const t=document.querySelector("typo3-backend-live-search-result-container")
t.results=e?.results??null,t.loading=!1,this.updatePagination(e?.pagination??null)}updatePagination(e){document.querySelector("typo3-backend-live-search-result-pagination").pagination=e}}let d
top.TYPO3.LiveSearch?d=top.TYPO3.LiveSearch:(d=new u,top.TYPO3.LiveSearch=d)
export default d
