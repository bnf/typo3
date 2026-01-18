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
import{property as d,customElement as c}from"lit/decorators.js";import{LitElement as f,html as m}from"lit";var a=function(l,e,o,n){var r=arguments.length,t=r<3?e:n===null?n=Object.getOwnPropertyDescriptor(e,o):n,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")t=Reflect.decorate(l,e,o,n);else for(var p=l.length-1;p>=0;p--)(s=l[p])&&(t=(r<3?s(t):r>3?s(e,o,t):s(e,o))||t);return r>3&&t&&Object.defineProperty(e,o,t),t};let i=class extends f{placeholder;allowedExtensionsHelpText;allowedExtensions;createRenderRoot(){return this}render(){return m`<form @submit=${this.dispatchSubmitEvent}><div class=form-control-wrap><input type=text class=form-control name=online-media-url placeholder=${this.placeholder} required><div class=form-text>${this.allowedExtensionsHelpText}<br><ul class=badge-list>${this.allowedExtensions.split(",").map(e=>m`<li><span class="badge badge-success">${e.trim().toUpperCase()}</span></li>`)}</ul></div></div></form>`}dispatchSubmitEvent(e){e.preventDefault();const o=new FormData(e.target),n=Object.fromEntries(o);this.dispatchEvent(new CustomEvent("typo3:formengine:online-media-added",{detail:n}))}};a([d({type:String})],i.prototype,"placeholder",void 0),a([d({type:String,attribute:"help-text"})],i.prototype,"allowedExtensionsHelpText",void 0),a([d({type:String,attribute:"extensions"})],i.prototype,"allowedExtensions",void 0),i=a([c("typo3-backend-formengine-online-media-form")],i);export{i as OnlineMediaFormElement};
