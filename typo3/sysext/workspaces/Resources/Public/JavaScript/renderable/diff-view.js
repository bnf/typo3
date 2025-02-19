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
import{property as e,customElement as t}from"lit/decorators.js";import{LitElement as r,html as i}from"lit";import{repeat as f}from"lit/directives/repeat.js";import{unsafeHTML as o}from"lit/directives/unsafe-html.js";var s=function(e,t,r,i){var f,o=arguments.length,s=o<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,r,i);else for(var d=e.length-1;d>=0;d--)(f=e[d])&&(s=(o<3?f(s):o>3?f(t,r,s):f(t,r))||s);return o>3&&s&&Object.defineProperty(t,r,s),s};let d=class extends r{constructor(){super(...arguments),this.diffs=[]}createRenderRoot(){return this}render(){return i`<div class=diff>${f(this.diffs,(e=>e.field),(e=>this.renderDiffItem(e)))}</div>`}renderDiffItem(e){return i`<div class=diff-item><div class=diff-item-title>${e.label}</div><div class=diff-item-result>${o(e.content)}</div></div>`}};s([e({type:Array})],d.prototype,"diffs",void 0),d=s([t("typo3-workspaces-diff-view")],d);export{d as DiffViewElement};