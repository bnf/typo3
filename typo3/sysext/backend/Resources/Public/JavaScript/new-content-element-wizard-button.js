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
var t=function(t,e,r,o){var n,i=arguments.length,s=i<3?e:null===o?o=Object.getOwnPropertyDescriptor(e,r):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(t,e,r,o);else for(var a=t.length-1;a>=0;a--)(n=t[a])&&(s=(i<3?n(s):i>3?n(e,r,s):n(e,r))||s);return i>3&&s&&Object.defineProperty(e,r,s),s};import{customElement as e,property as r}from"lit/decorators.js";import{html as o,css as n,LitElement as i}from"lit";import s from"@typo3/backend/modal.js";import{SeverityEnum as a}from"@typo3/backend/enum/severity.js";import"@typo3/backend/new-record-wizard.js";let c=class extends i{static{this.styles=[n`:host{-webkit-appearance:button;-moz-appearance:button;appearance:button;cursor:pointer}`]}constructor(){super(),this.addEventListener("click",(t=>{t.preventDefault(),this.renderWizard()})),this.addEventListener("keydown",(t=>{"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this.renderWizard())}))}connectedCallback(){this.hasAttribute("role")||this.setAttribute("role","button"),this.hasAttribute("tabindex")||this.setAttribute("tabindex","0")}render(){return o`<slot></slot>`}renderWizard(){this.url&&s.advanced({content:this.url,title:this.subject,severity:a.notice,size:s.sizes.large,type:s.types.ajax})}};t([r({type:String})],c.prototype,"url",void 0),t([r({type:String})],c.prototype,"subject",void 0),c=t([e("typo3-backend-new-content-element-wizard-button")],c);export{c as NewContentElementWizardButton};