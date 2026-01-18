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
import{LitElement as p,css as f,nothing as g,html as h}from"lit";import{property as m,customElement as b}from"lit/decorators.js";var o=function(l,t,e,a){var n=arguments.length,i=n<3?t:a===null?a=Object.getOwnPropertyDescriptor(t,e):a,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")i=Reflect.decorate(l,t,e,a);else for(var c=l.length-1;c>=0;c--)(s=l[c])&&(i=(n<3?s(i):n>3?s(t,e,i):s(t,e))||i);return n>3&&i&&Object.defineProperty(t,e,i),i};let r=class extends p{static styles=f`img{display:block;width:100%;height:auto}`;alt;image;welcomeImage;fallback;render(){if(!this.image&&!this.fallback)return g;const t=this.welcomeImage||this.image||this.fallback;return h`<img alt=${this.alt} src=${t} @error=${t!==this.fallback?this.onError:g}>`}onError(t){const e=t.target;this.image.length&&e.getAttribute("src")===this.welcomeImage?e.setAttribute("src",this.image):this.fallback.length&&e.setAttribute("src",this.fallback)}};o([m({type:String})],r.prototype,"alt",void 0),o([m({type:String})],r.prototype,"image",void 0),o([m({type:String})],r.prototype,"welcomeImage",void 0),o([m({type:String})],r.prototype,"fallback",void 0),r=o([b("typo3-extensionmanager-distribution-image")],r);export{r as DistributionImage};
