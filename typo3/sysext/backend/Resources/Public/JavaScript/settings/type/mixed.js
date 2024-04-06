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
import{html as c}from"lit";import{property as d,customElement as s}from"lit/decorators.js";import{BaseElement as h}from"@typo3/backend/settings/type/base.js";import{live as u}from"lit/directives/live.js";var m=function(n,e,t,o){var l=arguments.length,r=l<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,t):o,i;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")r=Reflect.decorate(n,e,t,o);else for(var p=n.length-1;p>=0;p--)(i=n[p])&&(r=(l<3?i(r):l>3?i(e,t,r):i(e,t))||r);return l>3&&r&&Object.defineProperty(e,t,r),r};const f="typo3-backend-settings-type-mixed";let a=class extends h{handleChange(e){const t=e.target;t.reportValidity()&&(this.value=t.value)}render(){return c`<textarea id=${this.formid} class=form-control ?readonly=${this.readonly} .value=${u(this.value)} @change=${this.handleChange}></textarea>`}};m([d({type:String})],a.prototype,"value",void 0),a=m([s(f)],a);export{a as MixedTypeElement,f as componentName};
