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
var e,t=function(e,t,i,s){var n,r=arguments.length,o=r<3?t:null===s?s=Object.getOwnPropertyDescriptor(t,i):s
if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(e,t,i,s)
else for(var a=e.length-1;a>=0;a--)(n=e[a])&&(o=(r<3?n(o):r>3?n(t,i,o):n(t,i))||o)
return r>3&&o&&Object.defineProperty(t,i,o),o}
import{html as i,LitElement as s}from"lit"
import{customElement as n,property as r,state as o}from"lit/decorators.js"
!function(e){e.move="move",e.resizeN="resizeN",e.resizeE="resizeE",e.resizeS="resizeS",e.resizeW="resizeW",e.resizeSE="resizeSE",e.resizeSW="resizeSW",e.resizeNE="resizeNE",e.resizeNW="resizeNW"}(e||(e={}))
const a=[e.resizeNW,e.resizeN,e.resizeNE],h=[e.resizeNE,e.resizeE,e.resizeSE],d=[e.resizeSE,e.resizeS,e.resizeSW],l=[e.resizeSW,e.resizeW,e.resizeNW]
export class Offset{constructor(e,t,i,s){this.left=e,this.top=t,this.width=i,this.height=s}get right(){return this.left+this.width}get bottom(){return this.top+this.height}clone(){return new Offset(this.left,this.top,this.width,this.height)}}let c=class extends s{constructor(){super(...arguments),this.offset=null,this.container=null,this.pointerEventNames={pointerDown:["mousedown"],pointerMove:["mousemove"],pointerUp:["mouseup"]},this.reverting=!1,this.action=null,this.windowRef=window,this.documentRef=document,this.originOffset=null,this.originPosition=null}get document(){return this.documentRef}get window(){return this.windowRef}set window(e){this.windowRef=e,this.documentRef=e.document}revert(e){this.reverting=!0,this.offset=e,setTimeout((()=>this.reverting=!1),500)}connectedCallback(){super.connectedCallback(),this.container instanceof HTMLElement||(this.container=this.parentElement),this.pointerEventNames.pointerDown.forEach((e=>this.documentRef.addEventListener(e,this.handleStart.bind(this),!0))),this.pointerEventNames.pointerMove.forEach((e=>this.documentRef.addEventListener(e,this.handleUpdate.bind(this),!0))),this.pointerEventNames.pointerUp.forEach((e=>this.documentRef.addEventListener(e,this.handleFinish.bind(this),!0)))}disconnectedCallback(){super.disconnectedCallback(),this.pointerEventNames.pointerDown.forEach((e=>this.documentRef.removeEventListener(e,this.handleStart.bind(this),!0))),this.pointerEventNames.pointerMove.forEach((e=>this.documentRef.removeEventListener(e,this.handleUpdate.bind(this),!0))),this.pointerEventNames.pointerUp.forEach((e=>this.documentRef.removeEventListener(e,this.handleFinish.bind(this),!0)))}render(){return i`<div id="t3js-cropper-focus-area" class="cropper-focus-area ui-draggable ui-draggable-handle ui-resizable"><div class="ui-resizable-handle ui-resizable-n" data-resize="n"></div><div class="ui-resizable-handle ui-resizable-e" data-resize="e"></div><div class="ui-resizable-handle ui-resizable-s" data-resize="s"></div><div class="ui-resizable-handle ui-resizable-w" data-resize="w"></div><div class="ui-resizable-handle ui-resizable-se ui-icon ui-icon-gripsmall-diagonal-se" data-resize="se"></div><div class="ui-resizable-handle ui-resizable-sw" data-resize="sw"></div><div class="ui-resizable-handle ui-resizable-ne" data-resize="ne"></div><div class="ui-resizable-handle ui-resizable-nw" data-resize="nw"></div></div>`}update(e){super.update(e),Object.assign(this.style,this.getOffsetStyles(this.offset))}createRenderRoot(){return this}handleStart(t){const i=t.target
if(1===t.buttons&&this.contains(i)){if(i.dataset.resize){const t="resize"+i.dataset.resize.toUpperCase()
this.action=e[t]}else this.action=e.move
this.reverting=!1,this.originOffset=this.offset.clone(),this.originPosition={x:t.clientX,y:t.clientY},this.dispatchEvent(this.createEvent("draggable-resizable-started",{action:this.action,originOffset:this.originOffset}))}}handleUpdate(e){if(!this.action)return
const t={x:e.clientX-this.originPosition.x,y:e.clientY-this.originPosition.y}
this.offset=this.adjustOffset(this.originOffset,t),this.dispatchEvent(this.createEvent("draggable-resizable-updated",{action:this.action,originOffset:this.originOffset}))}handleFinish(){this.action&&(this.dispatchEvent(this.createEvent("draggable-resizable-finished",{action:this.action,originOffset:this.originOffset})),this.action=null,this.originOffset=null,this.originPosition=null)}adjustOffset(t,i){const s=this.container.getBoundingClientRect(),n=t.clone()
if(this.action===e.move&&(n.left=this.minMax(n.left+i.x,0,s.width-n.width),n.top=this.minMax(n.top+i.y,0,s.height-n.height)),a.includes(this.action)){const e=this.minMax(i.y,-n.top,n.height-2)
n.top+=e,n.height-=e}else d.includes(this.action)&&(n.height=this.minMax(n.height+i.y,2,s.height-n.top))
if(l.includes(this.action)){const e=this.minMax(i.x,-n.left,n.width-2)
n.left+=e,n.width-=e}else h.includes(this.action)&&(n.width+=i.x)
return n}minMax(e,t,i){return e<t?t:e>i?i:e}createEvent(e,t){return new CustomEvent(e,{detail:t,bubbles:!0,composed:!0})}getOffsetStyles(e){return{left:`${e.left}px`,top:`${e.top}px`,width:`${e.width}px`,height:`${e.height}px`}}}
t([r({type:Object,reflect:!0})],c.prototype,"offset",void 0),t([r({type:HTMLElement})],c.prototype,"container",void 0),t([r({type:Object})],c.prototype,"pointerEventNames",void 0),t([r({type:Boolean,reflect:!0})],c.prototype,"reverting",void 0),t([o()],c.prototype,"action",void 0),t([o()],c.prototype,"windowRef",void 0),t([o()],c.prototype,"documentRef",void 0),c=t([n("typo3-backend-draggable-resizable")],c)
export{c as DraggableResizableElement}
