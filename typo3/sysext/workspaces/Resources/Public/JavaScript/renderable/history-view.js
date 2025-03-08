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
var e=function(e,t,i,r){var s,d=arguments.length,o=d<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r
if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(e,t,i,r)
else for(var a=e.length-1;a>=0;a--)(s=e[a])&&(o=(d<3?s(o):d>3?s(t,i,o):s(t,i))||o)
return d>3&&o&&Object.defineProperty(t,i,o),o}
import{customElement as t,property as i}from"lit/decorators.js"
import{html as r,LitElement as s,nothing as d}from"lit"
import{repeat as o}from"lit/directives/repeat.js"
import{unsafeHTML as a}from"lit/directives/unsafe-html.js"
let f=class extends s{constructor(){super(...arguments),this.historyItems=[]}createRenderRoot(){return this}render(){return r`<div>${o(this.historyItems,(e=>e.datetime),(e=>this.renderHistoryItem(e)))}</div>`}renderHistoryItem(e){return"object"==typeof e.differences&&0===e.differences.length?d:r`<div class="media"><div class="media-left text-center"><div>${a(e.user_avatar)}</div>${e.user}</div><div class="media-body"><div class="panel panel-default">${"object"==typeof e.differences?r`<div><div class="diff">${o(e.differences,(e=>e),(e=>r`<div class="diff-item"><div class="diff-item-title">${e.label}</div><div class="diff-item-result diff-item-result-inline">${a(e.html)}</div></div>`))}</div></div>`:r`<div class="panel-body">${e.differences}</div>`}<div class="panel-footer"><span class="badge badge-info">${e.datetime}</span></div></div></div></div>`}}
e([i({type:Array})],f.prototype,"historyItems",void 0),f=e([t("typo3-workspaces-history-view")],f)
export{f as HistoryViewElement}
