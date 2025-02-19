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
import{property as e,customElement as t}from"lit/decorators.js";import{LitElement as r,html as s,nothing as o}from"lit";import{repeat as i}from"lit/directives/repeat.js";import{unsafeHTML as a}from"lit/directives/unsafe-html.js";var n=function(e,t,r,s){var o,i=arguments.length,a=i<3?t:null===s?s=Object.getOwnPropertyDescriptor(t,r):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,r,s);else for(var n=e.length-1;n>=0;n--)(o=e[n])&&(a=(i<3?o(a):i>3?o(t,r,a):o(t,r))||a);return i>3&&a&&Object.defineProperty(t,r,a),a};let c=class extends r{constructor(){super(...arguments),this.comments=[]}createRenderRoot(){return this}render(){return s`<div>${i(this.comments,(e=>e.tstamp),(e=>this.renderComment(e)))}</div>`}renderComment(e){return s`<div class=media><div class="media-left text-center"><div>${a(e.user_avatar)}</div>${e.user_username}</div><div class="panel panel-default">${e.user_comment?s`<div class=panel-body>${e.user_comment}</div>`:o}<div class=panel-footer><span class="badge badge-success me-2"> ${e.previous_stage_title} > ${e.stage_title} </span> <span class="badge badge-info">${e.tstamp} </span></div></div></div>`}};n([e({type:Array})],c.prototype,"comments",void 0),c=n([t("typo3-workspaces-comment-view")],c);export{c as CommentViewElement};