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
import{html as s,nothing as a}from"lit";import{property as f,customElement as d}from"lit/decorators.js";import{live as u}from"lit/directives/live.js";import{BaseElement as $}from"@typo3/backend/settings/type/base.js";var h=function(i,e,t,o){var r=arguments.length,n=r<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,t):o,l;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(i,e,t,o);else for(var m=i.length-1;m>=0;m--)(l=i[m])&&(n=(r<3?l(n):r>3?l(e,t,n):l(e,t))||n);return r>3&&n&&Object.defineProperty(e,t,n),n};const c="typo3-backend-settings-type-int";let p=class extends ${value;handleChange(e){const t=e.target;t.reportValidity()&&(t instanceof HTMLInputElement?this.value=t.valueAsNumber:this.value=parseInt(t.value,10))}renderEnum(){return s`<select id=${this.formid} class=form-select ?readonly=${this.readonly} .value=${u(this.value)} @change=${this.handleChange}>${Object.entries(this.enum).map(([e,t])=>s`<option ?selected=${this.value.toString()===e} value=${e}>${t}${this.debug?s`[${e}]`:a}</option>`)}</select>`}render(){return typeof this.enum=="object"?this.renderEnum():s`<input type=number id=${this.formid} class=form-control ?readonly=${this.readonly} .value=${u(String(this.value))} required min=${this.options.min??a} max=${this.options.max??a} step=${this.options.step??a} @change=${this.handleChange}>`}};h([f({type:Number})],p.prototype,"value",void 0),p=h([d(c)],p);export{p as IntTypeElement,c as componentName};
