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
import{html as c,nothing as u}from"lit";import{property as s,customElement as h}from"lit/decorators.js";import{live as d}from"lit/directives/live.js";import{BaseElement as v}from"@typo3/backend/settings/type/base.js";var m=function(r,e,t,o){var l=arguments.length,n=l<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,t):o,i;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(r,e,t,o);else for(var a=r.length-1;a>=0;a--)(i=r[a])&&(n=(l<3?i(n):l>3?i(e,t,n):i(e,t))||n);return l>3&&n&&Object.defineProperty(e,t,n),n};const f="typo3-backend-settings-type-url";let p=class extends v{value="";handleChange(e){const t=e.target;t.reportValidity()&&(this.value=t.value.trim())}render(){return c`<input type=url id=${this.formid} class=form-control .value=${d(this.value)} ?readonly=${this.readonly} pattern=${this.options.pattern??u} @change=${this.handleChange}>`}};m([s({type:String})],p.prototype,"value",void 0),p=m([h(f)],p);export{p as UrlTypeElement,f as componentName};
