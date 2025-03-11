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
var t=function(t,e,i,r){var s,o=arguments.length,n=o<3?e:null===r?r=Object.getOwnPropertyDescriptor(e,i):r
if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(t,e,i,r)
else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(n=(o<3?s(n):o>3?s(e,i,n):s(e,i))||n)
return o>3&&n&&Object.defineProperty(e,i,n),n}
import{html as e,LitElement as i,nothing as r}from"lit"
import{Task as s}from"@lit/task"
import{customElement as o,property as n}from"lit/decorators.js"
import{unsafeHTML as a}from"lit/directives/unsafe-html.js"
import{Sizes as p,States as l,MarkupIdentifiers as c}from"@typo3/backend/enum/icon-types.js"
import d,{IconStyles as f}from"@typo3/backend/icons.js"
import"@typo3/backend/element/spinner-element.js"
let h=class extends i{constructor(){super(...arguments),this.size=p.default,this.state=l.default,this.overlay=null,this.markup=c.inline,this.raw=null,this.iconTask=new s(this,{task:async([identifier,size,overlay,state,markup],{signal})=>await d.getIcon(identifier,size,overlay,state,markup,signal),args:()=>[this.identifier,this.size,this.overlay,this.state,this.markup]})}static{this.styles=f.getStyles()}render(){return this.raw?e`${a(this.raw)}`:this.identifier?this.iconTask.render({pending:()=>e`<typo3-backend-spinner size="${this.size}"></typo3-backend-spinner>`,complete:t=>e`${a(t)}`,error:()=>e`<span class="t3js-icon icon icon-size-${this.size} icon-state-${this.state} icon-default-not-found" data-identifier="default-not-found" aria-hidden="true"><span class="icon-markup"><svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" viewBox="0 0 16 16"><g><path fill="#CD201F" d="m11 12 3-2v6H2v-6l3 2 3-2 3 2z"/><path fill="#212121" d="m8 10.3 2.86 1.91.14.09.14-.09 2.61-1.74v5.28H2.25v-5.28l2.61 1.74.14.09.14-.09L8 10.3m6-.3-3 2-3-2-3 2-3-2v6h12v-6z" opacity=".2"/><path fill="#CD201F" d="M14 4v4l-3 2-3-2-3 2-3-2V0h8l4 4z"/><path fill="#212121" d="M13.75 7.87 11 9.7 8.14 7.79 8 7.7l-.14.09L5 9.7 2.25 7.87V.25H10V0H2v8l3 2 3-2 3 2 3-2V4h-.25z" opacity=".2"/><path fill="#FFF" d="M14 4h-4V0l4 4z" opacity=".3"/><path fill="#212121" d="m14 8-4-4h4v4z" opacity=".3"/></g></svg></span></span>`}):r}}
t([n({type:String,reflect:!0})],h.prototype,"identifier",void 0),t([n({type:String,reflect:!0})],h.prototype,"size",void 0),t([n({type:String})],h.prototype,"state",void 0),t([n({type:String})],h.prototype,"overlay",void 0),t([n({type:String})],h.prototype,"markup",void 0),t([n({type:String})],h.prototype,"raw",void 0),h=t([o("typo3-backend-icon")],h)
export{h as IconElement}
