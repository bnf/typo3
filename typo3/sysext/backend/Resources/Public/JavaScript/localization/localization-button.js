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
import{html as m}from"lit";import{PseudoButtonLitElement as f}from"@typo3/backend/element/pseudo-button.js";import{property as p,customElement as y}from"lit/decorators.js";import{SeverityEnum as g}from"@typo3/backend/enum/severity.js";import{lll as b}from"@typo3/core/lit-helper.js";import u from"@typo3/backend/modal.js";var d=function(i,t,r,a){var n=arguments.length,e=n<3?t:a===null?a=Object.getOwnPropertyDescriptor(t,r):a,c;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")e=Reflect.decorate(i,t,r,a);else for(var l=i.length-1;l>=0;l--)(c=i[l])&&(e=(n<3?c(e):n>3?c(t,r,e):c(t,r))||e);return n>3&&e&&Object.defineProperty(t,r,e),e};let o=class extends f{recordType;recordUid;targetLanguage;buttonActivated(){const t=m`<typo3-backend-localization-wizard record-type=${this.recordType} record-uid=${this.recordUid} target-language=${this.targetLanguage}></typo3-backend-localization-wizard>`;u.advanced({title:b("localization_wizard.modal.title"),content:t,severity:g.notice,size:u.sizes.medium,staticBackdrop:!0,buttons:[]})}};d([p({type:String,attribute:"record-type"})],o.prototype,"recordType",void 0),d([p({type:Number,attribute:"record-uid"})],o.prototype,"recordUid",void 0),d([p({type:Number,attribute:"target-language"})],o.prototype,"targetLanguage",void 0),o=d([y("typo3-backend-localization-button")],o);export{o as LocalizationButton};
