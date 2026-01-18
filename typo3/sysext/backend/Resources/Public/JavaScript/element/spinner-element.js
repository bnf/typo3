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
import{LitElement as a,html as f}from"lit";import{property as m,customElement as u}from"lit/decorators.js";import{Sizes as v}from"@typo3/backend/enum/icon-types.js";import{IconStyles as d}from"@typo3/backend/icons.js";var c=function(r,t,n,o){var s=arguments.length,e=s<3?t:o===null?o=Object.getOwnPropertyDescriptor(t,n):o,p;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")e=Reflect.decorate(r,t,n,o);else for(var l=r.length-1;l>=0;l--)(p=r[l])&&(e=(s<3?p(e):s>3?p(t,n,e):p(t,n))||e);return s>3&&e&&Object.defineProperty(t,n,e),e};let i=class extends a{static styles=d.getStyles();size=v.default;render(){return f`<span class="icon icon-size-${this.size} icon-state-default icon-spin"> <span class=icon-markup><svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" viewBox="0 0 16 16"><g fill="currentColor"><path d="M8 15c-3.86 0-7-3.141-7-7s3.14-7 7-7 7 3.14 7 7-3.141 7-7 7M8 3C5.243 3 3 5.243 3 8s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5" opacity=".3"/><path d="M14 9a1 1 0 0 1-1-1c0-2.757-2.243-5-5-5a1 1 0 0 1 0-2c3.859 0 7 3.14 7 7a1 1 0 0 1-1 1"/></g></svg> </span> </span>`}};c([m({type:String})],i.prototype,"size",void 0),i=c([u("typo3-backend-spinner")],i);export{i as SpinnerElement};
