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
var __decorate=this&&this.__decorate||function(t,e,i,o){var r,n=arguments.length,a=n<3?e:null===o?o=Object.getOwnPropertyDescriptor(e,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,i,o);else for(var l=t.length-1;l>=0;l--)(r=t[l])&&(a=(n<3?r(a):n>3?r(e,i,a):r(e,i))||a);return n>3&&a&&Object.defineProperty(e,i,a),a},__importDefault=this&&this.__importDefault||function(t){return t&&t.__esModule?t:{default:t}};define(["require","exports","lit","lit/decorators","TYPO3/CMS/Backend/Modal","jquery","TYPO3/CMS/Backend/Element/SpinnerElement"],(function(t,e,i,o,r,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.CardButton=void 0,n=__importDefault(n);let a=class extends i.LitElement{constructor(){super(...arguments),this.isInline=!1,this.variant="default",this.modalSize=r.sizes.large}createRenderRoot(){return this}render(){return i.html`
      <button type="button" class="btn btn-${this.variant}" @click="${t=>this.onClick(t)}">${this.label}</button>
    `}onClick(e){if(e.preventDefault(),e.stopPropagation(),this.isInline)t([this.requireModule],t=>{t.initialize(n.default(e.currentTarget))});else{r.advanced({type:r.types.default,title:this.modalTitle,size:this.modalSize,content:n.default('<div class="modal-loading"><typo3-backend-spinner></typo3-backend-spinner></div>'),additionalCssClasses:["install-tool-modal"],callback:e=>{t([this.requireModule],t=>{t.initialize(e)})}})}}};__decorate([o.property({type:String,attribute:"module"})],a.prototype,"requireModule",void 0),__decorate([o.property({type:String})],a.prototype,"label",void 0),__decorate([o.property({type:Boolean,attribute:"inline"})],a.prototype,"isInline",void 0),__decorate([o.property({type:String})],a.prototype,"variant",void 0),__decorate([o.property({type:String,attribute:"modal-size"})],a.prototype,"modalSize",void 0),__decorate([o.property({type:String,attribute:"modal-title"})],a.prototype,"modalTitle",void 0),a=__decorate([o.customElement("typo3-install-card-button")],a),e.CardButton=a}));