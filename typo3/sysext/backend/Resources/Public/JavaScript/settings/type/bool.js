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
import{html as e}from"lit";import{property as t,customElement as o}from"lit/decorators.js";import{BaseElement as r}from"@typo3/backend/settings/type/base.js";var c=function(e,t,o,r){var c,i=arguments.length,n=i<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,o,r);else for(var l=e.length-1;l>=0;l--)(c=e[l])&&(n=(i<3?c(n):i>3?c(t,o,n):c(t,o))||n);return i>3&&n&&Object.defineProperty(t,o,n),n};const i="typo3-backend-settings-type-bool";let n=class extends r{render(){return e`<div class="form-check form-check-type-toggle"><input type=checkbox id=${this.formid} class=form-check-input value=1 ?disabled=${this.readonly} .checked=${this.value} @change=${e=>this.value=e.target.checked}></div>`}};c([t({type:Boolean,converter:{toAttribute:e=>e?"1":"0",fromAttribute:e=>"1"===e||"true"===e}})],n.prototype,"value",void 0),n=c([o(i)],n);export{n as BoolTypeElement,i as componentName};