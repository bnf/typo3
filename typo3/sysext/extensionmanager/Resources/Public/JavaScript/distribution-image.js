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
var t=function(t,e,r,i){var o,a=arguments.length,l=a<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)l=Reflect.decorate(t,e,r,i);else for(var s=t.length-1;s>=0;s--)(o=t[s])&&(l=(a<3?o(l):a>3?o(e,r,l):o(e,r))||l);return a>3&&l&&Object.defineProperty(e,r,l),l};import{css as e,html as r,LitElement as i,nothing as o}from"lit";import{customElement as a,property as l}from"lit/decorators.js";let s=class extends i{static{this.styles=e`img{display:block;width:100%;height:auto}`}render(){if(!this.image&&!this.fallback)return o;const t=this.welcomeImage||this.image||this.fallback;return r`<img alt="${this.alt}" src="${t}" @error="${t!==this.fallback?this.onError:o}">`}onError(t){const e=t.target;this.image.length&&e.getAttribute("src")===this.welcomeImage?e.setAttribute("src",this.image):this.fallback.length&&e.setAttribute("src",this.fallback)}};t([l({type:String})],s.prototype,"alt",void 0),t([l({type:String})],s.prototype,"image",void 0),t([l({type:String})],s.prototype,"welcomeImage",void 0),t([l({type:String})],s.prototype,"fallback",void 0),s=t([a("typo3-extensionmanager-distribution-image")],s);export{s as DistributionImage};