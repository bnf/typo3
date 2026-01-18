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
import{property as f,customElement as a}from"lit/decorators.js";import{PseudoButtonLitElement as d}from"@typo3/backend/element/pseudo-button.js";import c from"@typo3/backend/modal.js";import{SeverityEnum as m}from"@typo3/backend/enum/severity.js";import"@typo3/backend/new-record-wizard.js";var s=function(i,e,r,n){var u=arguments.length,t=u<3?e:n===null?n=Object.getOwnPropertyDescriptor(e,r):n,l;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")t=Reflect.decorate(i,e,r,n);else for(var p=i.length-1;p>=0;p--)(l=i[p])&&(t=(u<3?l(t):u>3?l(e,r,t):l(e,r))||t);return u>3&&t&&Object.defineProperty(e,r,t),t};let o=class extends d{url;subject;buttonActivated(){this.url&&c.advanced({content:this.url,title:this.subject,severity:m.notice,size:c.sizes.large,type:c.types.ajax})}};s([f({type:String})],o.prototype,"url",void 0),s([f({type:String})],o.prototype,"subject",void 0),o=s([a("typo3-scheduler-new-task-wizard-button")],o);export{o as NewSchedulerTaskWizardButton};
