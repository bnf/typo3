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
import{html as e}from"lit";import{property as t,customElement as r}from"lit/decorators.js";import{BaseElement as o}from"@typo3/backend/settings/type/base.js";import"@typo3/backend/color-picker.js";import n from"@typo3/core/event/regular-event.js";var l=function(e,t,r,o){var n,l=arguments.length,p=l<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,r):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)p=Reflect.decorate(e,t,r,o);else for(var a=e.length-1;a>=0;a--)(n=e[a])&&(p=(l<3?n(p):l>3?n(t,r,p):n(t,r))||p);return l>3&&p&&Object.defineProperty(t,r,p),p};const p="typo3-backend-settings-type-color";let a=class extends o{firstUpdated(){const e=this.getInputElement();e&&new n("blur",(e=>{this.updateValue(e.target.value)})).bindTo(e)}updateValue(e){this.value=e}render(){return e`<typo3-backend-color-picker><input type=text id=${this.formid} class=form-control ?readonly=${this.readonly} .value=${this.value} @change=${e=>this.updateValue(e.target.value)}></typo3-backend-color-picker>`}getInputElement(){return this.querySelector("input")}};l([t({type:String})],a.prototype,"value",void 0),a=l([r(p)],a);export{a as ColorTypeElement,p as componentName};