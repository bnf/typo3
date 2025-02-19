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
var t=function(t,e,r,i){var o,s=arguments.length,n=s<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(t,e,r,i);else for(var a=t.length-1;a>=0;a--)(o=t[a])&&(n=(s<3?o(n):s>3?o(e,r,n):o(e,r))||n);return s>3&&n&&Object.defineProperty(e,r,n),n};import{customElement as e,property as r}from"lit/decorators.js";import{html as i,css as o,LitElement as s}from"lit";import n from"@typo3/backend/modal.js";import{SeverityEnum as a}from"@typo3/backend/enum/severity.js";import{KeyTypesEnum as c}from"@typo3/backend/enum/key-types.js";let d=class extends s{static{this.styles=[o`:host{cursor:pointer;appearance:button}`]}connectedCallback(){super.connectedCallback(),this.hasAttribute("role")||this.setAttribute("role","button"),this.hasAttribute("tabindex")||this.setAttribute("tabindex","0"),this.addEventListener("click",this.triggerWizard),this.addEventListener("keydown",this.triggerWizard)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("click",this.triggerWizard),this.removeEventListener("keydown",this.triggerWizard)}render(){return i`<slot></slot>`}triggerWizard(t){t instanceof KeyboardEvent&&t.key!==c.ENTER&&t.key!==c.SPACE||t.preventDefault(),this.renderWizard()}renderWizard(){this.url&&n.advanced({content:this.url,title:this.subject,severity:a.notice,size:n.sizes.large,type:n.types.iframe})}};t([r({type:String})],d.prototype,"url",void 0),t([r({type:String})],d.prototype,"subject",void 0),d=t([e("typo3-backend-dispatch-modal-button")],d);export{d as DispatchModalButton};