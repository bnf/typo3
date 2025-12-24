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
import{property as f,customElement as u}from"lit/decorators.js";import{PseudoButtonLitElement as d}from"@typo3/backend/element/pseudo-button.js";import l from"@typo3/core/ajax/ajax-request.js";import m from"@typo3/backend/notification.js";var c=function(o,e,n,r){var i=arguments.length,t=i<3?e:r===null?r=Object.getOwnPropertyDescriptor(e,n):r,p;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")t=Reflect.decorate(o,e,n,r);else for(var s=o.length-1;s>=0;s--)(p=o[s])&&(t=(i<3?p(t):i>3?p(e,n,t):p(e,n))||t);return i>3&&t&&Object.defineProperty(e,n,t),t};const b={token_generate:"/token/generate"},y=o=>{const{apiPrefix:e}=top.document.body.dataset;if(e===void 0)throw new Error("Missing data-api-prefix attribute on top <body>");return e+b[o]};let a=class extends d{async buttonActivated(){const n=await(await new l(y("token_generate")).post(JSON.stringify({appIdentifier:this.app}),{headers:{"Content-Type":"application/json"}})).resolve();m.success("Token generated",n.token)}};c([f({type:String})],a.prototype,"app",void 0),a=c([u("typo3-hub-generate-token-button")],a);export{a as GenerateTokenButton};
