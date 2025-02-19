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
import{html as e}from"lit";import{property as t,customElement as r}from"lit/decorators.js";import{BaseElement as o}from"@typo3/backend/settings/type/base.js";var n=function(e,t,r,o){var n,a=arguments.length,l=a<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,r):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)l=Reflect.decorate(e,t,r,o);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(l=(a<3?n(l):a>3?n(t,r,l):n(t,r))||l);return a>3&&l&&Object.defineProperty(t,r,l),l};const a="typo3-backend-settings-type-number";let l=class extends o{render(){return e`<input type=number id=${this.formid} class=form-control step=0.01 ?readonly=${this.readonly} .value=${this.value} @change=${e=>this.value=parseFloat(e.target.value)}>`}};n([t({type:Number})],l.prototype,"value",void 0),l=n([r(a)],l);export{l as NumberTypeElement,a as componentName};