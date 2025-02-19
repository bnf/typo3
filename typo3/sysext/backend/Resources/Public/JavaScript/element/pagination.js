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
import{property as t,customElement as e}from"lit/decorators.js";import{LitElement as i,html as a}from"lit";import{range as n}from"lit/directives/range.js";import{map as o}from"lit/directives/map.js";import{classMap as s}from"lit/directives/class-map.js";var r=function(t,e,i,a){var n,o=arguments.length,s=o<3?e:null===a?a=Object.getOwnPropertyDescriptor(e,i):a;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(t,e,i,a);else for(var r=t.length-1;r>=0;r--)(n=t[r])&&(s=(o<3?n(s):o>3?n(e,i,s):n(e,i))||s);return o>3&&s&&Object.defineProperty(e,i,s),s};let p=class extends i{constructor(){super(...arguments),this.paging=null}createRenderRoot(){return this}render(){return a`<ul class=pagination><li class=${s({"page-item":!0,disabled:1===this.paging.currentPage})}><button type=button class=page-link data-action=previous ?disabled=${1===this.paging.currentPage}><typo3-backend-icon identifier=actions-view-paging-previous size=small></typo3-backend-icon></button></li>${o(n(1,this.paging.totalPages+1),(t=>a`<li class=${s({"page-item":!0,active:this.paging.currentPage===t})}><button type=button class=page-link data-action=page data-page=${t}><span>${t}</span></button></li>`))}<li class=${s({"page-item":!0,disabled:this.paging.currentPage===this.paging.totalPages})}><button type=button class=page-link data-action=next ?disabled=${this.paging.currentPage===this.paging.totalPages}><typo3-backend-icon identifier=actions-view-paging-next size=small></typo3-backend-icon></button></li></ul>`}};r([t({type:Object})],p.prototype,"paging",void 0),p=r([e("typo3-backend-pagination")],p);export{p as PaginationElement};