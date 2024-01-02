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
var __decorate=function(e,t,o,i){var d,r=arguments.length,n=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,o,i);else for(var a=e.length-1;a>=0;a--)(d=e[a])&&(n=(r<3?d(n):r>3?d(t,o,n):d(t,o))||n);return r>3&&n&&Object.defineProperty(t,o,n),n};import{html,css,LitElement}from"lit";import{classMap}from"lit/directives/class-map.js";import{customElement,state}from"lit/decorators.js";import ThrottleEvent from"@typo3/core/event/throttle-event.js";let ModuleElement=class extends LitElement{constructor(){super(...arguments),this.folded=!0,this.direction="down",this.reactionRange=300,this.lastPosition=0,this.currentPosition=0,this.changedPosition=0}connectedCallback(){super.connectedCallback(),this.scrollEvent?.release(),this.scrollEvent=new ThrottleEvent("scroll",(e=>this.onScroll(e)),100),this.scrollEvent.bindTo(document)}disconnectedCallback(){super.disconnectedCallback(),this.scrollEvent?.release(),this.scrollEvent=null}render(){const e={docheader:!0,"docheader-folded":this.folded};return html`
     <slot name="loading-indicator"></slot>

     <div class=${classMap(e)} part="docheader">
       <div class="docheader-bar docheader-bar-navigation" part="docheader-navigation">
         <slot name="docheader"></slot>
       </div>
       <div class="docheader-bar docheader-bar-buttons" part="docheader-buttons">
         <div class="docheader-bar-buttons-column-left" part="docheader-buttons-left">
           <slot name="docheader-button-left"></slot>
         </div>
         <div class="docheader-bar-buttons-column-right" part="docheader-buttons-right">
           <slot name="docheader-button-right"></slot>
         </div>
       </div>
     </div>
     <div class="body" part="body">
       <slot></slot>
     </div>
    `}onScroll(e){const t="scrollingElement"in e.target?e.target.scrollingElement:e.target;this.currentPosition=t.scrollTop,this.currentPosition>this.lastPosition?"down"!==this.direction&&(this.direction="down",this.changedPosition=this.currentPosition):this.currentPosition<this.lastPosition&&"up"!==this.direction&&(this.direction="up",this.changedPosition=this.currentPosition),"up"===this.direction&&this.changedPosition-this.reactionRange<this.currentPosition&&(this.folded=!1),"down"===this.direction&&this.changedPosition+this.reactionRange<this.currentPosition&&(this.folded=!0),this.lastPosition=this.currentPosition}};ModuleElement.styles=css`
    * {
      box-sizing: border-box;
    }
    :host {
      display: flex;
      flex-direction: column;
      position: relative;
      flex: 1 0 auto;
      background-color: var(--module-bg);
      color: var(--module-color);
    }
    .docheader {
      position: sticky;
      top: 0;
      inset-inline-start: 0;
      width: 100%;
      display: flex;
      flex-direction: column;
      min-height: var(--module-docheader-height);
      z-index: var(--module-docheader-zindex);
      background-color: var(--module-docheader-bg);
      border-bottom: 1px solid var(--module-docheader-border);
      padding: var(--module-docheader-padding);
      gap: var(--module-docheader-spacing);
      box-sizing: border-box;
      transition: top .3s ease-in-out;
    }
    .docheader-folded {
      top: var(--module-docheader-scroll-offset);
    }
    .docheader-bar {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: baseline;
      gap: var(--module-docheader-spacing);
    }
    .docheader-bar > *:empty {
      //display: none;
    }
    .docheader-bar-navigation {
      //min-height: 30px;
      min-height: var(--module-docheader-bar-height);
    }
    .docheader-bar-navigation > ::slotted(*) {
      //margin-bottom: 4px;
    }
    .docheader-bar-buttons > * {
      gap: var(--module-docheader-spacing);
      min-height: var(--module-docheader-bar-height);
      line-height: var(--module-docheader-bar-height);
    }
    .docheader-bar-buttons-column-left,
    .docheader-bar-buttons-column-right {
      display: flex;
      flex-direction: row;
    }
    .body {
      padding: var(--module-body-padding, 24px);
      flex: 1 0 auto;
      display: flex;
      flex-direction: column;
      align-items: start;
    }
    .body ::slotted(>:last-child) {
      margin-bottom: 0 !important;
    }
  `,__decorate([state()],ModuleElement.prototype,"folded",void 0),ModuleElement=__decorate([customElement("typo3-backend-module")],ModuleElement);export{ModuleElement};