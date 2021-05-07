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
var __decorate=function(t,e,o,r){var i,a=arguments.length,n=a<3?e:null===r?r=Object.getOwnPropertyDescriptor(e,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(t,e,o,r);else for(var l=t.length-1;l>=0;l--)(i=t[l])&&(n=(a<3?i(n):a>3?i(e,o,n):i(e,o))||n);return a>3&&n&&Object.defineProperty(e,o,n),n};import{html,LitElement}from"lit";import{customElement,property}from"lit/decorators.js";import Modal from"@typo3/backend/modal.js";import $ from"jquery";import"@typo3/backend/element/spinner-element.js";let CardButton=class extends LitElement{constructor(){super(...arguments),this.isInline=!1,this.variant="default",this.modalSize=Modal.sizes.large}createRenderRoot(){return this}render(){return html`
      <button type="button" class="btn btn-${this.variant}" @click="${t=>this.onClick(t)}">${this.label}</button>
    `}onClick(t){if(t.preventDefault(),t.stopPropagation(),this.isInline)require([this.requireModule],(e=>{e.initialize($(t.currentTarget))}));else{Modal.advanced({type:Modal.types.default,title:this.modalTitle,size:this.modalSize,content:$('<div class="modal-loading"><typo3-backend-spinner></typo3-backend-spinner></div>'),additionalCssClasses:["install-tool-modal"],callback:t=>{require([this.requireModule],(e=>{e.initialize(t)}))}})}}};__decorate([property({type:String,attribute:"module"})],CardButton.prototype,"requireModule",void 0),__decorate([property({type:String})],CardButton.prototype,"label",void 0),__decorate([property({type:Boolean,attribute:"inline"})],CardButton.prototype,"isInline",void 0),__decorate([property({type:String})],CardButton.prototype,"variant",void 0),__decorate([property({type:String,attribute:"modal-size"})],CardButton.prototype,"modalSize",void 0),__decorate([property({type:String,attribute:"modal-title"})],CardButton.prototype,"modalTitle",void 0),CardButton=__decorate([customElement("typo3-install-card-button")],CardButton);export{CardButton};