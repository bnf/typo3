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
import{property as a,customElement as f}from"lit/decorators.js";import{LitElement as m,html as u}from"lit";import"@typo3/backend/element/icon-element.js";var c=function(r,t,o,n){var d=arguments.length,e=d<3?t:n===null?n=Object.getOwnPropertyDescriptor(t,o):n,l;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")e=Reflect.decorate(r,t,o,n);else for(var p=r.length-1;p>=0;p--)(l=r[p])&&(e=(d<3?l(e):d>3?l(t,o,e):l(t,o))||e);return d>3&&e&&Object.defineProperty(t,o,e),e};let i=class extends m{expanded="false";render(){return u`<typo3-backend-icon size=small identifier=${this.expanded==="true"?"actions-chevron-down":"actions-chevron-end"}></typo3-backend-icon>`}};c([a({type:String,reflect:!0,attribute:"aria-expanded"})],i.prototype,"expanded",void 0),i=c([f("typo3-backend-tree-node-toggle")],i);var s=i;export{s as default};
