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
var t=function(t,e,r,o){var s,n=arguments.length,i=n<3?e:null===o?o=Object.getOwnPropertyDescriptor(e,r):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)i=Reflect.decorate(t,e,r,o);else for(var l=t.length-1;l>=0;l--)(s=t[l])&&(i=(n<3?s(i):n>3?s(e,r,i):s(e,r))||i);return n>3&&i&&Object.defineProperty(e,r,i),i};import e from"@typo3/install/renderable/severity.js";import{customElement as r,property as o}from"lit/decorators.js";import{html as s,LitElement as n,nothing as i}from"lit";let l=class extends n{static create(t,e,r=""){const o=(window.location!==window.parent.location?window.parent.document:document).createElement("typo3-install-flashmessage");return o.severity=t,o.subject=e,r&&(o.content=r),o}createRenderRoot(){return this}render(){let t=i;return this.content&&(t=s`<p class="alert-message">${this.content}</p>`),s`<div class="alert alert-${e.getCssClass(this.severity)} t3js-message"> <div class="alert-title">${this.subject}</div> ${t} </div>`}};t([o({type:Number})],l.prototype,"severity",void 0),t([o({type:String})],l.prototype,"subject",void 0),t([o({type:String})],l.prototype,"content",void 0),l=t([r("typo3-install-flashmessage")],l);export{l as FlashMessage};