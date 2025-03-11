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
var e,t=function(e,t,i,s){var a,r=arguments.length,n=r<3?t:null===s?s=Object.getOwnPropertyDescriptor(t,i):s
if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,i,s)
else for(var d=e.length-1;d>=0;d--)(a=e[d])&&(n=(r<3?a(n):r>3?a(t,i,n):a(t,i))||n)
return r>3&&n&&Object.defineProperty(t,i,n),n}
import{html as i,LitElement as s,nothing as a}from"lit"
import{customElement as r,property as n,state as d,query as o}from"lit/decorators.js"
import{repeat as h}from"lit/directives/repeat.js"
import{unsafeHTML as l}from"lit/directives/unsafe-html.js"
import{styleMap as c}from"lit/directives/style-map.js"
import{Task as u}from"@lit/task"
import{animate as m,fadeIn as g,fadeOut as b}from"@lit-labs/motion"
import"@typo3/backend/element/icon-element.js"
import f from"@typo3/core/ajax/ajax-request.js"
import p from"@typo3/backend/storage/client.js"
import{lll as w,delay as v}from"@typo3/core/lit-helper.js"
import y from"@typo3/backend/modal.js"
import{SeverityEnum as D}from"@typo3/backend/enum/severity.js"
import{AjaxResponse as E}from"@typo3/core/ajax/ajax-response.js"
import{Categories as k}from"@typo3/backend/new-record-wizard.js"
import{topLevelModuleImport as x}from"@typo3/backend/utility/top-level-module-import.js"
import{selector as $}from"@typo3/core/literals.js"
import P from"@typo3/backend/utility/dom-helper.js"
import C from"@typo3/backend/notification.js"
!function(e){e.start="start",e.end="end",e.left="left",e.right="right",e.up="up",e.down="down"}(e||(e={}))
export class DashboardWidgetContentRenderedEvent extends Event{static{this.eventName="typo3:dashboard:widget:content:rendered"}constructor(e){super(DashboardWidgetContentRenderedEvent.eventName,{bubbles:!0,composed:!0,cancelable:!1}),this.widget=e}}class I extends Event{static{this.eventName="typo3:dashboard:widget:moveIntend"}constructor(e,t){super(I.eventName,{bubbles:!0,composed:!0,cancelable:!1}),this.identifier=e,this.intend=t}}class R extends Event{static{this.eventName="typo3:dashboard:widget:remove"}constructor(e){super(R.eventName,{bubbles:!0,composed:!0,cancelable:!1}),this.identifier=e}}class A extends Event{static{this.eventName="typo3:dashboard:widget:refresh"}constructor(e){super(A.eventName,{bubbles:!0,composed:!0,cancelable:!1}),this.identifier=e}}class S extends Event{static{this.eventName="typo3:dashboard:dashboard:add"}constructor(e,t){super(S.eventName),this.preset=e,this.title=t}}class T extends Event{static{this.eventName="typo3:dashboard:dashboard:edit"}constructor(e,t){super(T.eventName),this.identifier=e,this.title=t}}class M extends Event{static{this.eventName="typo3:dashboard:dashboard:update"}constructor(e,t,i){super(M.eventName),this.identifier=e,this.widgets=t,this.widgetPositions=i}}class j extends Event{static{this.eventName="typo3:dashboard:dashboard:delete"}constructor(e){super(j.eventName),this.identifier=e}}function q(e){const t=new Set
for(let i=0;i<e.height;i++)for(let s=0;s<e.width;s++){const a=`${e.y+i}-${e.x+s}`
t.add(a)}return t}let L=class extends s{constructor(){super(),this.loading=!1,this.dashboards=[],this.currentDashboard=null,this.columns=4,this.dragInformation=null,this.resizeObserver=null,this.clientStorageIdentifier="dashboard/current_dashboard",this.prefersReducedMotion=!1,this.mql=null,this.dragOverTimeout=null,this.activeElementRef=null,this.mqListener=e=>{this.prefersReducedMotion=e.matches},this.addEventListener(A.eventName,(e=>{e.preventDefault(),this.getGridItemByIdentifier(e.identifier).querySelector("typo3-dashboard-widget").refresh()})),this.addEventListener(R.eventName,(e=>{e.preventDefault()
const{identifier}=e
new f(TYPO3.settings.ajaxUrls.dashboard_widget_remove).post({dashboard:this.currentDashboard.identifier,identifier}).then((async e=>{const t=await e.resolve()
if("ok"===t.status){this.currentDashboard.widgets=this.currentDashboard.widgets.filter((e=>e.identifier!==identifier))
for(const[dashboardSize,dashboardSizeSet]of Object.entries(this.currentDashboard.widgetPositions)){const i=Number(dashboardSize)
this.currentDashboard.widgetPositions[i]=dashboardSizeSet.filter((e=>e.identifier!==identifier))}this.requestUpdate()}else C.error("",t.message)}))})),this.addEventListener(I.eventName,(t=>{t.preventDefault()
const{intend,identifier}=t,i=this.widgetPositionByIdentifier(identifier)
switch(intend){case e.up:i.y=Math.max(0,i.y-1)
break
case e.down:i.y++
break
case e.left:i.x=Math.max(0,i.x-1)
break
case e.right:i.x=Math.min(this.columns-i.width,i.x+1)
break
case e.end:return document.activeElement instanceof HTMLElement&&document.activeElement.closest("typo3-dashboard")===this&&(this.activeElementRef=document.activeElement),this.widgetPositionsSort(this.currentDashboard.widgetPositions[this.columns]),void this.dispatchEvent(new M(this.currentDashboard.identifier,this.currentDashboard.widgets,this.currentDashboard.widgetPositions))
default:return}this.widgetPositionChange(this.currentDashboard.widgetPositions[this.columns],i),this.updateComplete.then((()=>{const t=this.getGridItemByIdentifier(identifier)
if(t){const i=intend!==e.up
P.scrollIntoViewIfNeeded(t,i)}}))})),this.addEventListener(S.eventName,(e=>{e.preventDefault()
const{preset,title}=e
new f(TYPO3.settings.ajaxUrls.dashboard_dashboard_add).post({preset,title}).then((async e=>{const t=await e.resolve()
if("ok"===t.status){const i=t.dashboard
this.dashboards.push(i)
const s=this.getDashboardByIdentifier(i.identifier)||this.getDashboardFirst()
this.selectDashboard(s),this.requestUpdate()}else C.error("",t.message)}))})),this.addEventListener(T.eventName,(e=>{e.preventDefault()
const{identifier,title}=e
new f(TYPO3.settings.ajaxUrls.dashboard_dashboard_edit).post({identifier,title}).then((async e=>{const t=await e.resolve()
if("ok"===t.status){const i=this.dashboards.filter((e=>e.identifier===identifier))[0],s=this.dashboards.indexOf(i),a=t.dashboard
this.dashboards[s]=a,i.identifier===a.identifier&&this.selectDashboard(a),this.requestUpdate()}else C.error("",t.message)}))})),this.addEventListener(M.eventName,(e=>{e.preventDefault()
const{identifier,widgets,widgetPositions}=e
new f(TYPO3.settings.ajaxUrls.dashboard_dashboard_update).post({identifier,widgets,widgetPositions}).then((async e=>{const t=await e.resolve()
if("ok"===t.status){const i=this.dashboards.filter((e=>e.identifier===identifier))[0],s=this.dashboards.indexOf(i),a=t.dashboard
this.dashboards[s]=a,i.identifier===a.identifier&&this.selectDashboard(a),this.requestUpdate()}else C.error("",t.message)}))})),this.addEventListener(j.eventName,(e=>{e.preventDefault()
const{identifier}=e
new f(TYPO3.settings.ajaxUrls.dashboard_dashboard_delete).post({identifier}).then((async e=>{const t=await e.resolve()
if("ok"===t.status){this.dashboards=this.dashboards.filter((e=>e.identifier!==identifier))
const i=this.getDashboardFirst()
this.selectDashboard(i),this.requestUpdate()}else C.error("",t.message)}))}))}connectedCallback(){super.connectedCallback(),this.resizeObserver=new ResizeObserver((e=>{for(const t of e){const{width}=t.contentRect
width>950?this.columns=4:width>750?this.columns=2:this.columns=1}})),this.resizeObserver.observe(this),this.mql=window.matchMedia("(prefers-reduced-motion: reduce)"),this.mqListener(this.mql),this.mql.addEventListener("change",this.mqListener)}disconnectedCallback(){super.disconnectedCallback(),this.resizeObserver?.disconnect(),this.resizeObserver=null,this.mql?.removeEventListener("change",this.mqListener),this.mql=null}firstUpdated(){this.load()}updated(){this.activeElementRef&&(this.activeElementRef.focus(),this.activeElementRef=null)}createRenderRoot(){return this}render(){return this.loading?this.renderLoader():i`${this.renderHeader()}<div class="dashboard-container" @dragend="${this.handleDragEnd}" @dragover="${this.handleDragOver}" @dragstart="${this.handleDragStart}">${this.renderContent()}<div class="dashboard-dragging-container"></div></div>${this.renderFooter()}`}async load(){this.loading=!0,this.dashboards=await this.fetchDashboards()
const e=p.get(this.clientStorageIdentifier),t=this.getDashboardByIdentifier(e)||this.getDashboardFirst()
this.selectDashboard(t),this.loading=!1}async fetchData(e){try{return(await new f(e).get({cache:"no-cache"})).resolve()}catch(e){return console.error(e),[]}}async fetchPresets(){const e=await this.fetchData(TYPO3.settings.ajaxUrls.dashboard_presets_get)
return Object.values(e)}async fetchCategories(){const e=await this.fetchData(TYPO3.settings.ajaxUrls.dashboard_categories_get)
return k.fromData(e)}async fetchDashboards(){return await this.fetchData(TYPO3.settings.ajaxUrls.dashboard_dashboards_get)}getDashboardByIdentifier(e){return this.dashboards.find((t=>t.identifier===e))||null}getDashboardFirst(){return this.dashboards.length>0?this.dashboards[0]:null}async createDashboard(){const e=(await this.fetchPresets()).filter((e=>e.showInWizard)),t=i`<form><div class="form-group"><label class="form-label" for="dashboard-form-add-title">${w("dashboard.title")}</label> <input class="form-control" id="dashboard-form-add-title" type="text" name="title" required="required"></div><div class="dashboard-modal-items">${h(e,(e=>e.identifier),((e,t)=>i`<div class="dashboard-modal-item"><input type="radio" name="preset" value="${e.identifier}" class="dashboard-modal-item-checkbox" id="dashboard-form-add-preset-${e.identifier}" ?checked="${0===t}"> <label for="dashboard-form-add-preset-${e.identifier}" class="dashboard-modal-item-block"><span class="dashboard-modal-item-icon"><typo3-backend-icon identifier="${e.icon}" size="medium"></typo3-backend-icon></span><span class="dashboard-modal-item-details"><span class="dashboard-modal-item-title">${e.title}</span> <span class="dashboard-modal-item-description">${e.description}</span></span></label></div>`))}</div></form>`
y.advanced({type:y.types.default,title:w("dashboard.add"),size:y.sizes.medium,severity:D.notice,content:t,callback:e=>{e.addEventListener("typo3-modal-shown",(()=>{e.querySelector("#dashboard-form-add-title")?.focus()})),e.querySelector("form").addEventListener("submit",(t=>{t.preventDefault()
const i=t.target,s=new FormData(i)
this.dispatchEvent(new S(s.get("preset"),s.get("title"))),e.hideModal()}))},buttons:[{text:w("dashboard.add.button.close"),btnClass:"btn-default",name:"cancel",trigger:(e,t)=>t.hideModal()},{text:w("dashboard.add.button.ok"),btnClass:"btn-primary",name:"save",trigger:(e,t)=>t.querySelector("form").requestSubmit()}]})}editDashboard(e){const t=i`<form><div class="form-group"><label class="form-label" for="dashboard-form-edit-title">${w("dashboard.title")}</label> <input class="form-control" id="dashboard-form-edit-title" type="text" name="title" value="${e.title||""}" required="required"></div></form>`
y.advanced({type:y.types.default,title:w("dashboard.configure"),size:y.sizes.small,severity:D.notice,content:t,callback:t=>{t.addEventListener("typo3-modal-shown",(()=>{t.querySelector("#dashboard-form-edit-title")?.focus()})),t.querySelector("form").addEventListener("submit",(i=>{i.preventDefault()
const s=i.target,a=new FormData(s)
this.dispatchEvent(new T(e.identifier,a.get("title"))),t.hideModal()}))},buttons:[{text:w("dashboard.configure.button.close"),btnClass:"btn-default",name:"cancel",trigger:(e,t)=>t.hideModal()},{text:w("dashboard.configure.button.ok"),btnClass:"btn-primary",name:"save",trigger:(e,t)=>t.querySelector("form").requestSubmit()}]})}deleteDashboard(e){const t=y.confirm(w("dashboard.delete"),w("dashboard.delete.sure"),D.warning,[{text:w("dashboard.delete.cancel"),active:!0,btnClass:"btn-default",name:"cancel"},{text:w("dashboard.delete.ok"),btnClass:"btn-warning",name:"delete"}])
t.addEventListener("button.clicked",(i=>{"delete"===i.target.getAttribute("name")&&this.dispatchEvent(new j(e.identifier)),t.hideModal()}))}selectDashboard(e){null!==e&&p.set(this.clientStorageIdentifier,e.identifier),this.currentDashboard=e}async addWidget(){x("@typo3/backend/new-record-wizard.js")
const e=top.document.createElement("typo3-backend-new-record-wizard")
e.searchPlaceholder=w("widget.addToDashboard.searchLabel"),e.searchNothingFoundLabel=w("widget.addToDashboard.searchNotFound"),e.categories=await this.fetchCategories(),e.addEventListener("typo3:dashboard:widget:add",(async e=>{const{identifier}=e.detail.item,t=await new f(TYPO3.settings.ajaxUrls.dashboard_widget_add).post({dashboard:this.currentDashboard.identifier,type:identifier}),i=await t.resolve()
if("ok"===i.status){this.currentDashboard.widgets.push(i.widget),this.requestUpdate(),await this.updateComplete
const s=this.getGridItemByIdentifier(i.widget.identifier)
s&&(P.scrollIntoViewIfNeeded(s,!0),window.setTimeout((()=>s.querySelector(".widget-actions > button:first-child")?.focus({preventScroll:!0,focusVisible:!1})),50))}else C.error("",i.message)})),y.advanced({type:y.types.default,title:w("widget.addToDashboard",this.currentDashboard.title),size:y.sizes.medium,severity:D.notice,content:e,callback:e=>{e.addEventListener("button.clicked",(()=>{e.hideModal()}))},buttons:[{text:w("widget.add.button.close"),btnClass:"btn-default",name:"cancel"}]})}renderLoader(){return i`<div class="dashboard-loader"><typo3-backend-spinner size="medium"></typo3-backend-spinner></div>`}renderHeader(){const e=i`<button class="btn btn-primary btn-sm btn-dashboard-add-tab" title="${w("dashboard.add")}" @click="${()=>{this.createDashboard()}}"><typo3-backend-icon identifier="actions-plus" size="small"></typo3-backend-icon><span class="visually-hidden">${w("dashboard.add")}</span></button>`,t=null!==this.currentDashboard?i`<button class="btn btn-default btn-sm" title="${w("dashboard.configure")}" @click="${()=>{this.editDashboard(this.currentDashboard)}}"><typo3-backend-icon identifier="actions-cog" size="small"></typo3-backend-icon><span class="visually-hidden">${w("dashboard.configure")}</span></button>`:a,s=null!==this.currentDashboard?i`<button class="btn btn-default btn-sm" title="${w("dashboard.delete")}" @click="${()=>{this.deleteDashboard(this.currentDashboard)}}"><typo3-backend-icon identifier="actions-delete" size="small"></typo3-backend-icon><span class="visually-hidden">${w("dashboard.delete")}</span></button>`:a
return i`<div class="dashboard-header"><h1 class="visually-hidden">${this.currentDashboard?.title}</h1><div class="dashboard-header-container"><div class="dashboard-tabs">${h(this.dashboards,(e=>e.identifier),(e=>i`<button @click="${()=>{this.selectDashboard(e)}}" class="dashboard-tab${e===this.currentDashboard?" dashboard-tab--active":""}">${e.title}</button>`))} ${e}</div>${t||s?i`<div class="dashboard-configuration btn-toolbar" role="toolbar">${t}${s}</div>`:a}</div></div>`}renderContent(){if(this.currentDashboard){if(this.currentDashboard.widgets.length>0){this.initializeCurrentDashboard()
const e={keyframeOptions:{duration:250,fill:"both"},in:g,out:b,skipInitial:!0,disabled:this.prefersReducedMotion}
return i`<div class="dashboard-grid" style="${c({"--columns":this.columns})}">${h(this.currentDashboard.widgetPositions[this.columns],(e=>e.identifier),(t=>i`<div class="dashboard-item" style="${c({"--col-start":t.x+1,"--col-span":t.width,"--row-start":t.y+1,"--row-span":t.height})}" data-widget-hash="${t.identifier}" data-widget-key="${this.widgetByIdentifier(t.identifier)?.type}" data-widget-identifier="${t.identifier}" draggable="true" @pointerenter="${e=>e.target.setAttribute("draggable","true")}" @widgetRefresh="${()=>this.handleLegacyWidgetRefreshEvent(t)}" ${m(e)}><typo3-dashboard-widget .identifier="${t.identifier}"></typo3-dashboard-widget></div>`))}</div>`}return i`<div class="dashboard-empty"><div class="dashboard-empty-content"><h3>${w("dashboard.empty.content.title")}</h3><p>${w("dashboard.empty.content.description")}</p><button title="${w("widget.add")}" class="btn btn-primary" @click="${()=>{this.addWidget()}}"><typo3-backend-icon identifier="actions-plus" size="small"></typo3-backend-icon>${w("dashboard.empty.content.button")}</button></div></div>`}return a}renderFooter(){return null===this.currentDashboard?a:i`<div class="dashboard-add-item"><button class="btn btn-primary btn-dashboard-add-widget" title="${w("widget.addToDashboard",this.currentDashboard.title)}" @click="${()=>{this.addWidget()}}"><typo3-backend-icon identifier="actions-plus" size="small"></typo3-backend-icon><span class="visually-hidden">${w("widget.addToDashboard",this.currentDashboard.title)}</span></button></div>`}getGridItemByIdentifier(e){return this.querySelector($`.dashboard-item[data-widget-identifier="${e}"]`)}handleDragStart(e){const t=e.target.closest(".dashboard-item")
if(null===t)return void e.preventDefault()
if(null===document.elementFromPoint(e.clientX,e.clientY).closest(".widget-header"))return void e.preventDefault()
const i=t.dataset.widgetIdentifier,s=this.widgetPositionByIdentifier(i),a=t.getBoundingClientRect(),r=t.querySelector("typo3-dashboard-widget")
r.style.pointerEvents="none",this.dragInformation={identifier:i,itemElement:t,widgetElement:r,height:s.height,width:s.width,offsetY:e.clientY-a.top,offsetX:e.clientX-a.left,currentY:s.y,currentX:s.x,initialPositions:this.currentDashboard.widgetPositions[this.columns].map((e=>({...e})))}
const n=new Image
n.src="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==",e.dataTransfer.setDragImage(n,0,0),e.dataTransfer.setData("text/plain",""),e.dataTransfer.effectAllowed="move",t.classList.add("dashboard-item-dragging"),this.positionDraggingElement(e),this.draggingContainer.appendChild(r)}positionDraggingElement(e){const{itemElement,widgetElement}=this.dragInformation,t=itemElement.getBoundingClientRect(),i=this.querySelector(".dashboard-container").getBoundingClientRect(),s=(a=e.clientX-this.dragInformation.offsetX,r=i.left-20,n=i.left+i.width-t.width+20,Math.min(n,Math.max(r,a)))
var a,r,n
const d=Math.max(i.top-20,e.clientY-this.dragInformation.offsetY)
widgetElement.style.left=`${s}px`,widgetElement.style.top=`${d}px`,widgetElement.style.width=`${t.width}px`,widgetElement.style.height=`${t.height}px`}handleDragEnd(){if(this.dragInformation){const{itemElement,widgetElement}=this.dragInformation
itemElement.classList.remove("dashboard-item-dragging"),itemElement.appendChild(widgetElement),widgetElement.removeAttribute("style"),this.dragInformation=null,this.widgetPositionsSort(this.currentDashboard.widgetPositions[this.columns]),this.dispatchEvent(new M(this.currentDashboard.identifier,this.currentDashboard.widgets,this.currentDashboard.widgetPositions))}}handleDragOver(e){if(this.dragInformation){e.preventDefault(),e.dataTransfer.dropEffect="move",this.positionDraggingElement(e)
const t=this.querySelector(".dashboard-grid"),i=t.getBoundingClientRect(),s=parseInt(getComputedStyle(t).gap,10),a=parseInt(getComputedStyle(t).gridAutoRows,10)+s,r=(i.width+s)/this.columns,n=Math.max(0,e.clientY-i.top-this.dragInformation.offsetY),d=Math.max(0,e.clientX-i.left-this.dragInformation.offsetX),o=Math.max(0,Math.round(n/a)),h=Math.max(0,Math.min(Math.round(d/r),this.columns-this.dragInformation.width))
this.dragInformation.currentY===o&&this.dragInformation.currentX===h||(this.dragInformation.currentY=o,this.dragInformation.currentX=h,this.dragOverTimeout&&clearTimeout(this.dragOverTimeout),this.dragOverTimeout=window.setTimeout((()=>{if(this.dragInformation){const e=this.widgetPositionByIdentifier(this.dragInformation.identifier)
e.y=this.dragInformation.currentY,e.x=this.dragInformation.currentX,this.widgetPositionChange(this.currentDashboard.widgetPositions[this.columns],e)}}),100))}}handleLegacyWidgetRefreshEvent(e){this.dispatchEvent(new A(e.identifier))}initializeCurrentDashboard(){this.currentDashboard.widgetPositions=this.currentDashboard.widgetPositions??{}
let e=this.currentDashboard.widgetPositions?.[this.columns]??[]
const t={small:1,medium:2,large:4},i={small:1,medium:2,large:3}
this.currentDashboard.widgets.forEach((s=>{if(void 0===e.find((e=>e.identifier===s.identifier))){const a=i[s.height]??1,r=t[s.width]??1,n={identifier:s.identifier,height:a,width:r<this.columns?r:this.columns,y:0,x:0}
e.push(n)}})),e=this.widgetPositionsArrange(e),this.widgetPositionsCollapseRows(e),this.currentDashboard.widgetPositions[this.columns]=e}widgetByIdentifier(e){return this.currentDashboard.widgets.find((t=>t.identifier===e))??null}widgetPositionByIdentifier(e){return this.currentDashboard.widgetPositions[this.columns].find((t=>t.identifier===e))??null}widgetPositionCanPlace(e,t,i,s){return!(t<0||t>this.columns-e.width||i<0)&&s.isDisjointFrom(q({...e,x:t,y:i}))}widgetPositionChange(e,t){let i=structuredClone(this.dragInformation?.initialPositions??e)
const s=i.findIndex((e=>e.identifier===t.identifier))
let a
if(s>-1){const[item]=i.splice(s,1)
a={...item},item.y=t.y,item.x=t.x,i.unshift(item)}i=this.widgetPositionsArrange(i,this.dragInformation?.initialPositions??e,a),e.forEach((e=>{const t=i.find((t=>t.identifier===e.identifier))
e.y=t.y,e.x=t.x})),this.widgetPositionsCollapseRows(e),this.requestUpdate()}widgetTryPlacementInNeighbourCells(e,t,i){const s=this.columns
for(let a=e.x;a>=Math.max(0,e.x-e.width);a--)if(this.widgetPositionCanPlace(e,a,e.y,t))return{...e,x:a}
for(let r=e.y;r>=0;r--)if(this.widgetPositionCanPlace(e,e.x,r,t))return{...e,y:r}
for(a=e.x;a<=Math.min(s,e.x+e.width);a++)if(this.widgetPositionCanPlace(e,a,e.y,t))return{...e,x:a}
for(r=e.y;r<=e.y+(i?.height??3);r++)if(this.widgetPositionCanPlace(e,e.x,r,t))return{...e,y:r}
return null}widgetPositionsArrange(e,t,i){let s=new Set
const a=e=>this.widgetPositionCanPlace(e,e.x,e.y,s)?{...e}:null,r=e=>void 0===t?null:this.widgetTryPlacementInNeighbourCells(e,t.reduce(((e,t)=>e.union(q(t))),new Set).difference(q(i)).union(s),i),n=e=>this.widgetTryPlacementInNeighbourCells(e,s),d=e=>{const t=Math.max(0,e.y),i=Math.max(0,Math.min(this.columns-e.width,e.x)),a=Math.max(0,i),r=this.columns
for(let n=e.y;n<t+100;n++)for(let d=a;d<r;d++)if(this.widgetPositionCanPlace(e,d,n,s))return{...e,x:d,y:n}
throw new Error("Logic error: could not occupy cells")}
return e.map((e=>{return t=a(e)??r(e)??n(e)??d(e),s=s.union(q(t)),t
var t}))}widgetPositionsCollapseRows(e){const t=new Set
e.forEach((e=>{for(let i=0;i<e.height;i++)t.add(e.y+i)}))
const i={}
let s=0
for(let a=0;a<=Math.max(...t);a++)t.has(a)&&(i[a]=s++)
e.forEach((e=>{e.y=i[e.y]}))}widgetPositionsSort(e){e.sort(((e,t)=>e.y!==t.y?e.y-t.y:e.x-t.x))}}
t([d()],L.prototype,"loading",void 0),t([d()],L.prototype,"dashboards",void 0),t([d()],L.prototype,"currentDashboard",void 0),t([d()],L.prototype,"columns",void 0),t([d()],L.prototype,"dragInformation",void 0),t([o(".dashboard-dragging-container")],L.prototype,"draggingContainer",void 0),L=t([r("typo3-dashboard")],L)
export{L as Dashboard}
let O=class extends s{constructor(){super(...arguments),this.moving=!1,this.triggerContentRenderedEvent=!1,this.fetchTask=new u(this,{args:()=>[this.identifier],task:async([identifier],{signal})=>{const e=TYPO3.settings.ajaxUrls.dashboard_widget_get,t=await new f(e).withQueryArguments({widget:identifier}).get({signal}),i=await t.resolve()
if("ok"!==i.status)throw new Error(i.message)
return i.widget},onComplete:async()=>{this.triggerContentRenderedEvent=!0},onError:e=>{console.error(`Error while retrieving widget [${this.identifier}]: ${e instanceof E?`${e.response.status} ${e.response.statusText}`:e.message}`)}})}get widget(){return this.fetchTask.value??null}refresh(){this.handleRefresh()}createRenderRoot(){return this}updated(){if(this.triggerContentRenderedEvent){this.triggerContentRenderedEvent=!1
const{widget}=this
this.dispatchEvent(new DashboardWidgetContentRenderedEvent(widget)),this.dispatchEvent(new CustomEvent("widgetContentRendered",{bubbles:!0,detail:this.widget.eventdata}))}}render(){const e=i`<div class="widget-loader"><typo3-backend-spinner size="medium"></typo3-backend-spinner></div>`,t=(loading=!1)=>i`<button type="button" title="${w("widget.refresh")}" class="widget-action widget-action-refresh" @click="${this.handleRefresh}">${loading?i`<typo3-backend-spinner size="small"></typo3-backend-spinner>`:i`<typo3-backend-icon identifier="actions-refresh" size="small"></typo3-backend-icon>`} <span class="visually-hidden">${w("widget.refresh")}</span></button>`,s=(e,loading=!1)=>i`<div class="widget-header"><div class="widget-title">${(e=>e?.label||"ERROR")(e)}</div><div class="widget-actions">${e?.options?.refreshAvailable?t(loading):a} <button type="button" title="${w("widget.move")}" class="widget-action widget-action-move" @click="${this.handleMoveClick}" @focusout="${this.handleMoveFocusOut}" @keydown="${this.handleMoveKeyDown}"><typo3-backend-icon identifier="${this.moving?"actions-thumbtack":"actions-move"}" size="small"></typo3-backend-icon><span class="visually-hidden">${w("widget.move")}</span></button> <button type="button" title="${w("widget.remove")}" class="widget-action widget-action-remove" @click="${this.handleRemove}"><typo3-backend-icon identifier="actions-delete" size="small"></typo3-backend-icon><span class="visually-hidden">${w("widget.remove")}</span></button></div></div><div class="widget-content" @pointerenter="${e=>e.target.closest(".dashboard-item").removeAttribute("draggable")}" @pointerleave="${e=>e.target.closest(".dashboard-item").setAttribute("draggable","true")}">${(e=>e?l(e.content):i`<div class="widget-content-main">${w("widget.error")}</div>`)(e)}</div>`,r=this.fetchTask.render({initial:()=>a,error:()=>s(null),pending:()=>this.fetchTask.value?s(this.fetchTask.value,!0):v(80,(()=>e)),complete:e=>s(e)})
return i`<div class="widget ${this.moving?" widget-selected":""}">${r}</div>`}moveStart(){!1===this.moving&&(this.moving=!0,this.dispatchEvent(new I(this.widget.identifier,e.start)))}moveEnd(){!0===this.moving&&(this.moving=!1,this.dispatchEvent(new I(this.widget.identifier,e.end)))}handleMoveClick(){this.moving?this.moveEnd():this.moveStart()}handleMoveFocusOut(){this.moveEnd()}handleMoveKeyDown(t){if(!this.moving)return
if(!["ArrowDown","ArrowUp","ArrowLeft","ArrowRight","Home","End","Enter","Space","Escape","Tab"].includes(t.code)||t.altKey||t.ctrlKey)return
t.preventDefault(),t.stopPropagation()
let i=e.end
switch(t.code){case"Escape":case"Enter":case"Space":return void this.moveEnd()
case"ArrowUp":i=e.up
break
case"ArrowDown":i=e.down
break
case"ArrowLeft":i=e.left
break
case"ArrowRight":i=e.right
break
default:return}this.dispatchEvent(new I(this.widget.identifier,i))}handleRefresh(){this.fetchTask.run()}handleRemove(e){const t=y.confirm(w("widget.remove.confirm.title"),w("widget.remove.confirm.message"),D.warning,[{text:w("widget.remove.button.close"),active:!0,btnClass:"btn-default",name:"cancel"},{text:w("widget.remove.button.ok"),btnClass:"btn-warning",name:"delete"}])
t.addEventListener("button.clicked",(e=>{"delete"===e.target.getAttribute("name")&&this.dispatchEvent(new R(this.identifier)),t.hideModal()}))
const i=e.currentTarget
t.addEventListener("typo3-modal-hide",(()=>{i?.focus()}))}}
t([n({type:String,reflect:!0})],O.prototype,"identifier",void 0),t([d()],O.prototype,"moving",void 0),O=t([r("typo3-dashboard-widget")],O)
export{O as DashboardWidget}
