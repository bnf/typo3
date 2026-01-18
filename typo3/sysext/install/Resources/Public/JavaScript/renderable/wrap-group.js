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
import{LitElement as d,html as m}from"lit";import{property as u,customElement as c}from"lit/decorators.js";var s=function(i,r,e,o){var p=arguments.length,t=p<3?r:o===null?o=Object.getOwnPropertyDescriptor(r,e):o,l;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")t=Reflect.decorate(i,r,e,o);else for(var n=i.length-1;n>=0;n--)(l=i[n])&&(t=(p<3?l(t):p>3?l(r,e,t):l(r,e))||t);return p>3&&t&&Object.defineProperty(r,e,t),t};let a=class extends d{wrapId=null;values=null;createRenderRoot(){return this}render(){return m`<div class=form-multigroup-wrap><div class=form-multigroup-item><div class=input-group><input id=${this.wrapId}_wrap_start class="form-control t3js-emconf-wrapfield" data-target=#${this.wrapId} value=${this.values[0].trim()}></div></div><div class=form-multigroup-item><div class=input-group><input id=${this.wrapId}_wrap_end class="form-control t3js-emconf-wrapfield" data-target=#${this.wrapId} value=${this.values[0].trim()}></div></div></div>`}};s([u({type:String})],a.prototype,"wrapId",void 0),s([u({type:Array})],a.prototype,"values",void 0),a=s([c("typo3-install-wrap-group")],a);
