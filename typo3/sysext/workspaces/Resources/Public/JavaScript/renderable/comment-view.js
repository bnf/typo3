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
import{property as d,customElement as c}from"lit/decorators.js";import{LitElement as f,html as m,nothing as v}from"lit";import{repeat as u}from"lit/directives/repeat.js";import{unsafeHTML as b}from"lit/directives/unsafe-html.js";import{nl2br as _}from"@typo3/core/directive/nl2br.js";var p=function(n,e,r,s){var i=arguments.length,t=i<3?e:s===null?s=Object.getOwnPropertyDescriptor(e,r):s,o;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")t=Reflect.decorate(n,e,r,s);else for(var l=n.length-1;l>=0;l--)(o=n[l])&&(t=(i<3?o(t):i>3?o(e,r,t):o(e,r))||t);return i>3&&t&&Object.defineProperty(e,r,t),t};let a=class extends f{comments=[];createRenderRoot(){return this}render(){return m`<div>${u(this.comments,e=>e.tstamp,e=>this.renderComment(e))}</div>`}renderComment(e){return m`<div class=media><div class="media-left text-center"><div>${b(e.user_avatar)}</div>${e.user_username}</div><div class="panel panel-default">${e.user_comment?m`<div class=panel-body>${_(e.user_comment)}</div>`:v}<div class=panel-footer><span class="badge badge-success me-2"> ${e.previous_stage_title} ⇾ ${e.stage_title} </span> <span class="badge badge-info">${e.tstamp} </span></div></div></div>`}};p([d({type:Array})],a.prototype,"comments",void 0),a=p([c("typo3-workspaces-comment-view")],a);export{a as CommentViewElement};
