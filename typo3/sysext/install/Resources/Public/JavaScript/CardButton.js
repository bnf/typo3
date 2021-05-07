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
var __decorate=this&&this.__decorate||function(t,e,r,i){var o,n=arguments.length,a=n<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,r,i);else for(var l=t.length-1;l>=0;l--)(o=t[l])&&(a=(n<3?o(a):n>3?o(e,r,a):o(e,r))||a);return n>3&&a&&Object.defineProperty(e,r,a),a},__importDefault=this&&this.__importDefault||function(t){return t&&t.__esModule?t:{default:t}};define(["require","exports","lit","lit/decorators","TYPO3/CMS/Backend/Modal","jquery","TYPO3/CMS/Backend/Element/SpinnerElement"],(function(t,e,r,i,o,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.CardButton=void 0,n=__importDefault(n);let a=class extends r.LitElement{constructor(){super(...arguments),this.isInline=!1,this.variant="default",this.modalSize=o.sizes.large}createRenderRoot(){return this}render(){return r.html`
      <button type="button" class="btn btn-${this.variant}" @click="${t=>this.onClick(t)}">${this.label}</button>
    `}onClick(e){if(e.preventDefault(),e.stopPropagation(),this.isInline)t([this.requireModule],t=>{t.initialize(n.default(e.currentTarget))});else{o.advanced({type:o.types.default,title:this.modalTitle,size:this.modalSize,content:n.default('<div class="modal-loading"><typo3-backend-spinner></typo3-backend-spinner></div>'),additionalCssClasses:["install-tool-modal"],callback:e=>{t([this.requireModule],t=>{t.initialize(e)})}})}}};__decorate([i.property({type:String,attribute:"require"})],a.prototype,"requireModule",void 0),__decorate([i.property({type:String})],a.prototype,"label",void 0),__decorate([i.property({type:Boolean,attribute:"inline"})],a.prototype,"isInline",void 0),__decorate([i.property({type:String})],a.prototype,"variant",void 0),__decorate([i.property({type:String,attribute:"modal-size"})],a.prototype,"modalSize",void 0),__decorate([i.property({type:String,attribute:"modal-title"})],a.prototype,"modalTitle",void 0),a=__decorate([i.customElement("typo3-install-card-button")],a),e.CardButton=a}));