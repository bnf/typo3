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
var e=function(e,t,o,r){var i,n=arguments.length,l=n<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)l=Reflect.decorate(e,t,o,r);else for(var s=e.length-1;s>=0;s--)(i=e[s])&&(l=(n<3?i(l):n>3?i(t,o,l):i(t,o))||l);return n>3&&l&&Object.defineProperty(t,o,l),l};import{customElement as t,property as o}from"lit/decorators.js";import{LitElement as r,html as i}from"lit";let n=class extends r{createRenderRoot(){return this}render(){return i`<form @submit="${this.dispatchSubmitEvent}"><div class="form-control-wrap"><input type="text" class="form-control" name="online-media-url" placeholder="${this.placeholder}" required><div class="form-text">${this.allowedExtensionsHelpText}<br><ul class="badge-list">${this.allowedExtensions.split(",").map((e=>i`<li><span class="badge badge-success">${e.trim().toUpperCase()}</span></li>`))}</ul></div></div></form>`}dispatchSubmitEvent(e){e.preventDefault();const t=new FormData(e.target),o=Object.fromEntries(t);this.dispatchEvent(new CustomEvent("typo3:formengine:online-media-added",{detail:o}))}};e([o({type:String})],n.prototype,"placeholder",void 0),e([o({type:String,attribute:"help-text"})],n.prototype,"allowedExtensionsHelpText",void 0),e([o({type:String,attribute:"extensions"})],n.prototype,"allowedExtensions",void 0),n=e([t("typo3-backend-formengine-online-media-form")],n);export{n as OnlineMediaFormElement};