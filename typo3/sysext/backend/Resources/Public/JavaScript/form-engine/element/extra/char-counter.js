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
import{property as c,state as m,customElement as u}from"lit/decorators.js";import{LitElement as g,html as d}from"lit";import{lll as f}from"@typo3/core/lit-helper.js";var h=function(s,e,t,n){var i=arguments.length,r=i<3?e:n===null?n=Object.getOwnPropertyDescriptor(e,t):n,l;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")r=Reflect.decorate(s,e,t,n);else for(var o=s.length-1;o>=0;o--)(l=s[o])&&(r=(i<3?l(r):i>3?l(e,t,r):l(e,t))||r);return i>3&&r&&Object.defineProperty(e,t,r),r};let a=class extends g{target;remainingCharacters=0;targetElement=null;threshold=15;connectedCallback(){super.connectedCallback(),this.registerCallbacks(),this.hidden=!0}disconnectedCallback(){super.disconnectedCallback(),this.removeCallbacks()}createRenderRoot(){return this}updated(e){e.has("target")&&(this.removeCallbacks(),this.targetElement=document.querySelector(this.target),this.registerCallbacks())}render(){return d`<span class="form-hint form-hint--${this.determineCounterClass()}"> ${f("FormEngine.remainingCharacters").replace("{0}",this.remainingCharacters.toString(10))} </span>`}registerCallbacks(){this.targetElement!==null&&(this.targetElement.addEventListener("input",this.onInput),this.targetElement.addEventListener("focus",this.onFocus),this.targetElement.addEventListener("blur",this.onBlur))}removeCallbacks(){this.targetElement!==null&&(this.targetElement.removeEventListener("input",this.onInput),this.targetElement.removeEventListener("focus",this.onFocus),this.targetElement.removeEventListener("blur",this.onBlur))}onInput=e=>{this.determineRemainingCharacters(e.target)};onFocus=e=>{this.determineRemainingCharacters(e.target),this.hidden=!1};onBlur=()=>{this.hidden=!0};determineRemainingCharacters(e){const t=e.value,n=t.length,i=(t.match(/\n/g)||[]).length;this.remainingCharacters=this.targetElement.maxLength-n-i}determineCounterClass(){return this.remainingCharacters<this.threshold?"danger":this.remainingCharacters<this.threshold*2?"warning":"info"}};h([c()],a.prototype,"target",void 0),h([m()],a.prototype,"remainingCharacters",void 0),a=h([u("typo3-backend-formengine-char-counter")],a);export{a as CharCounter};
