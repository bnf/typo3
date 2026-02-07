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
<<<<<<< HEAD
import{LitElement as p,css as c,html as g}from"lit";import{property as m,customElement as f}from"lit/decorators.js";import{SwaggerUIBundle as u}from"swagger-ui-dist";var d=function(o,e,r,n){var s=arguments.length,t=s<3?e:n===null?n=Object.getOwnPropertyDescriptor(e,r):n,i;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")t=Reflect.decorate(o,e,r,n);else for(var l=o.length-1;l>=0;l--)(i=o[l])&&(t=(s<3?i(t):s>3?i(e,r,t):i(e,r))||t);return s>3&&t&&Object.defineProperty(e,r,t),t};let a=class extends p{static{this.styles=c`@media (prefers-color-scheme:dark){.swagger-ui{filter:invert(88%) hue-rotate(180deg)}.swagger-ui .microlight{filter:invert(100%) hue-rotate(180deg)}}.swagger-ui button.json-schema-2020-12-accordion,.swagger-ui button.json-schema-2020-12-expand-deep-button{background:none}`}firstUpdated(){u({url:this.url,requestInterceptor:e=>({...e,headers:{...e.headers??{},Authorization:"Bearer "+top.document.body.dataset.apiToken}}),showMutatedRequest:!1,domNode:this.renderRoot.firstElementChild,presets:[u.presets.apis],plugins:[u.plugins.DownloadUrl],layout:"BaseLayout"})}render(){return g`<div></div><link rel=stylesheet href=${import.meta.url.replace("JavaScript/element/swagger-element.js","Css/Contrib/swagger-ui.css")} media=all nonce=${window.litNonce}>`}};d([m({type:String})],a.prototype,"url",void 0),a=d([f("typo3-backend-swagger")],a);export{a as SwaggerElement};
=======
import{LitElement as c,css as p,html as m}from"lit";import{property as g,customElement as f}from"lit/decorators.js";import{SwaggerUIBundle as d}from"swagger-ui-dist";var u=function(o,t,r,i){var n=arguments.length,e=n<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,r):i,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")e=Reflect.decorate(o,t,r,i);else for(var s=o.length-1;s>=0;s--)(a=o[s])&&(e=(n<3?a(e):n>3?a(t,r,e):a(t,r))||e);return n>3&&e&&Object.defineProperty(t,r,e),e};let l=class extends c{static{this.styles=p`@media (prefers-color-scheme:dark){.swagger-ui{filter:invert(88%) hue-rotate(180deg)}.swagger-ui .microlight{filter:invert(100%) hue-rotate(180deg)}}.swagger-ui button.json-schema-2020-12-accordion,.swagger-ui button.json-schema-2020-12-expand-deep-button{background:none}`}firstUpdated(){d({url:this.url,domNode:this.renderRoot.firstElementChild,oauth2RedirectUrl:"TODO",presets:[d.presets.apis],plugins:[d.plugins.DownloadUrl],layout:"BaseLayout"}).initOAuth({clientId:"d099d1dd-11f2-4914-aa94-df0b1dbe1dc8",clientSecret:"",realm:"realm",appName:"app",scopeSeparator:" ",additionalQueryStringParams:{},usePkceWithAuthorizationCodeGrant:!0})}render(){return m`<div></div><link rel=stylesheet href=${import.meta.url.replace("JavaScript/element/swagger-element.js","Css/Contrib/swagger-ui.css")} media=all nonce=${window.litNonce}>`}};u([g({type:String})],l.prototype,"url",void 0),l=u([f("typo3-backend-swagger")],l);export{l as SwaggerElement};
>>>>>>> 16b9c503858 ([TMP] swagger oauth config)
