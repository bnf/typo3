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
import{ReactiveElement as f}from"@lit/reactive-element";import{property as l,customElement as d}from"lit/decorators.js";import{provide as u}from"@lit/context";import{colorSchemeContext as h}from"@typo3/backend/context/color-scheme.js";import{themeContext as p}from"@typo3/backend/context/theme.js";var a=function(s,e,o,i){var r=arguments.length,t=r<3?e:i===null?i=Object.getOwnPropertyDescriptor(e,o):i,n;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")t=Reflect.decorate(s,e,o,i);else for(var m=s.length-1;m>=0;m--)(n=s[m])&&(t=(r<3?n(t):r>3?n(e,o,t):n(e,o))||t);return r>3&&t&&Object.defineProperty(e,o,t),t};let c=class extends f{constructor(){super(...arguments),this.renderRoot=this}updated(e){const o={};e.has("colorScheme")&&e.get("colorScheme")!==void 0&&(o["data-color-scheme"]=this.colorScheme==="auto"?null:this.colorScheme),e.has("theme")&&e.get("theme")!==void 0&&(o["data-theme"]=this.theme==="modern"?null:this.theme),Object.keys(o).length>0&&b(o)}};a([l({type:String,attribute:"color-scheme",reflect:!0}),u({context:h})],c.prototype,"colorScheme",void 0),a([l({type:String,reflect:!0}),u({context:p})],c.prototype,"theme",void 0),c=a([d("typo3-backend")],c);async function b(s){const e=document.documentElement,o=window.frames.list_frame?.document.documentElement,i=()=>{e.classList.add("t3js-disable-transitions"),o?.classList.add("t3js-disable-transitions");for(const[t,n]of Object.entries(s))n===null?(e.removeAttribute(t),o?.removeAttribute(t)):(e.setAttribute(t,n),o?.setAttribute(t,n))},r=()=>{e.classList.remove("t3js-disable-transitions"),o?.classList.remove("t3js-disable-transitions")};if(window.matchMedia("(prefers-reduced-motion: reduce)").matches||!("startViewTransition"in document)||typeof document.startViewTransition!="function"){i(),await new Promise(t=>requestAnimationFrame(t)),o&&await new Promise(t=>window.frames.list_frame.requestAnimationFrame(t)),r();return}await document.startViewTransition(i).finished,r()}export{c as BackendElement};
