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
var e,t=function(e,t,n,o){var i,s=arguments.length,r=s<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,n):o
if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(e,t,n,o)
else for(var a=e.length-1;a>=0;a--)(i=e[a])&&(r=(s<3?i(r):s>3?i(t,n,r):i(t,n))||r)
return s>3&&r&&Object.defineProperty(t,n,r),r}
import{AjaxResponse as n}from"@typo3/core/ajax/ajax-response.js"
import o from"@typo3/core/ajax/ajax-request.js"
import i from"@typo3/backend/context-menu-actions.js"
import"@typo3/backend/element/spinner-element.js"
import{customElement as s,queryAll as r,state as a}from"lit/decorators.js"
import{html as c,LitElement as l,nothing as d}from"lit"
import{delay as u}from"@typo3/core/lit-helper.js"
import{styleMap as h}from"lit/directives/style-map.js"
import{unsafeHTML as m}from"lit/directives/unsafe-html.js"
import{Task as p,initialState as f}from"@lit/task"
import g from"@typo3/backend/notification.js"
!function(e){e.open="typo3:contextmenu:open",e.close="typo3:contextmenu:close"}(e||(e={}))
export default new class{constructor(){document.addEventListener("click",(e=>{this.handleTriggerEvent(e)})),document.addEventListener("contextmenu",(e=>{this.handleTriggerEvent(e)}))}show(t,n,o,i,s,eventSource=null,originalEvent=null){const r=new CustomEvent(e.open,{detail:{table:t,uid:n,context:o,eventSource,originalEvent},bubbles:!0,composed:!0})
top.document.dispatchEvent(r)}handleTriggerEvent(e){if(!(e.target instanceof Element))return
const t=e.target.closest("[data-contextmenu-trigger]")
t instanceof HTMLElement&&this.handleContextMenuEvent(e,t)}handleContextMenuEvent(e,t){const n=t.dataset.contextmenuTrigger
"click"!==n&&n!==e.type||(e.preventDefault(),this.show(t.dataset.contextmenuTable??"",t.dataset.contextmenuUid??"",t.dataset.contextmenuContext??"","","",t,e))}}
let x=class extends l{constructor(){super(...arguments),this.open=!1,this.table="",this.uid="",this.context="",this.rootPositionY=0,this.rootPositionX=0,this.eventSource=null,this.rootIdentifier="root",this.focusFirstElement=!1,this.fetchTask=new p(this,{autoRun:!1,args:()=>[this.table,this.uid,this.context,this.open],task:async([table,uid,context,isOpen],{signal})=>{if(!isOpen)return f
const e=new URLSearchParams
if(""!==table&&e.set("table",table),""!==uid&&e.set("uid",uid.toString()),""!==context&&e.set("context",context),0===e.size)return f
const t=TYPO3.settings.ajaxUrls.contextmenu,n=await new o(t).withQueryArguments(e).get({signal}),i=Object.values(await n.resolve())
return 0===i.length?f:this.enhanceNodes("root",i)},onComplete:()=>{this.focusFirstElement=!0},onError:e=>{e instanceof n?g.error("",e.response.status+" "+e.response.statusText,5):g.error("",e.message)}}),this.show=e=>{const t=e.detail
if(this.open=!0,this.table=t.table,this.uid=t.uid,this.context=t.context,this.eventSource=t.eventSource,null!==t.originalEvent){const n=this.calculateIframeOffset(t.originalEvent.view,window)
this.rootPositionY=t.originalEvent.clientY+n.y,this.rootPositionX=t.originalEvent.clientX+n.x}this.fetchTask.run()},this.hide=async()=>{this.open&&(this.open=!1,this.fetchTask.run(),await this.updateComplete,this.eventSource?.focus())}}get nodes(){return this.fetchTask.value??[]}connectedCallback(){super.connectedCallback(),window.addEventListener("resize",this.hide),document.addEventListener(e.open,this.show),document.addEventListener(e.close,this.hide)}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("resize",this.hide),document.removeEventListener(e.open,this.show),document.removeEventListener(e.close,this.hide)}updated(){if(this.focusFirstElement){if(this.contextMenuItemElements.length>0){Array.from(this.contextMenuItemElements).at(0).focus()}this.focusFirstElement=!1}this.updateContextMenuPositions()}createRenderRoot(){return this}render(){return this.fetchTask.render({initial:()=>d,pending:()=>[this.renderOverlay(),u(80,(()=>this.renderMenu(null,this.rootIdentifier,this.rootPositionY,this.rootPositionX)))],complete:e=>[this.renderOverlay(),this.renderMenu(e,this.rootIdentifier,this.rootPositionY,this.rootPositionX),this.flattenMenuItems(e).filter((e=>"submenu"===e.type)).map((e=>this.isNodeExpanded(e)?this.renderMenu(e.childItems,this.getNodeIdentifier(e),this.rootPositionY,this.rootPositionX):d))]})}renderOverlay(){return c`<div class="context-menu-overlay" @click="${e=>this.handleOverlayClick(e)}" @contextmenu="${e=>this.handleOverlayClick(e)}"></div>`}renderMenu(e,t,n,o){const i={top:n+"px",insetInlineStart:o+"px"}
return null===e?c`<div id="contextmenu-${t}" data-contextmenu-parent="${t}" class="context-menu" style="${h(i)}"><typo3-backend-spinner size="medium"></typo3-backend-spinner></div>`:0===e.length?d:c`<div id="contextmenu-${t}" data-contextmenu-parent="${t}" class="context-menu" style="${h(i)}"><ul class="context-menu-group" role="menu">${e.map((e=>c`<li role="presentation">${this.renderMenuItem(e)}</li>`))}</ul></div>`}renderMenuItem(e){return"divider"===e.type?c`<hr class="context-menu-divider">`:c`<button type="button" class="context-menu-item" tabindex="-1" role="menuitem" data-contextmenu-id="${this.getNodeIdentifier(e)}" data-contextmenu-type="${e.type}" aria-posinset="${this.getNodePositionInSet(e)}" aria-setsize="${this.getNodeSetSize(e)}" aria-label="${e.label}" aria-popup="${"submenu"===e.type?"menu":d}" @click="${t=>{this.handleNodeClick(t,e)}}" @keydown="${t=>{this.handleNodeKeyDown(t,e)}}"><span class="context-menu-item-icon" role="presentation">${m(e.icon)}</span> <span class="context-menu-item-label" role="presentation">${m(e.label)}</span> ${"submenu"===e.type?c`<span class="context-menu-item-indicator"><typo3-backend-icon identifier="actions-chevron-${"ltr"===this.getDocumentDirection()?"right":"left"}" size="small"></typo3-backend-icon></span>`:""}</button>`}showSubmenu(e){e.__expanded=!0}hideSubmenu(e){e.__expanded=!1}handleNodeClick(e,t){if("submenu"===t.type)return void(this.isNodeExpanded(t)?this.hideSubmenu(t):this.showSubmenu(t))
const n=this.extractDataAttributesAndConvertToDataset(t.additionalAttributes),o=t.callbackAction,{callbackModule,...dataAttributesToPass}=n
callbackModule?import(callbackModule+".js").then((({default:callbackModuleCallback})=>{callbackModuleCallback[o](this.table,this.uid,dataAttributesToPass)})):i&&"function"==typeof i[o]?i[o](this.table,this.uid,dataAttributesToPass):console.error("action: "+o+" not found"),this.hide()}mapIframeTarget(e,t){if("IFRAME"!==e.tagName)return e
const n=e
let o
try{o=n.contentWindow}catch{return e}const i=n.getBoundingClientRect()
return o.document.elementFromPoint(t.clientX-i.x,t.clientY-i.y)??e}async handleOverlayClick(e){e.preventDefault(),e.stopPropagation(),this.eventSource=null,await this.hide()
let t=document.elementFromPoint(e.clientX,e.clientY)
t&&t!==e.currentTarget&&((t=this.mapIframeTarget(t,e)).dispatchEvent(new PointerEvent(e.type,e)),"INPUT"!==t.tagName&&"TEXTAREA"!==t.tagName||t.focus())}async handleNodeKeyDown(e,t){if(!["ArrowDown","ArrowUp","ArrowLeft","ArrowRight","Home","End","Enter","Space","Escape","Tab"].includes(e.code)||e.altKey||e.ctrlKey)return
e.preventDefault(),e.stopPropagation()
const n=this.getParralellNodesForNavigation(t),o=this.getFirstNode(n),i=this.getLastNode(n),s=this.getParentNode(t),r=this.getPreviousNode(t),a=this.getNextNode(t)
switch(e.code){case"Enter":case"Space":if("submenu"===t.type){this.showSubmenu(t),await this.updateComplete,(o=this.getFirstNode(t.childItems))&&this.getElementFromNode(o)?.focus()}else this.getElementFromNode(t)?.click()
break
case"Tab":this.hide()
break
case"Escape":s?(this.hideSubmenu(s),await this.updateComplete,this.getElementFromNode(s)?.focus()):this.hide()
break
case"ArrowUp":r&&this.getElementFromNode(r)?.focus()
break
case"ArrowDown":a&&this.getElementFromNode(a)?.focus()
break
case"ArrowRight":if("submenu"===t.type){this.showSubmenu(t),await this.updateComplete,(o=this.getFirstNode(t.childItems))&&this.getElementFromNode(o)?.focus()}break
case"ArrowLeft":s&&(this.hideSubmenu(s),await this.updateComplete,this.getElementFromNode(s)?.focus())
break
case"Home":this.getElementFromNode(o)?.focus()
break
case"End":this.getElementFromNode(i)?.focus()
break
default:return}}getNodeIdentifier(e){return e.__contextMenuIdentifier}getNodeParentIdentifier(e){return e.__contextMenuParentIdentifier}getNodePositionInSet(e){return this.getParralellNodesForNavigation(e).indexOf(e)+1}getNodeSetSize(e){return this.getParralellNodesForNavigation(e).length}getParentNode(e){const t=this.getNodeParentIdentifier(e)
return this.getNodeByIdentifier(t)}getNodeByIdentifier(e){return this.flattenMenuItems(this.nodes).find((t=>this.getNodeIdentifier(t)===e))??null}getPreviousNode(e){const t=this.getParralellNodesForNavigation(e),n=t.indexOf(e)-1
return t[n]?t[n]:this.getLastNode(t)}getNextNode(e){const t=this.getParralellNodesForNavigation(e),n=t.indexOf(e)+1
return t[n]?t[n]:this.getFirstNode(t)}getFirstNode(e){return e.at(0)??null}getLastNode(e){return e.at(-1)??null}isNodeExpanded(e){return!0===e.__expanded}getElementFromNode(e){return this.querySelector('[data-contextmenu-id="'+this.getNodeIdentifier(e)+'"]')}enhanceNodes(e,t){return t.reduce(((t,n)=>{const o=e+"_"+n.identifier,i={...n,__contextMenuIdentifier:o,__contextMenuParentIdentifier:e,__expanded:!1,childItems:this.enhanceNodes(o,Object.values(n.childItems??{}))},s=this
return[...t,new Proxy(i,{set:(e,t,n)=>(e[t]!==n&&(e[t]=n,s.requestUpdate()),!0)})]}),[])}calculateIframeOffset(e,t){let n=0,o=0
if(e===t)return{x:n,y:o}
const i=this.calculateIframeOffset(e.parent,t)
n+=i.x,o+=i.y
const s=e.frameElement
if(s){const r=s.getBoundingClientRect()
n+=r.x,o+=r.y}return{x:n,y:o}}extractDataAttributesAndConvertToDataset(e){const t=e=>e.replace(/^data-/,"").replace(/-([a-z])/g,((e,t)=>t.toUpperCase()))
return Object.fromEntries(Object.entries(e).filter((([key])=>key.startsWith("data-"))).map((([key,value])=>[t(key),String(value)])))}updateContextMenuPositions(){if(this.contextMenuElements.length>0){const e=this.contextMenuElements[0]
this.updateContextMenuPosition(e,this.rootPositionY,this.rootPositionX)
const t=[...this.contextMenuElements].slice(1),n=this.getDocumentDirection()
t.forEach((e=>{const t=this.getNodeByIdentifier(e.dataset.contextmenuParent),o=this.getElementFromNode(t).getBoundingClientRect(),i=o.top-7,s="ltr"===n?o.right:o.left
this.updateContextMenuPosition(e,i,s)}))}}updateContextMenuPosition(e,t,n){const o=this.getDocumentDirection(),i=e.offsetWidth,s=e.offsetHeight,r=document.documentElement.clientWidth,a=document.documentElement.clientHeight
let c=0,l=0;(l=t)+s+10+5<a?l+=5:l=a-s-10,(c="ltr"===o?n:r-n)+i+10+5<r?c+=5:c=r-i-10,e.style.top=Math.round(l)+"px",e.style.insetInlineStart=Math.round(c)+"px"}flattenMenuItems(e){const t=[]
for(const n of e)t.push(n),n.childItems&&t.push(...this.flattenMenuItems(n.childItems))
return t}getParralellNodesForNavigation(e){const t=this.getParentNode(e)
return t?t.childItems.filter((e=>"divider"!==e.type)):this.nodes.filter((e=>"divider"!==e.type))}getDocumentDirection(){return"rtl"===document.querySelector("html").dir?"rtl":"ltr"}}
t([a()],x.prototype,"open",void 0),t([a()],x.prototype,"table",void 0),t([a()],x.prototype,"uid",void 0),t([a()],x.prototype,"context",void 0),t([a()],x.prototype,"rootPositionY",void 0),t([a()],x.prototype,"rootPositionX",void 0),t([a()],x.prototype,"eventSource",void 0),t([r(".context-menu")],x.prototype,"contextMenuElements",void 0),t([r(".context-menu-item")],x.prototype,"contextMenuItemElements",void 0),x=t([s("typo3-backend-context-menu")],x)
export{x as ContextMenuElement}
