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
var t=function(t,e,o,r){var n,i=arguments.length,l=i<3?e:null===r?r=Object.getOwnPropertyDescriptor(e,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)l=Reflect.decorate(t,e,o,r);else for(var c=t.length-1;c>=0;c--)(n=t[c])&&(l=(i<3?n(l):i>3?n(e,o,l):n(e,o))||l);return i>3&&l&&Object.defineProperty(e,o,l),l};import e from"@typo3/install/renderable/severity.js";import{customElement as o,property as r}from"lit/decorators.js";import{html as n,LitElement as i,nothing as l}from"lit";let c=class extends i{static create(t,e,o=""){const r=(window.location!==window.parent.location?window.parent.document:document).createElement("typo3-install-infobox");return r.severity=t,r.subject=e,o&&(r.content=o),r}createRenderRoot(){return this}render(){let t=l;return this.content&&(t=n`<div class="callout-body">${this.content}</div>`),n`<div class="callout callout-${e.getCssClass(this.severity)} callout-sm t3js-infobox"> <div class="callout-content"> <div class="callout-title">${this.subject}</div> ${t} </div> </div>`}};t([r({type:Number})],c.prototype,"severity",void 0),t([r({type:String})],c.prototype,"subject",void 0),t([r({type:String})],c.prototype,"content",void 0),c=t([o("typo3-install-infobox")],c);export{c as InfoBox};