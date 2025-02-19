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
import{html as t}from"lit";import{property as e,customElement as o}from"lit/decorators.js";import{BaseElement as i}from"@typo3/backend/settings/type/base.js";import{live as l}from"lit/directives/live.js";var a=function(t,e,o,i){var l,a=arguments.length,r=a<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(t,e,o,i);else for(var s=t.length-1;s>=0;s--)(l=t[s])&&(r=(a<3?l(r):a>3?l(e,o,r):l(e,o))||r);return a>3&&r&&Object.defineProperty(e,o,r),r};const r="typo3-backend-settings-type-stringlist";let s=class extends i{updateValue(t,e){const o=[...this.value];o[e]=t,this.value=o}addValue(t,e=""){this.value=this.value.toSpliced(t+1,0,e)}removeValue(t){this.value=this.value.toSpliced(t,1)}renderItem(e,o){return t`<tr><td width=99%><input id=${`${this.formid}${o>0?"-"+o:""}`} type=text class=form-control ?readonly=${this.readonly} .value=${l(e)} @change=${t=>this.updateValue(t.target.value,o)}></td><td><div class=btn-group role=group><button class="btn btn-default" type=button ?disabled=${this.readonly} @click=${()=>this.addValue(o)}><typo3-backend-icon identifier=actions-plus size=small></typo3-backend-icon></button> <button class="btn btn-default" type=button ?disabled=${this.readonly} @click=${()=>this.removeValue(o)}><typo3-backend-icon identifier=actions-delete size=small></typo3-backend-icon></button></div></td></tr>`}render(){const e=this.value||[];return t`<div class=form-control-wrap><div class=table-fit><table class="table table-hover"><tbody>${e.map(((t,e)=>this.renderItem(t,e)))}</tbody></table></div></div>`}};a([e({type:Array})],s.prototype,"value",void 0),s=a([o(r)],s);export{s as StringlistTypeElement,r as componentName};