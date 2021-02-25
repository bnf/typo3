define(["exports","../lit-html","../directive","../directive-helpers"],(function(e,t,s,r){"use strict";
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
   */const i=(e,t,s)=>{const r=new Map;for(let i=t;i<=s;i++)r.set(e[i],i);return r},l=s.directive(class extends s.Directive{constructor(e){if(super(e),e.type!==s.PartType.CHILD)throw Error("repeat can only be used in text bindings")}St(e,t,s){let r;void 0===s?s=t:void 0!==t&&(r=t);const i=[],l=[];let n=0;for(const t of e)i[n]=r?r(t,n):n,l[n]=s(t,n),n++;return{values:l,keys:i}}render(e,t,s){return this.St(e,t,s).values}update(e,[s,l,n]){var a;const o=r.getComittedValue(e),{values:u,keys:d}=this.St(s,l,n);if(!o)return this.itemKeys=d,u;const c=null!==(a=this.itemKeys)&&void 0!==a?a:this.itemKeys=[],h=[];let f,v,P=0,C=o.length-1,m=0,p=u.length-1;for(;P<=C&&m<=p;)if(null===o[P])P++;else if(null===o[C])C--;else if(c[P]===d[m])h[m]=r.setChildPartValue(o[P],u[m]),P++,m++;else if(c[C]===d[p])h[p]=r.setChildPartValue(o[C],u[p]),C--,p--;else if(c[P]===d[p])h[p]=r.setChildPartValue(o[P],u[p]),r.insertPart(e,h[p+1],o[P]),P++,p--;else if(c[C]===d[m])h[m]=r.setChildPartValue(o[C],u[m]),r.insertPart(e,o[P],o[C]),C--,m++;else if(void 0===f&&(f=i(d,m,p),v=i(c,P,C)),f.has(c[P]))if(f.has(c[C])){const t=v.get(d[m]),s=void 0!==t?o[t]:null;if(null===s){const t=r.insertPart(e,o[P]);r.setChildPartValue(t,u[m]),h[m]=t}else h[m]=r.setChildPartValue(s,u[m]),r.insertPart(e,o[P],s),o[t]=null;m++}else r.removePart(o[C]),C--;else r.removePart(o[P]),P++;for(;m<=p;){const t=r.insertPart(e,h[p+1]);r.setChildPartValue(t,u[m]),h[m++]=t}for(;P<=C;){const e=o[P++];null!==e&&r.removePart(e)}return this.itemKeys=d,r.setComittedValue(e,h),t.noChange}});e.repeat=l,Object.defineProperty(e,"__esModule",{value:!0})}));
