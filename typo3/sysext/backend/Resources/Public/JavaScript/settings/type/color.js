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
var __decorate=function(e,t,o,r){var l,n=arguments.length,a=n<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,r);else for(var i=e.length-1;i>=0;i--)(l=e[i])&&(a=(n<3?l(a):n>3?l(t,o,a):l(t,o))||a);return n>3&&a&&Object.defineProperty(t,o,a),a};import{html,LitElement}from"lit";import{customElement,property}from"lit/decorators.js";import Alwan from"alwan";let ColorTypeElement=class extends LitElement{constructor(){super(...arguments),this.alwan=null}firstUpdated(){this.alwan=new Alwan(this.querySelector("input"),{position:"bottom-start",format:"hex",opacity:!1,preset:!1,color:this.value}),this.alwan.on("color",(e=>{this.value=e.hex}))}render(){return html`
      <input
        id=${this.key}
        type="string"
        name=${"data["+this.key+"]"}
        .value=${this.value}
        @input=${e=>this.alwan?.setColor(e.target.value)}
        @change=${e=>this.alwan?.setColor(e.target.value)}
      />
    `}};__decorate([property({type:String})],ColorTypeElement.prototype,"key",void 0),__decorate([property({type:String})],ColorTypeElement.prototype,"value",void 0),ColorTypeElement=__decorate([customElement("typo3-backend-settings-type-color")],ColorTypeElement);export{ColorTypeElement};