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
var t=function(t,r,e,i){var o,a=arguments.length,s=a<3?r:null===i?i=Object.getOwnPropertyDescriptor(r,e):i
if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(t,r,e,i)
else for(var l=t.length-1;l>=0;l--)(o=t[l])&&(s=(a<3?o(s):a>3?o(r,e,s):o(r,e))||s)
return a>3&&s&&Object.defineProperty(r,e,s),s}
import{LitElement as r,html as e}from"lit"
import{customElement as i,property as o}from"lit/decorators.js"
let a=class extends r{constructor(){super(...arguments),this.wrapId=null,this.values=null}createRenderRoot(){return this}render(){return e`<div class="form-multigroup-wrap"><div class="form-multigroup-item"><div class="input-group"><input id="${this.wrapId}_wrap_start" class="form-control t3js-emconf-wrapfield" data-target="#${this.wrapId}" value="${this.values[0].trim()}"></div></div><div class="form-multigroup-item"><div class="input-group"><input id="${this.wrapId}_wrap_end" class="form-control t3js-emconf-wrapfield" data-target="#${this.wrapId}" value="${this.values[0].trim()}"></div></div></div>`}}
t([o({type:String})],a.prototype,"wrapId",void 0),t([o({type:Array})],a.prototype,"values",void 0),a=t([i("typo3-install-wrap-group")],a)
