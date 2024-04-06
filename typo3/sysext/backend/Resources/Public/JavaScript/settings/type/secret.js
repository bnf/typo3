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
import{html as f}from"lit";import{property as s,customElement as u}from"lit/decorators.js";import{BaseElement as h}from"@typo3/backend/settings/type/base.js";import{live as d}from"lit/directives/live.js";var c=function(n,e,t,o){var l=arguments.length,r=l<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,t):o,p;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")r=Reflect.decorate(n,e,t,o);else for(var a=n.length-1;a>=0;a--)(p=n[a])&&(r=(l<3?p(r):l>3?p(e,t,r):p(e,t))||r);return l>3&&r&&Object.defineProperty(e,t,r),r};const m="typo3-backend-settings-type-secret";let i=class extends h{handleChange(e){const t=e.target;t.reportValidity()&&(this.value=t.value)}render(){return f`<input type=password id=${this.formid} class=form-control ?readonly=${this.readonly} .value=${d(this.value)} @change=${this.handleChange}>`}};c([s({type:String})],i.prototype,"value",void 0),i=c([u(m)],i);export{i as SecretTypeElement,m as componentName};
