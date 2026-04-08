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
import{LitElement as d,css as c,html as m}from"lit";import{property as g,customElement as f}from"lit/decorators.js";import{topDocument as h}from"@typo3/core/utility/top-window.js";import{SwaggerUIBundle as u}from"swagger-ui-dist";var p=function(o,e,r,n){var s=arguments.length,t=s<3?e:n===null?n=Object.getOwnPropertyDescriptor(e,r):n,i;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")t=Reflect.decorate(o,e,r,n);else for(var l=o.length-1;l>=0;l--)(i=o[l])&&(t=(s<3?i(t):s>3?i(e,r,t):i(e,r))||t);return s>3&&t&&Object.defineProperty(e,r,t),t};let a=class extends d{static{this.styles=c`@media (prefers-color-scheme:dark){.swagger-ui{filter:invert(88%) hue-rotate(180deg)}.swagger-ui .microlight{filter:invert(100%) hue-rotate(180deg)}}.swagger-ui button.json-schema-2020-12-accordion,.swagger-ui button.json-schema-2020-12-expand-deep-button{background:none}`}firstUpdated(){u({url:this.url,requestInterceptor:e=>({...e,headers:{...e.headers??{},Authorization:"Bearer "+h.body.dataset.apiToken}}),showMutatedRequest:!1,domNode:this.renderRoot.firstElementChild,presets:[u.presets.apis],plugins:[u.plugins.DownloadUrl],layout:"BaseLayout"})}render(){return m`<div></div><link rel=stylesheet href=${import.meta.url.replace("JavaScript/element/swagger-element.js","Css/Contrib/swagger-ui.css")} media=all nonce=${window.litNonce}>`}};p([g({type:String})],a.prototype,"url",void 0),a=p([f("typo3-backend-swagger")],a);export{a as SwaggerElement};
