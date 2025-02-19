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
import{property as t,customElement as e}from"lit/decorators.js";import{LitElement as r,css as i,html as o}from"lit";import s from"@typo3/backend/modal.js";import{SeverityEnum as n}from"@typo3/backend/enum/severity.js";import{KeyTypesEnum as a}from"@typo3/backend/enum/key-types.js";var c=function(t,e,r,i){var o,s=arguments.length,n=s<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(t,e,r,i);else for(var a=t.length-1;a>=0;a--)(o=t[a])&&(n=(s<3?o(n):s>3?o(e,r,n):o(e,r))||n);return s>3&&n&&Object.defineProperty(e,r,n),n};let d=class extends r{static{this.styles=[i`:host{cursor:pointer;appearance:button}`]}connectedCallback(){super.connectedCallback(),this.hasAttribute("role")||this.setAttribute("role","button"),this.hasAttribute("tabindex")||this.setAttribute("tabindex","0"),this.addEventListener("click",this.triggerWizard),this.addEventListener("keydown",this.triggerWizard)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("click",this.triggerWizard),this.removeEventListener("keydown",this.triggerWizard)}render(){return o`<slot></slot>`}triggerWizard(t){t instanceof KeyboardEvent&&t.key!==a.ENTER&&t.key!==a.SPACE||t.preventDefault(),this.renderWizard()}renderWizard(){this.url&&s.advanced({content:this.url,title:this.subject,severity:n.notice,size:s.sizes.large,type:s.types.iframe})}};c([t({type:String})],d.prototype,"url",void 0),c([t({type:String})],d.prototype,"subject",void 0),d=c([e("typo3-backend-dispatch-modal-button")],d);export{d as DispatchModalButton};