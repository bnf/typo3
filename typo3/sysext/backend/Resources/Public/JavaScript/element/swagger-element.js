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
import{LitElement as c,css as g,html as m}from"lit";import{property as d,customElement as f}from"lit/decorators.js";import{SwaggerUIBundle as p}from"swagger-ui-dist";var u=function(o,t,r,n){var i=arguments.length,e=i<3?t:n===null?n=Object.getOwnPropertyDescriptor(t,r):n,l;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")e=Reflect.decorate(o,t,r,n);else for(var a=o.length-1;a>=0;a--)(l=o[a])&&(e=(i<3?l(e):i>3?l(t,r,e):l(t,r))||e);return i>3&&e&&Object.defineProperty(t,r,e),e};let s=class extends c{static{this.styles=g`@media (prefers-color-scheme:dark){.swagger-ui{filter:invert(88%) hue-rotate(180deg)}.swagger-ui .microlight{filter:invert(100%) hue-rotate(180deg)}}.swagger-ui button.json-schema-2020-12-accordion,.swagger-ui button.json-schema-2020-12-expand-deep-button{background:none}`}firstUpdated(){p({url:this.url,domNode:this.renderRoot.firstElementChild,presets:[p.presets.apis],plugins:[p.plugins.DownloadUrl],layout:"BaseLayout"})}render(){return m`<div></div><link rel=stylesheet href=${import.meta.url.replace("JavaScript/element/swagger-element.js","Css/Contrib/swagger-ui.css")} media=all nonce=${window.litNonce}>`}};u([d({type:String})],s.prototype,"url",void 0),s=u([f("typo3-backend-swagger")],s);export{s as SwaggerElement};
