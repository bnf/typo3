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
var t=function(t,e,r,o){var n,s=arguments.length,i=s<3?e:null===o?o=Object.getOwnPropertyDescriptor(e,r):o
if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)i=Reflect.decorate(t,e,r,o)
else for(var c=t.length-1;c>=0;c--)(n=t[c])&&(i=(s<3?n(i):s>3?n(e,r,i):n(e,r))||i)
return s>3&&i&&Object.defineProperty(e,r,i),i}
import e from"@typo3/install/renderable/severity.js"
import{customElement as r,property as o}from"lit/decorators.js"
import{html as n,LitElement as s,nothing as i}from"lit"
let c=class extends s{static create(t,e,content=""){const r=(window.location!==window.parent.location?window.parent.document:document).createElement("typo3-install-flashmessage")
return r.severity=t,r.subject=e,content&&(r.content=content),r}createRenderRoot(){return this}render(){let t=i
return this.content&&(t=n`<p class="alert-message">${this.content}</p>`),n`<div class="t3js-message alert alert-${e.getCssClass(this.severity)}"><div class="alert-title">${this.subject}</div>${t}</div>`}}
t([o({type:Number})],c.prototype,"severity",void 0),t([o({type:String})],c.prototype,"subject",void 0),t([o({type:String})],c.prototype,"content",void 0),c=t([r("typo3-install-flashmessage")],c)
export{c as FlashMessage}
