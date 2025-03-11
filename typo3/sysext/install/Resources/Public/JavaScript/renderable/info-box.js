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
var t=function(t,e,o,n){var r,i=arguments.length,c=i<3?e:null===n?n=Object.getOwnPropertyDescriptor(e,o):n
if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)c=Reflect.decorate(t,e,o,n)
else for(var l=t.length-1;l>=0;l--)(r=t[l])&&(c=(i<3?r(c):i>3?r(e,o,c):r(e,o))||c)
return i>3&&c&&Object.defineProperty(e,o,c),c}
import e from"@typo3/install/renderable/severity.js"
import{customElement as o,property as n}from"lit/decorators.js"
import{html as r,LitElement as i,nothing as c}from"lit"
let l=class extends i{static create(t,e,content=""){const o=(window.location!==window.parent.location?window.parent.document:document).createElement("typo3-install-infobox")
return o.severity=t,o.subject=e,content&&(o.content=content),o}createRenderRoot(){return this}render(){let t=c
return this.content&&(t=r`<div class="callout-body">${this.content}</div>`),r`<div class="t3js-infobox callout callout-sm callout-${e.getCssClass(this.severity)}"><div class="callout-content"><div class="callout-title">${this.subject}</div>${t}</div></div>`}}
t([n({type:Number})],l.prototype,"severity",void 0),t([n({type:String})],l.prototype,"subject",void 0),t([n({type:String})],l.prototype,"content",void 0),l=t([o("typo3-install-infobox")],l)
export{l as InfoBox}
