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
var e=function(e,t,s,o){var r,n=arguments.length,c=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,s):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)c=Reflect.decorate(e,t,s,o);else for(var i=e.length-1;i>=0;i--)(r=e[i])&&(c=(n<3?r(c):n>3?r(t,s,c):r(t,s))||c);return n>3&&c&&Object.defineProperty(t,s,c),c};import{html as t,LitElement as s}from"lit";import{customElement as o,property as r}from"lit/decorators.js";import{Sizes as n}from"@typo3/backend/enum/icon-types.js";import{IconStyles as c}from"@typo3/backend/icons.js";let i=class extends s{constructor(){super(...arguments),this.size=n.default}static{this.styles=c.getStyles()}render(){return t`<span class="icon icon-size-${this.size} icon-spin icon-state-default"> <span class="icon-markup"> <svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" viewBox="0 0 16 16"><g fill="currentColor"><path d="M8 15c-3.86 0-7-3.141-7-7s3.14-7 7-7 7 3.14 7 7-3.141 7-7 7M8 3C5.243 3 3 5.243 3 8s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5" opacity=".3"/><path d="M14 9a1 1 0 0 1-1-1c0-2.757-2.243-5-5-5a1 1 0 0 1 0-2c3.859 0 7 3.14 7 7a1 1 0 0 1-1 1"/></g></svg> </span> </span>`}};e([r({type:String})],i.prototype,"size",void 0),i=e([o("typo3-backend-spinner")],i);export{i as SpinnerElement};