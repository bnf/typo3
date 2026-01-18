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
import f from"@typo3/install/renderable/severity.js";import{property as p,customElement as d}from"lit/decorators.js";import{LitElement as u,nothing as v,html as m}from"lit";var l=function(c,e,n,o){var i=arguments.length,t=i<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,n):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")t=Reflect.decorate(c,e,n,o);else for(var a=c.length-1;a>=0;a--)(s=c[a])&&(t=(i<3?s(t):i>3?s(e,n,t):s(e,n))||t);return i>3&&t&&Object.defineProperty(e,n,t),t};let r=class extends u{severity;subject;content;static create(e,n,o=""){const s=(window.location!==window.parent.location?window.parent.document:document).createElement("typo3-install-flashmessage");return s.severity=e,s.subject=n,o&&(s.content=o),s}createRenderRoot(){return this}render(){let e=v;return this.content&&(e=m`<p class=alert-message>${this.content}</p>`),m`<div class="t3js-message alert alert-${f.getCssClass(this.severity)}"><div class=alert-title>${this.subject}</div>${e}</div>`}};l([p({type:Number})],r.prototype,"severity",void 0),l([p({type:String})],r.prototype,"subject",void 0),l([p({type:String})],r.prototype,"content",void 0),r=l([d("typo3-install-flashmessage")],r);export{r as FlashMessage};
