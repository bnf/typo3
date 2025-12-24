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
import{property as f,customElement as l}from"lit/decorators.js";import{PseudoButtonLitElement as u}from"@typo3/backend/element/pseudo-button.js";import m from"@typo3/core/ajax/ajax-request.js";import d from"@typo3/backend/notification.js";var c=function(n,t,o,r){var p=arguments.length,e=p<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,o):r,i;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")e=Reflect.decorate(n,t,o,r);else for(var s=n.length-1;s>=0;s--)(i=n[s])&&(e=(p<3?i(e):p>3?i(t,o,e):i(t,o))||e);return p>3&&e&&Object.defineProperty(t,o,e),e};let a=class extends u{async buttonActivated(){const o=await(await new m(TYPO3.settings.ajaxUrls.token_generate).post(JSON.stringify({appIdentifier:this.app}),{headers:{"Content-Type":"application/json"}})).resolve();d.success("Token generated",o.token)}};c([f({type:String})],a.prototype,"app",void 0),a=c([l("typo3-hub-generate-token-button")],a);export{a as GenerateTokenButton};
