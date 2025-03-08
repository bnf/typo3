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
var t=function(t,e,o,i){var a,l=arguments.length,r=l<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,o):i
if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(t,e,o,i)
else for(var n=t.length-1;n>=0;n--)(a=t[n])&&(r=(l<3?a(r):l>3?a(e,o,r):a(e,o))||r)
return l>3&&r&&Object.defineProperty(e,o,r),r}
import{html as e}from"lit"
import{customElement as o,property as i}from"lit/decorators.js"
import{BaseElement as a}from"@typo3/backend/settings/type/base.js"
import{live as l}from"lit/directives/live.js"
export const componentName="typo3-backend-settings-type-stringlist"
let r=class extends a{updateValue(t,e){const o=[...this.value]
o[e]=t,this.value=o}addValue(t,e=""){this.value=this.value.toSpliced(t+1,0,e)}removeValue(t){this.value=this.value.toSpliced(t,1)}renderItem(t,o){return e`<tr><td width="99%"><input id="${`${this.formid}${o>0?"-"+o:""}`}" type="text" class="form-control" ?readonly="${this.readonly}" .value="${l(t)}" @change="${t=>this.updateValue(t.target.value,o)}"></td><td><div class="btn-group" role="group"><button class="btn btn-default" type="button" ?disabled="${this.readonly}" @click="${()=>this.addValue(o)}"><typo3-backend-icon identifier="actions-plus" size="small"></typo3-backend-icon></button> <button class="btn btn-default" type="button" ?disabled="${this.readonly}" @click="${()=>this.removeValue(o)}"><typo3-backend-icon identifier="actions-delete" size="small"></typo3-backend-icon></button></div></td></tr>`}render(){const t=this.value||[]
return e`<div class="form-control-wrap"><div class="table-fit"><table class="table table-hover"><tbody>${t.map(((t,e)=>this.renderItem(t,e)))}</tbody></table></div></div>`}}
t([i({type:Array})],r.prototype,"value",void 0),r=t([o(componentName)],r)
export{r as StringlistTypeElement}
