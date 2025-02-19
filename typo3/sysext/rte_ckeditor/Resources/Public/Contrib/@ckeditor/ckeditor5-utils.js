import{isObject as t,isString as e,isPlainObject as n,cloneDeepWith as r,isElement as o,isFunction as i,merge as s}from"lodash-es";
/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */let l;try{l={window,document}}catch(t){
/* istanbul ignore next -- @preserve */
l={window:{},document:{}}}var c=l;
/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */function a(){try{return navigator.userAgent.toLowerCase()}catch(t){return""}}const u=a(),h={isMac:f(u),isWindows:d(u),isGecko:p(u),isSafari:m(u),isiOS:g(u),isAndroid:b(u),isBlink:_(u),get isMediaForcedColors(){return!!c.window.matchMedia&&c.window.matchMedia("(forced-colors: active)").matches},get isMotionReduced(){return!!c.window.matchMedia&&c.window.matchMedia("(prefers-reduced-motion)").matches},features:{isRegExpUnicodePropertySupported:w()}};function f(t){return t.indexOf("macintosh")>-1}function d(t){return t.indexOf("windows")>-1}function p(t){return!!t.match(/gecko\/\d+/)}function m(t){return t.indexOf(" applewebkit/")>-1&&-1===t.indexOf("chrome")}function g(t){return!!t.match(/iphone|ipad/i)||f(t)&&navigator.maxTouchPoints>0}function b(t){return t.indexOf("android")>-1}function _(t){return t.indexOf("chrome/")>-1&&t.indexOf("edge/")<0}function w(){let t=!1;try{t=0==="ć".search(new RegExp("[\\p{L}]","u"))}catch(t){}return t}
/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
function y(t,e,n,r){n=n||function(t,e){return t===e};const o=Array.isArray(t)?t:Array.prototype.slice.call(t),i=Array.isArray(e)?e:Array.prototype.slice.call(e),s=function(t,e,n){const r=v(t,e,n);if(-1===r)return{firstIndex:-1,lastIndexOld:-1,lastIndexNew:-1};const o=E(t,r),i=E(e,r),s=v(o,i,n),l=t.length-s,c=e.length-s;return{firstIndex:r,lastIndexOld:l,lastIndexNew:c}}(o,i,n),l=r?function(t,e){const{firstIndex:n,lastIndexOld:r,lastIndexNew:o}=t;if(-1===n)return Array(e).fill("equal");let i=[];n>0&&(i=i.concat(Array(n).fill("equal")));o-n>0&&(i=i.concat(Array(o-n).fill("insert")));r-n>0&&(i=i.concat(Array(r-n).fill("delete")));o<e&&(i=i.concat(Array(e-o).fill("equal")));return i}
/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */(s,i.length):function(t,e){const n=[],{firstIndex:r,lastIndexOld:o,lastIndexNew:i}=e;i-r>0&&n.push({index:r,type:"insert",values:t.slice(r,i)});o-r>0&&n.push({index:r+(i-r),type:"delete",howMany:o-r});return n}(i,s);return l}function v(t,e,n){for(let r=0;r<Math.max(t.length,e.length);r++)if(void 0===t[r]||void 0===e[r]||!n(t[r],e[r]))return r;return-1}function E(t,e){return t.slice(e).reverse()}function T(t,e,n){n=n||function(t,e){return t===e};const r=t.length,o=e.length;if(r>200||o>200||r+o>300)return T.fastDiff(t,e,n,!0);let i,s;if(o<r){const n=t;t=e,e=n,i="delete",s="insert"}else i="insert",s="delete";const l=t.length,c=e.length,a=c-l,u={},h={};function f(r){const o=(void 0!==h[r-1]?h[r-1]:-1)+1,a=void 0!==h[r+1]?h[r+1]:-1,f=o>a?-1:1;u[r+f]&&(u[r]=u[r+f].slice(0)),u[r]||(u[r]=[]),u[r].push(o>a?i:s);let d=Math.max(o,a),p=d-r;for(;p<l&&d<c&&n(t[p],e[d]);)p++,d++,u[r].push("equal");return d}let d,p=0;do{for(d=-p;d<a;d++)h[d]=f(d);for(d=a+p;d>a;d--)h[d]=f(d);h[a]=f(a),p++}while(h[a]!==c);return u[a].slice(1)}
/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
function x(t,e){const n=[];let r=0,o=null;return t.forEach((t=>{"equal"==t?(i(),r++):"insert"==t?(o&&"insert"==o.type?o.values.push(e[r]):(i(),o={type:"insert",index:r,values:[e[r]]}),r++):o&&"delete"==o.type?o.howMany++:(i(),o={type:"delete",index:r,howMany:1})})),i(),n;function i(){o&&(n.push(o),o=null)}}
/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */function k(t,...e){e.forEach((e=>{const n=Object.getOwnPropertyNames(e),r=Object.getOwnPropertySymbols(e);n.concat(r).forEach((n=>{if(n in t.prototype)return;if("function"==typeof e&&("length"==n||"name"==n||"prototype"==n))return;const r=Object.getOwnPropertyDescriptor(e,n);r.enumerable=!1,Object.defineProperty(t.prototype,n,r)}))}))}
/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */T.fastDiff=y;
/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
class I{constructor(t,e){this.source=t,this.name=e,this.path=[],this.stop=function t(){t.called=!0},this.off=function t(){t.called=!0}}}
/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */const O=new Array(256).fill("").map(((t,e)=>("0"+e.toString(16)).slice(-2)));function L(){const[t,e,n,r]=crypto.getRandomValues(new Uint32Array(4));return"e"+O[255&t]+O[t>>8&255]+O[t>>16&255]+O[t>>24&255]+O[255&e]+O[e>>8&255]+O[e>>16&255]+O[e>>24&255]+O[255&n]+O[n>>8&255]+O[n>>16&255]+O[n>>24&255]+O[255&r]+O[r>>8&255]+O[r>>16&255]+O[r>>24&255]}
/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */const A={get(t="normal"){return"number"!=typeof t?this[t]||this.normal:t},highest:1e5,high:1e3,normal:0,low:-1e3,lowest:-1e5};
/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */function C(t,e){const n=A.get(e.priority);let r=0,o=t.length;for(;r<o;){const e=r+o>>1;A.get(t[e].priority)<n?o=e:r=e+1}t.splice(r,0,e)}
/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */class M extends Error{constructor(t,e,n){super(function(t,e){const n=new WeakSet,r=(t,e)=>{if("object"==typeof e&&null!==e){if(n.has(e))return`[object ${e.constructor.name}]`;n.add(e)}return e},o=e?` ${JSON.stringify(e,r)}`:"",i=N(t);return t+o+i}(t,n)),this.name="CKEditorError",this.context=e,this.data=n}is(t){return"CKEditorError"===t}static rethrowUnexpectedError(t,e){if(t.is&&t.is("CKEditorError"))throw t;const n=new M(t.message,e);throw n.stack=t.stack,n}}function S(t,e){console.warn(...j(t,e))}function R(t,e){console.error(...j(t,e))}function N(t){return`\nRead more: https://ckeditor.com/docs/ckeditor5/latest/support/error-codes.html#error-${t}`}function j(t,e){const n=N(t);return e?[t,e,n]:[t,n]}
/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */const P="44.1.0",D=new Date(2024,11,16);
/* istanbul ignore next -- @preserve */
if(globalThis.CKEDITOR_VERSION)throw new M("ckeditor-duplicated-modules",null);
/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */globalThis.CKEDITOR_VERSION=P;const B=Symbol("listeningTo"),F=Symbol("emitterId"),V=Symbol("delegations"),W=H(Object);function H(t){if(!t)return W;return class extends t{on(t,e,n){this.listenTo(this,t,e,n)}once(t,e,n){let r=!1;this.listenTo(this,t,((t,...n)=>{r||(r=!0,t.off(),e.call(this,t,...n))}),n)}off(t,e){this.stopListening(this,t,e)}listenTo(t,e,n,r={}){let o,i;this[B]||(this[B]={});const s=this[B];U(t)||K(t);const l=U(t);(o=s[l])||(o=s[l]={emitter:t,callbacks:{}}),(i=o.callbacks[e])||(i=o.callbacks[e]=[]),i.push(n),function(t,e,n,r,o){e._addEventListener?e._addEventListener(n,r,o):t._addEventListener.call(e,n,r,o)}(this,t,e,n,r)}stopListening(t,e,n){const r=this[B];let o=t&&U(t);const i=r&&o?r[o]:void 0,s=i&&e?i.callbacks[e]:void 0;if(!(!r||t&&!i||e&&!s))if(n){z(this,t,e,n);-1!==s.indexOf(n)&&(1===s.length?delete i.callbacks[e]:z(this,t,e,n))}else if(s){for(;n=s.pop();)z(this,t,e,n);delete i.callbacks[e]}else if(i){for(e in i.callbacks)this.stopListening(t,e);delete r[o]}else{for(o in r)this.stopListening(r[o].emitter);delete this[B]}}fire(t,...e){try{const n=t instanceof I?t:new I(this,t),r=n.name;let o=function(t,e){if(!t._events)return null;let n=e;do{const e=t._events[n];if(e&&e.callbacks&&e.callbacks.length)return e.callbacks;const r=n.lastIndexOf(":");n=r>-1?n.substring(0,r):""}while(n);return null}(this,r);if(n.path.push(this),o){o=o.slice();for(let t=0;t<o.length;t++){const i=o[t].callback;if(i.call(this,n,...e),n.off.called&&(delete n.off.called,this._removeEventListener(r,i)),n.stop.called)break}}const i=this[V];if(i){const t=i.get(r),o=i.get("*");t&&$(t,n,e),o&&$(o,n,e)}return n.return}catch(t){
/* istanbul ignore next -- @preserve */
M.rethrowUnexpectedError(t,this)}}delegate(...t){return{to:(e,n)=>{this[V]||(this[V]=new Map),t.forEach((t=>{const r=this[V].get(t);r?r.set(e,n):this[V].set(t,new Map([[e,n]]))}))}}}stopDelegating(t,e){if(this[V])if(t)if(e){const n=this[V].get(t);n&&n.delete(e)}else this[V].delete(t);else this[V].clear()}_addEventListener(t,e,n){!function(t,e){const n=Y(t);if(n[e])return;let r=e,o=null;const i=[];for(;""!==r&&!n[r];)n[r]={callbacks:[],childEvents:[]},i.push(n[r]),o&&n[r].childEvents.push(o),o=r,r=r.substr(0,r.lastIndexOf(":"));if(""!==r){for(const t of i)t.callbacks=n[r].callbacks.slice();n[r].childEvents.push(o)}}(this,t);const r=q(this,t),o={callback:e,priority:A.get(n.priority)};for(const t of r)C(t,o)}_removeEventListener(t,e){const n=q(this,t);for(const t of n)for(let n=0;n<t.length;n++)t[n].callback==e&&(t.splice(n,1),n--)}}}function K(t,e){t[F]||(t[F]=e||L())}function U(t){return t[F]}function Y(t){return t._events||Object.defineProperty(t,"_events",{value:{}}),t._events}function q(t,e){const n=Y(t)[e];if(!n)return[];let r=[n.callbacks];for(let e=0;e<n.childEvents.length;e++){const o=q(t,n.childEvents[e]);r=r.concat(o)}return r}function $(t,e,n){for(let[r,o]of t){o?"function"==typeof o&&(o=o(e.name)):o=e.name;const t=new I(e.source,o);t.path=[...e.path],r.fire(t,...n)}}function z(t,e,n,r){e._removeEventListener?e._removeEventListener(n,r):t._removeEventListener.call(e,n,r)}
/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */["on","once","off","listenTo","stopListening","fire","delegate","stopDelegating","_addEventListener","_removeEventListener"].forEach((t=>{H[t]=W.prototype[t]}));const G=Symbol("observableProperties"),X=Symbol("boundObservables"),J=Symbol("boundProperties"),Q=Symbol("decoratedMethods"),Z=Symbol("decoratedOriginal"),tt=et(H());function et(e){if(!e)return tt;return class extends e{set(e,n){if(t(e))return void Object.keys(e).forEach((t=>{this.set(t,e[t])}),this);nt(this);const r=this[G];if(e in this&&!r.has(e))throw new M("observable-set-cannot-override",this);Object.defineProperty(this,e,{enumerable:!0,configurable:!0,get:()=>r.get(e),set(t){const n=r.get(e);let o=this.fire(`set:${e}`,e,t,n);void 0===o&&(o=t),n===o&&r.has(e)||(r.set(e,o),this.fire(`change:${e}`,e,o,n))}}),this[e]=n}bind(...t){if(!t.length||!it(t))throw new M("observable-bind-wrong-properties",this);if(new Set(t).size!==t.length)throw new M("observable-bind-duplicate-properties",this);nt(this);const e=this[J];t.forEach((t=>{if(e.has(t))throw new M("observable-bind-rebind",this)}));const n=new Map;return t.forEach((t=>{const r={property:t,to:[]};e.set(t,r),n.set(t,r)})),{to:rt,toMany:ot,_observable:this,_bindProperties:t,_to:[],_bindings:n}}unbind(...t){if(!this[G])return;const e=this[J],n=this[X];if(t.length){if(!it(t))throw new M("observable-unbind-wrong-properties",this);t.forEach((t=>{const r=e.get(t);r&&(r.to.forEach((([t,e])=>{const o=n.get(t),i=o[e];i.delete(r),i.size||delete o[e],Object.keys(o).length||(n.delete(t),this.stopListening(t,"change"))})),e.delete(t))}))}else n.forEach(((t,e)=>{this.stopListening(e,"change")})),n.clear(),e.clear()}decorate(t){nt(this);const e=this[t];if(!e)throw new M("observablemixin-cannot-decorate-undefined",this,{object:this,methodName:t});this.on(t,((t,n)=>{t.return=e.apply(this,n)})),this[t]=function(...e){return this.fire(t,e)},this[t][Z]=e,this[Q]||(this[Q]=[]),this[Q].push(t)}stopListening(t,e,n){if(!t&&this[Q]){for(const t of this[Q])this[t]=this[t][Z];delete this[Q]}super.stopListening(t,e,n)}}}function nt(t){t[G]||(Object.defineProperty(t,G,{value:new Map}),Object.defineProperty(t,X,{value:new Map}),Object.defineProperty(t,J,{value:new Map}))}function rt(...t){const e=function(...t){if(!t.length)throw new M("observable-bind-to-parse-error",null);const e={to:[]};let n;"function"==typeof t[t.length-1]&&(e.callback=t.pop());return t.forEach((t=>{if("string"==typeof t)n.properties.push(t);else{if("object"!=typeof t)throw new M("observable-bind-to-parse-error",null);n={observable:t,properties:[]},e.to.push(n)}})),e}(...t),n=Array.from(this._bindings.keys()),r=n.length;if(!e.callback&&e.to.length>1)throw new M("observable-bind-to-no-callback",this);if(r>1&&e.callback)throw new M("observable-bind-to-extra-callback",this);var o;
/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */e.to.forEach((t=>{if(t.properties.length&&t.properties.length!==r)throw new M("observable-bind-to-properties-length",this);t.properties.length||(t.properties=this._bindProperties)})),this._to=e.to,e.callback&&(this._bindings.get(n[0]).callback=e.callback),o=this._observable,this._to.forEach((t=>{const e=o[X];let n;e.get(t.observable)||o.listenTo(t.observable,"change",((r,i)=>{n=e.get(t.observable)[i],n&&n.forEach((t=>{st(o,t.property)}))}))})),function(t){let e;t._bindings.forEach(((n,r)=>{t._to.forEach((o=>{e=o.properties[n.callback?0:t._bindProperties.indexOf(r)],n.to.push([o.observable,e]),function(t,e,n,r){const o=t[X],i=o.get(n),s=i||{};s[r]||(s[r]=new Set);s[r].add(e),i||o.set(n,s)}(t._observable,n,o.observable,e)}))}))}(this),this._bindProperties.forEach((t=>{st(this._observable,t)}))}function ot(t,e,n){if(this._bindings.size>1)throw new M("observable-bind-to-many-not-one-binding",this);this.to(...function(t,e){const n=t.map((t=>[t,e]));return Array.prototype.concat.apply([],n)}(t,e),n)}function it(t){return t.every((t=>"string"==typeof t))}function st(t,e){const n=t[J].get(e);let r;n.callback?r=n.callback.apply(t,n.to.map((t=>t[0][t[1]]))):(r=n.to[0],r=r[0][r[1]]),Object.prototype.hasOwnProperty.call(t,e)?t[e]=r:t.set(e,r)}["set","bind","unbind","decorate","on","once","off","listenTo","stopListening","fire","delegate","stopDelegating","_addEventListener","_removeEventListener"].forEach((t=>{et[t]=tt.prototype[t]}));class lt{constructor(){this._replacedElements=[]}replace(t,e){this._replacedElements.push({element:t,newElement:e}),t.style.display="none",e&&t.parentNode.insertBefore(e,t.nextSibling)}restore(){this._replacedElements.forEach((({element:t,newElement:e})=>{t.style.display="",e&&e.remove()})),this._replacedElements=[]}}
/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */function ct(t){let e=new AbortController;function n(...n){return e.abort(),e=new AbortController,t(e.signal,...n)}return n.abort=()=>e.abort(),n}
/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */function at(t){let e=0;for(const n of t)e++;return e}
/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */function ut(t,e){const n=Math.min(t.length,e.length);for(let r=0;r<n;r++)if(t[r]!=e[r])return r;return t.length==e.length?"same":t.length<e.length?"prefix":"extension"}
/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */function ht(t){return!(!t||!t[Symbol.iterator])}
/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */function ft(t,n,r={},o=[]){const i=r&&r.xmlns,s=i?t.createElementNS(i,n):t.createElement(n);for(const t in r)s.setAttribute(t,r[t]);!e(o)&&ht(o)||(o=[o]);for(let n of o)e(n)&&(n=t.createTextNode(n)),s.appendChild(n);return s}
/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */class dt{constructor(t,e){this._config=Object.create(null),e&&this.define(pt(e)),t&&this._setObjectToTarget(this._config,t)}set(t,e){this._setToTarget(this._config,t,e)}define(t,e){this._setToTarget(this._config,t,e,!0)}get(t){return this._getFromSource(this._config,t)}*names(){for(const t of Object.keys(this._config))yield t}_setToTarget(t,e,r,o=!1){if(n(e))return void this._setObjectToTarget(t,e,o);const i=e.split(".");e=i.pop();for(const e of i)n(t[e])||(t[e]=Object.create(null)),t=t[e];if(n(r))return n(t[e])||(t[e]=Object.create(null)),t=t[e],void this._setObjectToTarget(t,r,o);o&&void 0!==t[e]||(t[e]=r)}_getFromSource(t,e){const r=e.split(".");e=r.pop();for(const e of r){if(!n(t[e])){t=null;break}t=t[e]}return t?pt(t[e]):void 0}_setObjectToTarget(t,e,n){Object.keys(e).forEach((r=>{this._setToTarget(t,r,e[r],n)}))}}function pt(t){return r(t,mt)}function mt(t){return o(t)||"function"==typeof t?t:void 0}
/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */function gt(t){if(t){if(t.defaultView)return t instanceof t.defaultView.Document;if(t.ownerDocument&&t.ownerDocument.defaultView)return t instanceof t.ownerDocument.defaultView.Node}return!1}
/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */function bt(t){const e=Object.prototype.toString.apply(t);return"[object Window]"==e||"[object global]"==e}
/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */const _t=wt(H());function wt(t){if(!t)return _t;return class extends t{listenTo(t,e,n,r={}){if(gt(t)||bt(t)){const o={capture:!!r.useCapture,passive:!!r.usePassive},i=this._getProxyEmitter(t,o)||new yt(t,o);this.listenTo(i,e,n,r)}else super.listenTo(t,e,n,r)}stopListening(t,e,n){if(gt(t)||bt(t)){const r=this._getAllProxyEmitters(t);for(const t of r)this.stopListening(t,e,n)}else super.stopListening(t,e,n)}_getProxyEmitter(t,e){return function(t,e){const n=t[B];return n&&n[e]?n[e].emitter:null}(this,vt(t,e))}_getAllProxyEmitters(t){return[{capture:!1,passive:!1},{capture:!1,passive:!0},{capture:!0,passive:!1},{capture:!0,passive:!0}].map((e=>this._getProxyEmitter(t,e))).filter((t=>!!t))}}}["_getProxyEmitter","_getAllProxyEmitters","on","once","off","listenTo","stopListening","fire","delegate","stopDelegating","_addEventListener","_removeEventListener"].forEach((t=>{wt[t]=_t.prototype[t]}));class yt extends(H()){constructor(t,e){super(),K(this,vt(t,e)),this._domNode=t,this._options=e}attach(t){if(this._domListeners&&this._domListeners[t])return;const e=this._createDomListener(t);this._domNode.addEventListener(t,e,this._options),this._domListeners||(this._domListeners={}),this._domListeners[t]=e}detach(t){let e;!this._domListeners[t]||(e=this._events[t])&&e.callbacks.length||this._domListeners[t].removeListener()}_addEventListener(t,e,n){this.attach(t),H().prototype._addEventListener.call(this,t,e,n)}_removeEventListener(t,e){H().prototype._removeEventListener.call(this,t,e),this.detach(t)}_createDomListener(t){const e=e=>{this.fire(t,e)};return e.removeListener=()=>{this._domNode.removeEventListener(t,e,this._options),delete this._domListeners[t]},e}}function vt(t,e){let n=function(t){return t["data-ck-expando"]||(t["data-ck-expando"]=L())}(t);for(const t of Object.keys(e).sort())e[t]&&(n+="-"+t);return n}
/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */function Et(t){let e=t.parentElement;if(!e)return null;for(;"BODY"!=e.tagName;){const t=e.style.overflowY||c.window.getComputedStyle(e).overflowY;if("auto"===t||"scroll"===t)break;if(e=e.parentElement,!e)return null}return e}
/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */function Tt(t){const e=[];let n=t;for(;n&&n.nodeType!=Node.DOCUMENT_NODE;)e.unshift(n),n=n.parentNode;return e}
/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */function xt(t){return t instanceof HTMLTextAreaElement?t.value:t.innerHTML}
/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */function kt(t){const e=t.ownerDocument.defaultView.getComputedStyle(t);return{top:parseInt(e.borderTopWidth,10),right:parseInt(e.borderRightWidth,10),bottom:parseInt(e.borderBottomWidth,10),left:parseInt(e.borderLeftWidth,10)}}
/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */function It(t){if(!t.target)return null;const e=t.target.ownerDocument,n=t.clientX,r=t.clientY;let o=null;return e.caretRangeFromPoint&&e.caretRangeFromPoint(n,r)?o=e.caretRangeFromPoint(n,r):t.rangeParent&&(o=e.createRange(),o.setStart(t.rangeParent,t.rangeOffset),o.collapse(!0)),o}
/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */function Ot(t){return"[object Text]"==Object.prototype.toString.call(t)}
/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */function Lt(t){return"[object Range]"==Object.prototype.toString.apply(t)}
/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */function At(t){return t&&t.parentNode?t.offsetParent===c.document.body?null:t.offsetParent:null}
/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */const Ct=["top","right","bottom","left","width","height"];class Mt{constructor(t){const e=Lt(t);if(Object.defineProperty(this,"_source",{value:t._source||t,writable:!0,enumerable:!1}),Nt(t)||e)if(e){const e=Mt.getDomRangeRects(t);St(this,Mt.getBoundingRect(e))}else St(this,t.getBoundingClientRect());else if(bt(t)){const{innerWidth:e,innerHeight:n}=t;St(this,{top:0,right:e,bottom:n,left:0,width:e,height:n})}else St(this,t)}clone(){return new Mt(this)}moveTo(t,e){return this.top=e,this.right=t+this.width,this.bottom=e+this.height,this.left=t,this}moveBy(t,e){return this.top+=e,this.right+=t,this.left+=t,this.bottom+=e,this}getIntersection(t){const e={top:Math.max(this.top,t.top),right:Math.min(this.right,t.right),bottom:Math.min(this.bottom,t.bottom),left:Math.max(this.left,t.left),width:0,height:0};if(e.width=e.right-e.left,e.height=e.bottom-e.top,e.width<0||e.height<0)return null;{const t=new Mt(e);return t._source=this._source,t}}getIntersectionArea(t){const e=this.getIntersection(t);return e?e.getArea():0}getArea(){return this.width*this.height}getVisible(){const t=this._source;let e=this.clone();if(Rt(t))return e;let n,r=t,o=t.parentNode||t.commonAncestorContainer;for(;o&&!Rt(o);){const t="visible"===((i=o)instanceof HTMLElement?i.ownerDocument.defaultView.getComputedStyle(i).overflow:"visible");r instanceof HTMLElement&&"absolute"===jt(r)&&(n=r);const s=jt(o);if(t||n&&("relative"===s&&t||"relative"!==s)){r=o,o=o.parentNode;continue}const l=new Mt(o),c=e.getIntersection(l);if(!c)return null;c.getArea()<e.getArea()&&(e=c),r=o,o=o.parentNode}var i;return e}isEqual(t){for(const e of Ct)if(this[e]!==t[e])return!1;return!0}contains(t){const e=this.getIntersection(t);return!(!e||!e.isEqual(t))}toAbsoluteRect(){const{scrollX:t,scrollY:e}=c.window,n=this.clone().moveBy(t,e);if(Nt(n._source)){const t=At(n._source);t&&function(t,e){const n=new Mt(e),r=kt(e);let o=0,i=0;o-=n.left,i-=n.top,o+=e.scrollLeft,i+=e.scrollTop,o-=r.left,i-=r.top,t.moveBy(o,i)}
/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */(n,t)}return n}excludeScrollbarsAndBorders(){const t=this._source;let e,n,r;if(bt(t))e=t.innerWidth-t.document.documentElement.clientWidth,n=t.innerHeight-t.document.documentElement.clientHeight,r=t.getComputedStyle(t.document.documentElement).direction;else{const o=kt(t);e=t.offsetWidth-t.clientWidth-o.left-o.right,n=t.offsetHeight-t.clientHeight-o.top-o.bottom,r=t.ownerDocument.defaultView.getComputedStyle(t).direction,this.left+=o.left,this.top+=o.top,this.right-=o.right,this.bottom-=o.bottom,this.width=this.right-this.left,this.height=this.bottom-this.top}return this.width-=e,"ltr"===r?this.right-=e:this.left+=e,this.height-=n,this.bottom-=n,this}static getDomRangeRects(t){const e=[],n=Array.from(t.getClientRects());if(n.length)for(const t of n)e.push(new Mt(t));else{let n=t.startContainer;Ot(n)&&(n=n.parentNode);const r=new Mt(n.getBoundingClientRect());r.right=r.left,r.width=0,e.push(r)}return e}static getBoundingRect(t){const e={left:Number.POSITIVE_INFINITY,top:Number.POSITIVE_INFINITY,right:Number.NEGATIVE_INFINITY,bottom:Number.NEGATIVE_INFINITY,width:0,height:0};let n=0;for(const r of t)n++,e.left=Math.min(e.left,r.left),e.top=Math.min(e.top,r.top),e.right=Math.max(e.right,r.right),e.bottom=Math.max(e.bottom,r.bottom);return 0==n?null:(e.width=e.right-e.left,e.height=e.bottom-e.top,new Mt(e))}}function St(t,e){for(const n of Ct)t[n]=e[n]}function Rt(t){return!!Nt(t)&&t===t.ownerDocument.body}function Nt(t){return null!==t&&"object"==typeof t&&1===t.nodeType&&"function"==typeof t.getBoundingClientRect}function jt(t){return t instanceof HTMLElement?t.ownerDocument.defaultView.getComputedStyle(t).position:"static"}class Pt{constructor(t,e){Pt._observerInstance||Pt._createObserver(),this._element=t,this._callback=e,Pt._addElementCallback(t,e),Pt._observerInstance.observe(t)}get element(){return this._element}destroy(){Pt._deleteElementCallback(this._element,this._callback)}static _addElementCallback(t,e){Pt._elementCallbacks||(Pt._elementCallbacks=new Map);let n=Pt._elementCallbacks.get(t);n||(n=new Set,Pt._elementCallbacks.set(t,n)),n.add(e)}static _deleteElementCallback(t,e){const n=Pt._getElementCallbacks(t);n&&(n.delete(e),n.size||(Pt._elementCallbacks.delete(t),Pt._observerInstance.unobserve(t))),Pt._elementCallbacks&&!Pt._elementCallbacks.size&&(Pt._observerInstance=null,Pt._elementCallbacks=null)}static _getElementCallbacks(t){return Pt._elementCallbacks?Pt._elementCallbacks.get(t):null}static _createObserver(){Pt._observerInstance=new c.window.ResizeObserver((t=>{for(const e of t){const t=Pt._getElementCallbacks(e.target);if(t)for(const n of t)n(e)}}))}}
/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
function Dt(t,e){t instanceof HTMLTextAreaElement&&(t.value=e),t.innerHTML=e}
/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */function Bt(t){return e=>e+t}
/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */function Ft(t){let e=0;for(;t.previousSibling;)t=t.previousSibling,e++;return e}
/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */function Vt(t,e,n){t.insertBefore(n,t.childNodes[e]||null)}
/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */function Wt(t){return t&&t.nodeType===Node.COMMENT_NODE}
/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */function Ht(t){try{c.document.createAttribute(t)}catch(t){return!1}return!0}
/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */function Kt(t){return!!t&&(Ot(t)?Kt(t.parentElement):!!t.getClientRects&&!!t.getClientRects().length)}
/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */function Ut({element:t,target:e,positions:n,limiter:r,fitInViewport:o,viewportOffsetConfig:s}){i(e)&&(e=e()),i(r)&&(r=r());const l=At(t),a=function(t){t=Object.assign({top:0,bottom:0,left:0,right:0},t);const e=new Mt(c.window);return e.top+=t.top,e.height-=t.top,e.bottom-=t.bottom,e.height-=t.bottom,e}(s),u=new Mt(t),h=Yt(e,a);let f;if(!h||!a.getIntersection(h))return null;const d={targetRect:h,elementRect:u,positionedElementAncestor:l,viewportRect:a};if(r||o){if(r){const t=Yt(r,a);t&&(d.limiterRect=t)}f=function(t,e){const{elementRect:n}=e,r=n.getArea(),o=t.map((t=>new qt(t,e))).filter((t=>!!t.name));let i=0,s=null;for(const t of o){const{limiterIntersectionArea:e,viewportIntersectionArea:n}=t;if(e===r)return t;const o=n**2+e**2;o>i&&(i=o,s=t)}return s}(n,d)}else f=new qt(n[0],d);return f}function Yt(t,e){const n=new Mt(t).getVisible();return n?n.getIntersection(e):null}Pt._observerInstance=null,Pt._elementCallbacks=null;class qt{constructor(t,e){const n=t(e.targetRect,e.elementRect,e.viewportRect,e.limiterRect);if(!n)return;const{left:r,top:o,name:i,config:s}=n;this.name=i,this.config=s,this._positioningFunctionCoordinates={left:r,top:o},this._options=e}get left(){return this._absoluteRect.left}get top(){return this._absoluteRect.top}get limiterIntersectionArea(){const t=this._options.limiterRect;return t?t.getIntersectionArea(this._rect):0}get viewportIntersectionArea(){return this._options.viewportRect.getIntersectionArea(this._rect)}get _rect(){return this._cachedRect||(this._cachedRect=this._options.elementRect.clone().moveTo(this._positioningFunctionCoordinates.left,this._positioningFunctionCoordinates.top)),this._cachedRect}get _absoluteRect(){return this._cachedAbsoluteRect||(this._cachedAbsoluteRect=this._rect.toAbsoluteRect()),this._cachedAbsoluteRect}}
/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */function $t(t){const e=t.parentNode;e&&e.removeChild(t)}
/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */function zt({target:t,viewportOffset:e=0,ancestorOffset:n=0,alignToTop:r,forceScroll:o}){const i=ne(t);let s=i,l=null;for(e=function(t){if("number"==typeof t)return{top:t,bottom:t,left:t,right:t};return t}
/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */(e);s;){let c;c=re(s==i?t:l),Jt({parent:c,getRect:()=>oe(t,s),alignToTop:r,ancestorOffset:n,forceScroll:o});let a=oe(t,s);const u=oe(c,s);if(a.height>u.height){const t=a.getIntersection(u);t&&(a=t)}if(Xt({window:s,rect:a,viewportOffset:e,alignToTop:r,forceScroll:o}),s.parent!=s){if(l=s.frameElement,s=s.parent,!l)return}else s=null}}function Gt(t,e,n){Jt({parent:re(t),getRect:()=>new Mt(t),ancestorOffset:e,limiterElement:n})}function Xt({window:t,rect:e,alignToTop:n,forceScroll:r,viewportOffset:o}){const i=e.clone().moveBy(0,o.bottom),s=e.clone().moveBy(0,-o.top),l=new Mt(t).excludeScrollbarsAndBorders(),c=n&&r,a=[s,i].every((t=>l.contains(t)));let{scrollX:u,scrollY:h}=t;const f=u,d=h;c?h-=l.top-e.top+o.top:a||(Zt(s,l)?h-=l.top-e.top+o.top:Qt(i,l)&&(h+=n?e.top-l.top-o.top:e.bottom-l.bottom+o.bottom)),a||(te(e,l)?u-=l.left-e.left+o.left:ee(e,l)&&(u+=e.right-l.right+o.right)),u==f&&h===d||t.scrollTo(u,h)}function Jt({parent:t,getRect:e,alignToTop:n,forceScroll:r,ancestorOffset:o=0,limiterElement:i}){const s=ne(t),l=n&&r;let c,a,u;const h=i||s.document.body;for(;t!=h;)a=e(),c=new Mt(t).excludeScrollbarsAndBorders(),u=c.contains(a),l?t.scrollTop-=c.top-a.top+o:u||(Zt(a,c)?t.scrollTop-=c.top-a.top+o:Qt(a,c)&&(t.scrollTop+=n?a.top-c.top-o:a.bottom-c.bottom+o)),u||(te(a,c)?t.scrollLeft-=c.left-a.left+o:ee(a,c)&&(t.scrollLeft+=a.right-c.right+o)),t=t.parentNode}function Qt(t,e){return t.bottom>e.bottom}function Zt(t,e){return t.top<e.top}function te(t,e){return t.left<e.left}function ee(t,e){return t.right>e.right}function ne(t){return Lt(t)?t.startContainer.ownerDocument.defaultView:t.ownerDocument.defaultView}function re(t){if(Lt(t)){let e=t.commonAncestorContainer;return Ot(e)&&(e=e.parentNode),e}return t.parentNode}function oe(t,e){const n=ne(t),r=new Mt(t);if(n===e)return r;{let t=n;for(;t!=e;){const e=t.frameElement,n=new Mt(e).excludeScrollbarsAndBorders();r.moveBy(n.left,n.top),t=t.parent}}return r}const ie={ctrl:"⌃",cmd:"⌘",alt:"⌥",shift:"⇧"},se={ctrl:"Ctrl+",alt:"Alt+",shift:"Shift+"},le={37:"←",38:"↑",39:"→",40:"↓",9:"⇥",33:"Page Up",34:"Page Down"},ce=ge(),ae=Object.fromEntries(Object.entries(ce).map((([t,e])=>{let n;return n=e in le?le[e]:t.charAt(0).toUpperCase()+t.slice(1),[e,n]})));function ue(t){let e;if("string"==typeof t){if(e=ce[t.toLowerCase()],!e)throw new M("keyboard-unknown-key",null,{key:t})}else e=t.keyCode+(t.altKey?ce.alt:0)+(t.ctrlKey?ce.ctrl:0)+(t.shiftKey?ce.shift:0)+(t.metaKey?ce.cmd:0);return e}function he(t){return"string"==typeof t&&(t=function(t){return t.split("+").map((t=>t.trim()))}
/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */(t)),t.map((t=>"string"==typeof t?function(t){if(t.endsWith("!"))return ue(t.slice(0,-1));const e=ue(t);return(h.isMac||h.isiOS)&&e==ce.ctrl?ce.cmd:e}(t):t)).reduce(((t,e)=>e+t),0)}function fe(t){let e=he(t);return Object.entries(h.isMac||h.isiOS?ie:se).reduce(((t,[n,r])=>(e&ce[n]&&(e&=~ce[n],t+=r),t)),"")+(e?ae[e]:"")}function de(t){return t==ce.arrowright||t==ce.arrowleft||t==ce.arrowup||t==ce.arrowdown}function pe(t,e){const n="ltr"===e;switch(t){case ce.arrowleft:return n?"left":"right";case ce.arrowright:return n?"right":"left";case ce.arrowup:return"up";case ce.arrowdown:return"down"}}function me(t,e){const n=pe(t,e);return"down"===n||"right"===n}function ge(){const t={pageup:33,pagedown:34,arrowleft:37,arrowup:38,arrowright:39,arrowdown:40,backspace:8,delete:46,enter:13,space:32,esc:27,tab:9,ctrl:1114112,shift:2228224,alt:4456448,cmd:8912896};for(let e=65;e<=90;e++){t[String.fromCharCode(e).toLowerCase()]=e}for(let e=48;e<=57;e++)t[e-48]=e;for(let e=112;e<=123;e++)t["f"+(e-111)]=e;return Object.assign(t,{"'":222,",":108,"-":109,".":110,"/":111,";":186,"=":187,"[":219,"\\":220,"]":221,"`":223}),t}const be=["ar","ara","dv","div","fa","per","fas","he","heb","ku","kur","ug","uig"];function _e(t){return be.includes(t)?"rtl":"ltr"}
/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */function we(t){return Array.isArray(t)?t:[t]}
/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/* istanbul ignore else -- @preserve */function ye(t,e,n=1,r){if("number"!=typeof n)throw new M("translation-service-quantity-not-a-number",null,{quantity:n});const o=r||c.window.CKEDITOR_TRANSLATIONS,i=function(t){return Object.keys(t).length}
/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */(o);1===i&&(t=Object.keys(o)[0]);const s=e.id||e.string;if(0===i||!function(t,e,n){return!!n[t]&&!!n[t].dictionary[e]}(t,s,o))return 1!==n?e.plural:e.string;const l=o[t].dictionary,a=o[t].getPluralForm||(t=>1===t?0:1),u=l[s];if("string"==typeof u)return u;return u[Number(a(n))]}c.window.CKEDITOR_TRANSLATIONS||(c.window.CKEDITOR_TRANSLATIONS={});class ve{constructor({uiLanguage:t="en",contentLanguage:e,translations:n}={}){this.uiLanguage=t,this.contentLanguage=e||this.uiLanguage,this.uiLanguageDirection=_e(this.uiLanguage),this.contentLanguageDirection=_e(this.contentLanguage),this.translations=function(t){return Array.isArray(t)?t.reduce(((t,e)=>s(t,e))):t}(n),this.t=(t,e)=>this._t(t,e)}get language(){return console.warn("locale-deprecated-language-property: The Locale#language property has been deprecated and will be removed in the near future. Please use #uiLanguage and #contentLanguage properties instead."),this.uiLanguage}_t(t,e=[]){e=we(e),"string"==typeof t&&(t={string:t});const n=!!t.plural?e[0]:1;return function(t,e){return t.replace(/%(\d+)/g,((t,n)=>n<e.length?e[n]:t))}
/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */(ye(this.uiLanguage,t,n,this.translations),e)}}class Ee extends(H()){constructor(t={},e={}){super();const n=ht(t);if(n||(e=t),this._items=[],this._itemMap=new Map,this._idProperty=e.idProperty||"id",this._bindToExternalToInternalMap=new WeakMap,this._bindToInternalToExternalMap=new WeakMap,this._skippedIndexesFromExternal=[],n)for(const e of t)this._items.push(e),this._itemMap.set(this._getItemIdBeforeAdding(e),e)}get length(){return this._items.length}get first(){return this._items[0]||null}get last(){return this._items[this.length-1]||null}add(t,e){return this.addMany([t],e)}addMany(t,e){if(void 0===e)e=this._items.length;else if(e>this._items.length||e<0)throw new M("collection-add-item-invalid-index",this);let n=0;for(const r of t){const t=this._getItemIdBeforeAdding(r),o=e+n;this._items.splice(o,0,r),this._itemMap.set(t,r),this.fire("add",r,o),n++}return this.fire("change",{added:t,removed:[],index:e}),this}get(t){let e;if("string"==typeof t)e=this._itemMap.get(t);else{if("number"!=typeof t)throw new M("collection-get-invalid-arg",this);e=this._items[t]}return e||null}has(t){if("string"==typeof t)return this._itemMap.has(t);{const e=t[this._idProperty];return e&&this._itemMap.has(e)}}getIndex(t){let e;return e="string"==typeof t?this._itemMap.get(t):t,e?this._items.indexOf(e):-1}remove(t){const[e,n]=this._remove(t);return this.fire("change",{added:[],removed:[e],index:n}),e}map(t,e){return this._items.map(t,e)}forEach(t,e){this._items.forEach(t,e)}find(t,e){return this._items.find(t,e)}filter(t,e){return this._items.filter(t,e)}clear(){this._bindToCollection&&(this.stopListening(this._bindToCollection),this._bindToCollection=null);const t=Array.from(this._items);for(;this.length;)this._remove(0);this.fire("change",{added:[],removed:t,index:0})}bindTo(t){if(this._bindToCollection)throw new M("collection-bind-to-rebind",this);return this._bindToCollection=t,{as:t=>{this._setUpBindToBinding((e=>new t(e)))},using:t=>{"function"==typeof t?this._setUpBindToBinding(t):this._setUpBindToBinding((e=>e[t]))}}}_setUpBindToBinding(t){const e=this._bindToCollection,n=(n,r,o)=>{const i=e._bindToCollection==this,s=e._bindToInternalToExternalMap.get(r);if(i&&s)this._bindToExternalToInternalMap.set(r,s),this._bindToInternalToExternalMap.set(s,r);else{const n=t(r);if(!n)return void this._skippedIndexesFromExternal.push(o);let i=o;for(const t of this._skippedIndexesFromExternal)o>t&&i--;for(const t of e._skippedIndexesFromExternal)i>=t&&i++;this._bindToExternalToInternalMap.set(r,n),this._bindToInternalToExternalMap.set(n,r),this.add(n,i);for(let t=0;t<e._skippedIndexesFromExternal.length;t++)i<=e._skippedIndexesFromExternal[t]&&e._skippedIndexesFromExternal[t]++}};for(const t of e)n(0,t,e.getIndex(t));this.listenTo(e,"add",n),this.listenTo(e,"remove",((t,e,n)=>{const r=this._bindToExternalToInternalMap.get(e);r&&this.remove(r),this._skippedIndexesFromExternal=this._skippedIndexesFromExternal.reduce(((t,e)=>(n<e&&t.push(e-1),n>e&&t.push(e),t)),[])}))}_getItemIdBeforeAdding(t){const e=this._idProperty;let n;if(e in t){if(n=t[e],"string"!=typeof n)throw new M("collection-add-invalid-id",this);if(this.get(n))throw new M("collection-add-item-already-exists",this)}else t[e]=n=L();return n}_remove(t){let e,n,r,o=!1;const i=this._idProperty;if("string"==typeof t?(n=t,r=this._itemMap.get(n),o=!r,r&&(e=this._items.indexOf(r))):"number"==typeof t?(e=t,r=this._items[e],o=!r,r&&(n=r[i])):(r=t,n=r[i],e=this._items.indexOf(r),o=-1==e||!this._itemMap.get(n)),o)throw new M("collection-remove-404",this);this._items.splice(e,1),this._itemMap.delete(n);const s=this._bindToInternalToExternalMap.get(r);return this._bindToInternalToExternalMap.delete(r),this._bindToExternalToInternalMap.delete(s),this.fire("remove",r,e),[r,e]}[Symbol.iterator](){return this._items[Symbol.iterator]()}}
/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */function Te(t){const e=t.next();return e.done?null:e.value}
/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */class xe extends(wt(et())){constructor(){super(),this._elements=new Set,this._externalViews=new Set,this._blurTimeout=null,this.set("isFocused",!1),this.set("focusedElement",null)}get elements(){return Array.from(this._elements.values())}get externalViews(){return Array.from(this._externalViews.values())}add(t){if(Ie(t))this._addElement(t);else if(ke(t))this._addView(t);else{if(!t.element)throw new M("focustracker-add-view-missing-element",{focusTracker:this,view:t});this._addElement(t.element)}}remove(t){Ie(t)?this._removeElement(t):ke(t)?this._removeView(t):this._removeElement(t.element)}_addElement(t){if(this._elements.has(t))throw new M("focustracker-add-element-already-exist",this);this.listenTo(t,"focus",(()=>{const e=this.externalViews.find((e=>function(t,e){if(Oe(t,e))return!0;return!!e.focusTracker.externalViews.find((e=>Oe(t,e)))}(t,e)));e?this._focus(e.element):this._focus(t)}),{useCapture:!0}),this.listenTo(t,"blur",(()=>{this._blur()}),{useCapture:!0}),this._elements.add(t)}_removeElement(t){this._elements.has(t)&&(this.stopListening(t),this._elements.delete(t)),t===this.focusedElement&&this._blur()}_addView(t){t.element&&this._addElement(t.element),this.listenTo(t.focusTracker,"change:focusedElement",(()=>{t.focusTracker.focusedElement?t.element&&this._focus(t.element):this._blur()})),this._externalViews.add(t)}_removeView(t){t.element&&this._removeElement(t.element),this.stopListening(t.focusTracker),this._externalViews.delete(t)}destroy(){this.stopListening(),this._elements.clear(),this._externalViews.clear(),this.isFocused=!1,this.focusedElement=null}_focus(t){this._clearBlurTimeout(),this.focusedElement=t,this.isFocused=!0}_blur(){if(this.elements.find((t=>t.contains(document.activeElement))))return;this.externalViews.find((t=>t.focusTracker.isFocused&&!t.focusTracker._blurTimeout))||(this._clearBlurTimeout(),this._blurTimeout=setTimeout((()=>{this.focusedElement=null,this.isFocused=!1}),0))}_clearBlurTimeout(){clearTimeout(this._blurTimeout),this._blurTimeout=null}}function ke(t){return"focusTracker"in t&&t.focusTracker instanceof xe}function Ie(t){return o(t)}function Oe(t,e){return!!e.element&&e.element.contains(document.activeElement)&&t.contains(e.element)}
/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */class Le{constructor(){this._listener=new(wt())}listenTo(t){this._listener.listenTo(t,"keydown",((t,e)=>{this._listener.fire("_keydown:"+ue(e),e)}))}set(t,e,n={}){const r=he(t),o=n.priority;this._listener.listenTo(this._listener,"_keydown:"+r,((t,r)=>{n.filter&&!n.filter(r)||(e(r,(()=>{r.preventDefault(),r.stopPropagation(),t.stop()})),t.return=!0)}),{priority:o})}press(t){return!!this._listener.fire("_keydown:"+ue(t),t)}stopListening(t){this._listener.stopListening(t)}destroy(){this.stopListening()}}
/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
function Ae(t){return ht(t)?new Map(t):function(t){const e=new Map;for(const n in t)e.set(n,t[n]);return e}(t)}
/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */function Ce(t,e={}){return new Promise(((n,r)=>{const o=e.signal||(new AbortController).signal;o.throwIfAborted();const i=setTimeout((function(){o.removeEventListener("abort",s),n()}),t);function s(){clearTimeout(i),r(o.reason)}o.addEventListener("abort",s,{once:!0})}))}
/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */async function Me(t,e={}){const{maxAttempts:n=4,retryDelay:r=Se(),signal:o=(new AbortController).signal}=e;o.throwIfAborted();for(let e=0;;e++){try{return await t()}catch(t){if(e+1>=n)throw t}await Ce(r(e),{signal:o})}}function Se(t={}){const{delay:e=1e3,factor:n=2,maxDelay:r=1e4}=t;return t=>Math.min(n**t*e,r)}
/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */function Re(t,e,n){const r=t.length,o=e.length;for(let e=r-1;e>=n;e--)t[e+o]=t[e];for(let r=0;r<o;r++)t[n+r]=e[r]}
/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */function Ne(t,e){let n;function r(...o){r.cancel(),n=setTimeout((()=>t(...o)),e)}return r.cancel=()=>{clearTimeout(n)},r}
/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */function je(t){try{if(!t.startsWith("ey"))return null;const e=atob(t.replace(/-/g,"+").replace(/_/g,"/"));return JSON.parse(e)}catch(t){return null}}
/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */function Pe(t){const e=Array.isArray(t)?t:[t],n=function(){const t=[];for(let e=0;e<256;e++){let n=e;for(let t=0;t<8;t++)1&n?n=3988292384^n>>>1:n>>>=1;t[e]=n}return t}();let r=~0;const o=e.map((t=>Array.isArray(t)?t.join(""):String(t))).join("");for(let t=0;t<o.length;t++){r=r>>>8^n[255&(r^o.charCodeAt(t))]}return r=~r>>>0,r.toString(16).padStart(8,"0")}
/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */function De(t){return!!t&&1==t.length&&/[\u0300-\u036f\u1ab0-\u1aff\u1dc0-\u1dff\u20d0-\u20ff\ufe20-\ufe2f]/.test(t)}function Be(t){return!!t&&1==t.length&&/[\ud800-\udbff]/.test(t)}function Fe(t){return!!t&&1==t.length&&/[\udc00-\udfff]/.test(t)}function Ve(t,e){return Be(t.charAt(e-1))&&Fe(t.charAt(e))}function We(t,e){return De(t.charAt(e))}const He=Ue();function Ke(t,e){const n=String(t).matchAll(He);return Array.from(n).some((t=>t.index<e&&e<t.index+t[0].length))}function Ue(){const t=/\p{Regional_Indicator}{2}/u.source,e="(?:"+[/\p{Emoji}[\u{E0020}-\u{E007E}]+\u{E007F}/u,/\p{Emoji}\u{FE0F}?\u{20E3}/u,/\p{Emoji}\u{FE0F}/u,/(?=\p{General_Category=Other_Symbol})\p{Emoji}\p{Emoji_Modifier}*/u].map((t=>t.source)).join("|")+")";return new RegExp(`${t}|${e}(?:‍${e})*`,"ug")}export{M as CKEditorError,Ee as Collection,dt as Config,wt as DomEmitterMixin,lt as ElementReplacer,H as EmitterMixin,I as EventInfo,xe as FocusTracker,Le as KeystrokeHandler,ve as Locale,et as ObservableMixin,Mt as Rect,Pt as ResizeObserver,ct as abortableDebounce,ut as compareArrays,at as count,Pe as crc32,ft as createElement,Ne as delay,T as diff,x as diffToChanges,h as env,Se as exponentialDelay,y as fastDiff,Et as findClosestScrollableAncestor,Te as first,Tt as getAncestors,kt as getBorderWidths,ue as getCode,xt as getDataFromElement,fe as getEnvKeystrokeText,_e as getLanguageDirection,pe as getLocalizedArrowKeyCodeDirection,Ut as getOptimalPosition,It as getRangeFromMouseEvent,c as global,Ft as indexOf,Vt as insertAt,C as insertToPriorityArray,de as isArrowKeyCode,De as isCombiningMark,Wt as isComment,me as isForwardArrowKeyCode,Be as isHighSurrogateHalf,We as isInsideCombinedSymbol,Ke as isInsideEmojiSequence,Ve as isInsideSurrogatePair,ht as isIterable,Fe as isLowSurrogateHalf,gt as isNode,Lt as isRange,Ot as isText,Ht as isValidAttributeName,ke as isViewWithFocusTracker,Kt as isVisible,ce as keyCodes,R as logError,S as logWarning,k as mix,je as parseBase64EncodedObject,he as parseKeystroke,A as priorities,D as releaseDate,$t as remove,Me as retry,Gt as scrollAncestorsToShowTarget,zt as scrollViewportToShowTarget,Dt as setDataInElement,Re as spliceArray,we as toArray,Ae as toMap,Bt as toUnit,L as uid,P as version,Ce as wait};