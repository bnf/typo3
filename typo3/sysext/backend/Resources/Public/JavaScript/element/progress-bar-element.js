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
var r=function(r,e,t,a){var i,o=arguments.length,s=o<3?e:null===a?a=Object.getOwnPropertyDescriptor(e,t):a
if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(r,e,t,a)
else for(var n=r.length-1;n>=0;n--)(i=r[n])&&(s=(o<3?i(s):o>3?i(e,t,s):i(e,t))||s)
return o>3&&s&&Object.defineProperty(e,t,s),s}
import{css as e,html as t,LitElement as a,nothing as i}from"lit"
import{customElement as o,property as s}from"lit/decorators.js"
import{classMap as n}from"lit/directives/class-map.js"
import{styleMap as l}from"lit/directives/style-map.js"
import p from"@typo3/backend/severity.js"
import{SeverityEnum as d}from"@typo3/backend/enum/severity.js"
let c=class extends a{constructor(){super(...arguments),this.value=void 0,this.max=100,this.severity=d.info}static{this.styles=e`@keyframes progress-indeterminate{0%{inset-inline-start:-33%}100%{inset-inline-start:100%}}:host{--progress-bar-height:3px;--progress-track-bg-color:light-dark(var(--bs-gray-300), var(--bs-gray-800));display:block;width:100%;border-radius:var(--typo3-component-border-radius)}.progress{position:relative;overflow:hidden;height:var(--progress-bar-height);border-radius:var(--typo3-component-border-radius)}.track{background:var(--progress-track-bg-color);inset:0}.bar{--progress-bar-bg-color:var(--typo3-component-primary-color);background:var(--progress-bar-bg-color);transition:width .5s ease-in-out}&.bar-warning{--progress-bar-bg-color:var(--bs-warning)}&.bar-danger{--progress-bar-bg-color:var(--bs-danger)}&.indeterminate{animation-name:progress-indeterminate;animation-duration:3s;animation-iteration-count:infinite;animation-timing-function:linear;width:33%;background-image:linear-gradient(to right,var(--progress-track-bg-color) 0,transparent 50%,var(--progress-track-bg-color) 100%)}.bar{position:absolute;height:var(--progress-bar-height);border-radius:var(--typo3-component-border-radius)}.label{margin-top:2px}`}render(){const r="progress-label-"+(Math.random()+1).toString(36).substring(2),e=void 0!==this.label&&this.label,a=isNaN(this.value),o="bar-"+p.getCssClass(this.severity),s=n({bar:!0,[o]:!a,indeterminate:a}),d=a?i:l({width:(this.clamp(this.value,0,this.max)/this.max*100).toString()+"%"})
return t`<div class="progress-wrapper"><div role="progressbar" class="progress" aria-valuenow="${a?i:this.value}" aria-valuemin="0" aria-valuemax="${this.max}" aria-describedby="${e?r:i}"><div class="track"></div><div class="${s}" style="${d}"></div></div>${e?t`<div class="label" id="${r}">${this.label}</div>`:i}</div>`}clamp(r,e,t){return Math.min(t,Math.max(e,r))}}
r([s({type:Number,reflect:!0})],c.prototype,"value",void 0),r([s({type:Number,reflect:!0})],c.prototype,"max",void 0),r([s({type:Number,reflect:!0})],c.prototype,"severity",void 0),r([s({type:String,reflect:!0})],c.prototype,"label",void 0),c=r([o("typo3-backend-progress-bar")],c)
export{c as ProgressBarElement}
