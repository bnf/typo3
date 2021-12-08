import{getCommittedValue,setChildPartValue,insertPart,removePart,setCommittedValue}from"lit-html/directive-helpers.js";import{directive,Directive,PartType}from"lit-html/directive.js";import{noChange}from"lit-html/lit-html.js";
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const u=(e,s,t)=>{const r=new Map;for(let l=s;l<=t;l++)r.set(e[l],l);return r},c=directive(class extends Directive{constructor(e){if(super(e),e.type!==PartType.CHILD)throw Error("repeat() can only be used in text expressions")}dt(e,s,t){let r;void 0===t?t=s:void 0!==s&&(r=s);const l=[],o=[];let i=0;for(const s of e)l[i]=r?r(s,i):i,o[i]=t(s,i),i++;return{values:o,keys:l}}render(e,s,t){return this.dt(e,s,t).values}update(s,[t,r,c]){var d;const a=getCommittedValue(s),{values:p,keys:v}=this.dt(t,r,c);if(!Array.isArray(a))return this.ct=v,p;const h=null!==(d=this.ct)&&void 0!==d?d:this.ct=[],m=[];let y,x,j=0,k=a.length-1,w=0,A=p.length-1;for(;j<=k&&w<=A;)if(null===a[j])j++;else if(null===a[k])k--;else if(h[j]===v[w])m[w]=setChildPartValue(a[j],p[w]),j++,w++;else if(h[k]===v[A])m[A]=setChildPartValue(a[k],p[A]),k--,A--;else if(h[j]===v[A])m[A]=setChildPartValue(a[j],p[A]),insertPart(s,m[A+1],a[j]),j++,A--;else if(h[k]===v[w])m[w]=setChildPartValue(a[k],p[w]),insertPart(s,a[j],a[k]),k--,w++;else if(void 0===y&&(y=u(v,w,A),x=u(h,j,k)),y.has(h[j]))if(y.has(h[k])){const e=x.get(v[w]),t=void 0!==e?a[e]:null;if(null===t){const e=insertPart(s,a[j]);setChildPartValue(e,p[w]),m[w]=e}else m[w]=setChildPartValue(t,p[w]),insertPart(s,a[j],t),a[e]=null;w++}else removePart(a[k]),k--;else removePart(a[j]),j++;for(;w<=A;){const e=insertPart(s,m[A+1]);setChildPartValue(e,p[w]),m[w++]=e}for(;j<=k;){const e=a[j++];null!==e&&removePart(e)}return this.ct=v,setCommittedValue(s,m),noChange}});export{c as repeat};
