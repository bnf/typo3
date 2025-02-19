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
import{property as e,customElement as t}from"lit/decorators.js";import{LitElement as i,html as r,nothing as s}from"lit";import{repeat as d}from"lit/directives/repeat.js";import{unsafeHTML as o}from"lit/directives/unsafe-html.js";var a=function(e,t,i,r){var s,d=arguments.length,o=d<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(e,t,i,r);else for(var a=e.length-1;a>=0;a--)(s=e[a])&&(o=(d<3?s(o):d>3?s(t,i,o):s(t,i))||o);return d>3&&o&&Object.defineProperty(t,i,o),o};let f=class extends i{constructor(){super(...arguments),this.historyItems=[]}createRenderRoot(){return this}render(){return r`<div>${d(this.historyItems,(e=>e.datetime),(e=>this.renderHistoryItem(e)))}</div>`}renderHistoryItem(e){return"object"==typeof e.differences&&0===e.differences.length?s:r`<div class=media><div class="media-left text-center"><div>${o(e.user_avatar)}</div>${e.user}</div><div class=media-body><div class="panel panel-default">${"object"==typeof e.differences?r`<div><div class=diff>${d(e.differences,(e=>e),(e=>r`<div class=diff-item><div class=diff-item-title>${e.label}</div><div class="diff-item-result diff-item-result-inline">${o(e.html)}</div></div>`))}</div></div>`:r`<div class=panel-body>${e.differences}</div>`}<div class=panel-footer><span class="badge badge-info"> ${e.datetime} </span></div></div></div></div>`}};a([e({type:Array})],f.prototype,"historyItems",void 0),f=a([t("typo3-workspaces-history-view")],f);export{f as HistoryViewElement};