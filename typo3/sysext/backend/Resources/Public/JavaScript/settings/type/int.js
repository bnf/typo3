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
import{html as e}from"lit";import{property as t,customElement as r}from"lit/decorators.js";import{BaseElement as o}from"@typo3/backend/settings/type/base.js";var n=function(e,t,r,o){var n,a=arguments.length,i=a<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,r):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)i=Reflect.decorate(e,t,r,o);else for(var l=e.length-1;l>=0;l--)(n=e[l])&&(i=(a<3?n(i):a>3?n(t,r,i):n(t,r))||i);return a>3&&i&&Object.defineProperty(t,r,i),i};const a="typo3-backend-settings-type-int";let i=class extends o{render(){return e`<input type=number id=${this.formid} class=form-control ?readonly=${this.readonly} .value=${this.value} @change=${e=>this.value=parseInt(e.target.value,10)}>`}};n([t({type:Number})],i.prototype,"value",void 0),i=n([r(a)],i);export{i as IntTypeElement,a as componentName};