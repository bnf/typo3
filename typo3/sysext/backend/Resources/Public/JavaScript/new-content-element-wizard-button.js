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
import{property as t,customElement as e}from"lit/decorators.js";import{LitElement as r,css as o,html as i}from"lit";import n from"@typo3/backend/modal.js";import{SeverityEnum as s}from"@typo3/backend/enum/severity.js";import"@typo3/backend/new-record-wizard.js";var a=function(t,e,r,o){var i,n=arguments.length,s=n<3?e:null===o?o=Object.getOwnPropertyDescriptor(e,r):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(t,e,r,o);else for(var a=t.length-1;a>=0;a--)(i=t[a])&&(s=(n<3?i(s):n>3?i(e,r,s):i(e,r))||s);return n>3&&s&&Object.defineProperty(e,r,s),s};let c=class extends r{static{this.styles=[o`:host{cursor:pointer;appearance:button}`]}constructor(){super(),this.addEventListener("click",(t=>{t.preventDefault(),this.renderWizard()})),this.addEventListener("keydown",(t=>{"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this.renderWizard())}))}connectedCallback(){this.hasAttribute("role")||this.setAttribute("role","button"),this.hasAttribute("tabindex")||this.setAttribute("tabindex","0")}render(){return i`<slot></slot>`}renderWizard(){this.url&&n.advanced({content:this.url,title:this.subject,severity:s.notice,size:n.sizes.large,type:n.types.ajax})}};a([t({type:String})],c.prototype,"url",void 0),a([t({type:String})],c.prototype,"subject",void 0),c=a([e("typo3-backend-new-content-element-wizard-button")],c);export{c as NewContentElementWizardButton};