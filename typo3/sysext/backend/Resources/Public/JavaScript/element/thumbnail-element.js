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
import{property as p,customElement as f}from"lit/decorators.js";import{LitElement as b,html as c}from"lit";import{Task as y}from"@lit/task";import"@typo3/backend/element/spinner-element.js";import"@typo3/backend/element/icon-element.js";var l=function(m,t,n,a){var s=arguments.length,e=s<3?t:a===null?a=Object.getOwnPropertyDescriptor(t,n):a,i;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")e=Reflect.decorate(m,t,n,a);else for(var r=m.length-1;r>=0;r--)(i=m[r])&&(e=(s<3?i(e):s>3?i(t,n,e):i(t,n))||e);return s>3&&e&&Object.defineProperty(t,n,e),e};const u={default:"default",small:"small",medium:"medium",large:"large"};let o=class extends b{url;size=u.default;keepAspectRatio=!1;width;height;thumbnailTask=new y(this,{task:async([t,n,a,s,e])=>{const i=new URL(t,window.origin);i.searchParams.set("size",n),i.searchParams.set("keepAspectRatio",a?"1":"0"),i.searchParams.set("bust",Date.now().toString(10));const r=new Image;return r.src=i.toString(),s>0&&(r.width=s),e>0&&!a&&(r.height=e),await new Promise((h,d)=>{r.onload=()=>h(),r.onerror=()=>d()}),c`${r}`},args:()=>[this.url,this.size,this.keepAspectRatio,this.width,this.height]});createRenderRoot(){return this}render(){return this.thumbnailTask.render({pending:()=>c`<typo3-backend-spinner size=${this.size}></typo3-backend-spinner>`,complete:t=>c`${t}`,error:()=>c`<typo3-backend-icon identifier=default-not-found size=small></typo3-backend-icon>`})}};l([p({type:String,reflect:!0})],o.prototype,"url",void 0),l([p({type:String,reflect:!0})],o.prototype,"size",void 0),l([p({type:Boolean,reflect:!0})],o.prototype,"keepAspectRatio",void 0),l([p({type:Number,reflect:!0})],o.prototype,"width",void 0),l([p({type:Number,reflect:!0})],o.prototype,"height",void 0),o=l([f("typo3-backend-thumbnail")],o);export{o as ThumbnailElement,u as ThumbnailSize};
