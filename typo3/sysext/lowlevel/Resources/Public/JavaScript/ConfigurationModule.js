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
var __decorate=this&&this.__decorate||function(e,t,o,n){var s,r=arguments.length,c=r<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,o):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)c=Reflect.decorate(e,t,o,n);else for(var a=e.length-1;a>=0;a--)(s=e[a])&&(c=(r<3?s(c):r>3?s(t,o,c):s(t,o))||c);return r>3&&c&&Object.defineProperty(t,o,c),c};define(["require","exports","lit-element","TYPO3/CMS/Backend/BroadcastMessage","TYPO3/CMS/Backend/BroadcastService"],(function(e,t,o,n,s){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.ConfigurationModule=void 0;let r=class extends o.LitElement{static get styles(){return o.css`
      :host {
        display: block;
        height: 100%;
      }
    `}render(){return o.html`
      FOO
    `}firstUpdated(){const e=new CustomEvent("typo3-module-loaded",{detail:{message:"Something important happened"}});this.dispatchEvent(e);const t="/typo3/module/system/config?token=dummy",o=new n.BroadcastMessage("navigation","contentchange",{url:t,module:"system_config"});console.log("sending out an url change "+t),s.post(o,!0)}};r=__decorate([o.customElement("typo3-lowlevel-configuration-module")],r),t.ConfigurationModule=r}));