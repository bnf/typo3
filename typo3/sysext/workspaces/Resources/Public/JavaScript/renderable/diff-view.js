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
import{property as p,customElement as c}from"lit/decorators.js";import{LitElement as v,html as m}from"lit";import{repeat as a}from"lit/directives/repeat.js";import{unsafeHTML as u}from"lit/directives/unsafe-html.js";var s=function(f,e,i,r){var o=arguments.length,t=o<3?e:r===null?r=Object.getOwnPropertyDescriptor(e,i):r,n;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")t=Reflect.decorate(f,e,i,r);else for(var d=f.length-1;d>=0;d--)(n=f[d])&&(t=(o<3?n(t):o>3?n(e,i,t):n(e,i))||t);return o>3&&t&&Object.defineProperty(e,i,t),t};let l=class extends v{diffs=[];createRenderRoot(){return this}render(){return m`<div class=diff>${a(this.diffs,e=>e.field,e=>this.renderDiffItem(e))}</div>`}renderDiffItem(e){return m`<div class=diff-item><div class=diff-item-title>${e.label}</div><div class=diff-item-result>${u(e.content)}</div></div>`}};s([p({type:Array})],l.prototype,"diffs",void 0),l=s([c("typo3-workspaces-diff-view")],l);export{l as DiffViewElement};
