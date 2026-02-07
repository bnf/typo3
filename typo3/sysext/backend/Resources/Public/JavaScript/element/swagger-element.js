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
import{LitElement as c,css as p,html as m}from"lit";import{property as g,customElement as f}from"lit/decorators.js";import{SwaggerUIBundle as d}from"swagger-ui-dist";var u=function(o,t,r,i){var n=arguments.length,e=n<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,r):i,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")e=Reflect.decorate(o,t,r,i);else for(var s=o.length-1;s>=0;s--)(a=o[s])&&(e=(n<3?a(e):n>3?a(t,r,e):a(t,r))||e);return n>3&&e&&Object.defineProperty(t,r,e),e};let l=class extends c{static{this.styles=p`@media (prefers-color-scheme:dark){.swagger-ui{filter:invert(88%) hue-rotate(180deg)}.swagger-ui .microlight{filter:invert(100%) hue-rotate(180deg)}}.swagger-ui button.json-schema-2020-12-accordion,.swagger-ui button.json-schema-2020-12-expand-deep-button{background:none}`}firstUpdated(){d({url:this.url,domNode:this.renderRoot.firstElementChild,oauth2RedirectUrl:"TODO",presets:[d.presets.apis],plugins:[d.plugins.DownloadUrl],layout:"BaseLayout"}).initOAuth({clientId:"d099d1dd-11f2-4914-aa94-df0b1dbe1dc8",clientSecret:"",realm:"realm",appName:"app",scopeSeparator:" ",additionalQueryStringParams:{},usePkceWithAuthorizationCodeGrant:!0})}render(){return m`<div></div><link rel=stylesheet href=${import.meta.url.replace("JavaScript/element/swagger-element.js","Css/Contrib/swagger-ui.css")} media=all nonce=${window.litNonce}>`}};u([g({type:String})],l.prototype,"url",void 0),l=u([f("typo3-backend-swagger")],l);export{l as SwaggerElement};
