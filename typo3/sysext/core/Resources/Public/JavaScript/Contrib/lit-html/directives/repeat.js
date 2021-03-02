define(["exports","../lit-html","../directive","../directive-helpers"],(function(exports,litHtml,directive,directiveHelpers){"use strict";
/**
   * @license
   * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   * This code may only be used under the BSD style license found at
   * http://polymer.github.io/LICENSE.txt
   * The complete set of authors may be found at
   * http://polymer.github.io/AUTHORS.txt
   * The complete set of contributors may be found at
   * http://polymer.github.io/CONTRIBUTORS.txt
   * Code distributed by Google as part of the polymer project is also
   * subject to an additional IP rights grant found at
   * http://polymer.github.io/PATENTS.txt
   */const u=(e,s,t)=>{const r=new Map;for(let l=s;l<=t;l++)r.set(e[l],l);return r},c=directive.directive(class extends directive.Directive{constructor(e){if(super(e),e.type!==directive.PartType.CHILD)throw Error("repeat can only be used in text bindings")}St(e,s,t){let r;void 0===t?t=s:void 0!==s&&(r=s);const l=[],i=[];let o=0;for(const s of e)l[o]=r?r(s,o):o,i[o]=t(s,o),o++;return{values:i,keys:l}}render(e,s,t){return this.St(e,s,t).values}update(s,[t,r,c]){var _this$itemKeys;const d=directiveHelpers.getComittedValue(s),{values:h,keys:p}=this.St(t,r,c);if(!d)return this.itemKeys=p,h;const a=null!==(_this$itemKeys=this.itemKeys)&&void 0!==_this$itemKeys?_this$itemKeys:this.itemKeys=[],v=[];let m,y,j=0,x=d.length-1,b=0,g=h.length-1;for(;j<=x&&b<=g;)if(null===d[j])j++;else if(null===d[x])x--;else if(a[j]===p[b])v[b]=directiveHelpers.setChildPartValue(d[j],h[b]),j++,b++;else if(a[x]===p[g])v[g]=directiveHelpers.setChildPartValue(d[x],h[g]),x--,g--;else if(a[j]===p[g])v[g]=directiveHelpers.setChildPartValue(d[j],h[g]),directiveHelpers.insertPart(s,v[g+1],d[j]),j++,g--;else if(a[x]===p[b])v[b]=directiveHelpers.setChildPartValue(d[x],h[b]),directiveHelpers.insertPart(s,d[j],d[x]),x--,b++;else if(void 0===m&&(m=u(p,b,g),y=u(a,j,x)),m.has(a[j]))if(m.has(a[x])){const e=y.get(p[b]),t=void 0!==e?d[e]:null;if(null===t){const e=directiveHelpers.insertPart(s,d[j]);directiveHelpers.setChildPartValue(e,h[b]),v[b]=e}else v[b]=directiveHelpers.setChildPartValue(t,h[b]),directiveHelpers.insertPart(s,d[j],t),d[e]=null;b++}else directiveHelpers.removePart(d[x]),x--;else directiveHelpers.removePart(d[j]),j++;for(;b<=g;){const e=directiveHelpers.insertPart(s,v[g+1]);directiveHelpers.setChildPartValue(e,h[b]),v[b++]=e}for(;j<=x;){const e=d[j++];null!==e&&directiveHelpers.removePart(e)}return this.itemKeys=p,directiveHelpers.setComittedValue(s,v),litHtml.noChange}});exports.repeat=c,Object.defineProperty(exports,"__esModule",{value:!0})}));
