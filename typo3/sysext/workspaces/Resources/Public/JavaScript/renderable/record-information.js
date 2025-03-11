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
var e=function(e,t,r,s){var o,a=arguments.length,i=a<3?t:null===s?s=Object.getOwnPropertyDescriptor(t,r):s
if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)i=Reflect.decorate(e,t,r,s)
else for(var n=e.length-1;n>=0;n--)(o=e[n])&&(i=(a<3?o(i):a>3?o(t,r,i):o(t,r))||i)
return a>3&&i&&Object.defineProperty(t,r,i),i}
import{customElement as t,property as r}from"lit/decorators.js"
import{html as s,LitElement as o,nothing as a}from"lit"
import{unsafeHTML as i}from"lit/directives/unsafe-html.js"
import"@typo3/workspaces/renderable/diff-view.js"
import"@typo3/workspaces/renderable/comment-view.js"
import"@typo3/workspaces/renderable/history-view.js"
let n=class extends o{constructor(){super(...arguments),this.TYPO3lang=null}createRenderRoot(){return this}render(){return s`<div><p>${i(this.TYPO3lang.path.replace("{0}",this.record.path_Live))}</p><p>${i(this.TYPO3lang.current_step.replace("{0}",this.record.label_Stage).replace("{1}",this.record.stage_position).replace("{2}",this.record.stage_count))}</p><ul class="nav nav-tabs" role="tablist">${this.record.diff.length>0?this.renderNavLink(this.TYPO3lang["window.recordChanges.tabs.changeSummary"],"#workspace-changes"):a} ${this.record.comments.length>0?this.renderNavLink(this.TYPO3lang["window.recordChanges.tabs.changeSummary"],"#workspace-comments",this.record.comments.length):a} ${this.record.history.data.length>0?this.renderNavLink(this.TYPO3lang["window.recordChanges.tabs.history"],"#workspace-history"):a}</ul><div class="tab-content">${this.record.diff.length>0?s`<div class="tab-pane" id="workspace-changes" role="tabpanel"><div class="form-section"><typo3-workspaces-diff-view .diffs="${this.record.diff}"></typo3-workspaces-diff-view></div></div>`:a} ${this.record.comments.length>0?s`<div class="tab-pane" id="workspace-comments" role="tabpanel"><div class="form-section"><typo3-workspaces-comment-view .comments="${this.record.comments}"></typo3-workspaces-comment-view></div></div>`:a} ${this.record.history.data.length>0?s`<div class="tab-pane" id="workspace-history" role="tabpanel"><div class="form-section"><typo3-workspaces-history-view .historyItems="${this.record.history.data}"></typo3-workspaces-history-view></div></div>`:a}</div></div>`}renderNavLink(e,t,count=0){return s`<li class="nav-item" role="presentation"><button type="button" class="nav-link" data-bs-toggle="tab" data-bs-target="${t}" aria-controls="${t}" role="tab">${e} ${count>0?s`<span class="badge">${count}</span>`:a}</button></li>`}firstUpdated(){this.renderRoot.querySelector(".nav-link").classList.add("active"),this.renderRoot.querySelector(".tab-pane").classList.add("active")}}
e([r({type:Object})],n.prototype,"record",void 0),e([r({type:Object})],n.prototype,"TYPO3lang",void 0),n=e([t("typo3-workspaces-record-information")],n)
export{n as RecordInformationElement}
