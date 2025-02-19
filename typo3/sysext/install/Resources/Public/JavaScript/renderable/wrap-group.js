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
import{LitElement as t,html as r}from"lit";import{property as e,customElement as i}from"lit/decorators.js";var o=function(t,r,e,i){var o,a=arguments.length,s=a<3?r:null===i?i=Object.getOwnPropertyDescriptor(r,e):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(t,r,e,i);else for(var l=t.length-1;l>=0;l--)(o=t[l])&&(s=(a<3?o(s):a>3?o(r,e,s):o(r,e))||s);return a>3&&s&&Object.defineProperty(r,e,s),s};let a=class extends t{constructor(){super(...arguments),this.wrapId=null,this.values=null}createRenderRoot(){return this}render(){return r`<div class=form-multigroup-wrap><div class=form-multigroup-item><div class=input-group><input id=${this.wrapId}_wrap_start class="form-control t3js-emconf-wrapfield" data-target=#${this.wrapId} value=${this.values[0].trim()}></div></div><div class=form-multigroup-item><div class=input-group><input id=${this.wrapId}_wrap_end class="form-control t3js-emconf-wrapfield" data-target=#${this.wrapId} value=${this.values[0].trim()}></div></div></div>`}};o([e({type:String})],a.prototype,"wrapId",void 0),o([e({type:Array})],a.prototype,"values",void 0),a=o([i("typo3-install-wrap-group")],a);