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
import{LitElement as t,html as e}from"lit";import{property as o,customElement as r}from"lit/decorators.js";var s=function(t,e,o,r){var s,i=arguments.length,f=i<3?e:null===r?r=Object.getOwnPropertyDescriptor(e,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)f=Reflect.decorate(t,e,o,r);else for(var l=t.length-1;l>=0;l--)(s=t[l])&&(f=(i<3?s(f):i>3?s(e,o,f):s(e,o))||f);return i>3&&f&&Object.defineProperty(e,o,f),f};let i=class extends t{constructor(){super(...arguments),this.offsetId=null,this.values=null}createRenderRoot(){return this}render(){return e`<div class=form-multigroup-wrap><div class=form-multigroup-item><div class=input-group><div class=input-group-text>x</div><input id=${this.offsetId}_offset_x class="form-control t3js-emconf-offsetfield" data-target=#${this.offsetId} value=${this.values[0]?.trim()}></div></div><div class=form-multigroup-item><div class=input-group><div class=input-group-text>y</div><input id=${this.offsetId}_offset_y class="form-control t3js-emconf-offsetfield" data-target=#${this.offsetId} value=${this.values[1]?.trim()}></div></div></div>`}};s([o({type:String})],i.prototype,"offsetId",void 0),s([o({type:Array})],i.prototype,"values",void 0),i=s([r("typo3-install-offset-group")],i);