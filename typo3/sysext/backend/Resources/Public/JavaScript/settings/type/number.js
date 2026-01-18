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
import{html as f,nothing as s}from"lit";import{property as c,customElement as h}from"lit/decorators.js";import{live as d}from"lit/directives/live.js";import{BaseElement as v}from"@typo3/backend/settings/type/base.js";var a=function(o,e,t,r){var i=arguments.length,n=i<3?e:r===null?r=Object.getOwnPropertyDescriptor(e,t):r,l;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(o,e,t,r);else for(var p=o.length-1;p>=0;p--)(l=o[p])&&(n=(i<3?l(n):i>3?l(e,t,n):l(e,t))||n);return i>3&&n&&Object.defineProperty(e,t,n),n};const u="typo3-backend-settings-type-number";let m=class extends v{value;handleChange(e){const t=e.target;t.reportValidity()&&(this.value=t.valueAsNumber)}render(){return f`<input type=number id=${this.formid} class=form-control ?readonly=${this.readonly} .value=${d(this.value)} required min=${this.options.min??s} max=${this.options.max??s} step=${this.options.step??"0.01"} @change=${this.handleChange}>`}};a([c({type:Number})],m.prototype,"value",void 0),m=a([h(u)],m);export{m as NumberTypeElement,u as componentName};
