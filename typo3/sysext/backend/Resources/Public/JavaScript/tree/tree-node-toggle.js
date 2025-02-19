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
import{property as e,customElement as t}from"lit/decorators.js";import{LitElement as r,html as o}from"lit";import"@typo3/backend/element/icon-element.js";var n=function(e,t,r,o){var n,c=arguments.length,i=c<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,r):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)i=Reflect.decorate(e,t,r,o);else for(var a=e.length-1;a>=0;a--)(n=e[a])&&(i=(c<3?n(i):c>3?n(t,r,i):n(t,r))||i);return c>3&&i&&Object.defineProperty(t,r,i),i};let c=class extends r{constructor(){super(...arguments),this.expanded="false"}render(){return o`<typo3-backend-icon size=small identifier=${"true"===this.expanded?"actions-chevron-down":"actions-chevron-right"}></typo3-backend-icon>`}};n([e({type:String,reflect:!0,attribute:"aria-expanded"})],c.prototype,"expanded",void 0),c=n([t("typo3-backend-tree-node-toggle")],c);var i=c;export{i as default};