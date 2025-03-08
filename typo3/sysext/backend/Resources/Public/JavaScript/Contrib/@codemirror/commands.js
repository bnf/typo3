import{Annotation as e,Facet as t,combineConfig as n,StateField as r,Transaction as o,ChangeSet as l,ChangeDesc as s,EditorSelection as i,StateEffect as a,Text as c,findClusterBreak as f,countColumn as u,CharCategory as h}from"@codemirror/state"
import{EditorView as m,Direction as d}from"@codemirror/view"
import{IndentContext as p,getIndentation as g,indentString as y,matchBrackets as v,syntaxTree as A,getIndentUnit as k,indentUnit as w}from"@codemirror/language"
import{NodeProp as S}from"@lezer/common"
const D=e=>{let{state:t}=e,n=t.doc.lineAt(t.selection.main.from),r=I(e.state,n.from)
return r.line?M(e):!!r.block&&T(e)}
function x(e,t){return({state:n,dispatch:r})=>{if(n.readOnly)return!1
let o=e(t,n)
return!!o&&(r(n.update(o)),!0)}}const M=x(L,0),B=x(L,1),C=x(L,2),O=x(R,0),E=x(R,1),b=x(R,2),T=x(((e,t)=>R(e,t,function(e){let t=[]
for(let n of e.selection.ranges){let r=e.doc.lineAt(n.from),o=n.to<=r.to?r:e.doc.lineAt(n.to),l=t.length-1
l>=0&&t[l].to>r.from?t[l].to=o.to:t.push({from:r.from+/^\s*/.exec(r.text)[0].length,to:o.to})}return t}(t))),0)
function I(e,t){let n=e.languageDataAt("commentTokens",t)
return n.length?n[0]:{}}const V=50
function R(e,t,n=t.selection.ranges){let r=n.map((e=>I(t,e.from).block))
if(!r.every((e=>e)))return null
let o=n.map(((e,n)=>function(e,{open:t,close:n},r,o){let l,s,i=e.sliceDoc(r-V,r),a=e.sliceDoc(o,o+V),c=/\s*$/.exec(i)[0].length,f=/^\s*/.exec(a)[0].length,u=i.length-c
if(i.slice(u-t.length,u)==t&&a.slice(f,f+n.length)==n)return{open:{pos:r-c,margin:c&&1},close:{pos:o+f,margin:f&&1}}
o-r<=2*V?l=s=e.sliceDoc(r,o):(l=e.sliceDoc(r,r+V),s=e.sliceDoc(o-V,o))
let h=/^\s*/.exec(l)[0].length,m=/\s*$/.exec(s)[0].length,d=s.length-m-n.length
return l.slice(h,h+t.length)==t&&s.slice(d,d+n.length)==n?{open:{pos:r+h+t.length,margin:/\s/.test(l.charAt(h+t.length))?1:0},close:{pos:o-m-n.length,margin:/\s/.test(s.charAt(d-1))?1:0}}:null}(t,r[n],e.from,e.to)))
if(2!=e&&!o.every((e=>e)))return{changes:t.changes(n.map(((e,t)=>o[t]?[]:[{from:e.from,insert:r[t].open+" "},{from:e.to,insert:" "+r[t].close}])))}
if(1!=e&&o.some((e=>e))){let e=[]
for(let t,n=0;n<o.length;n++)if(t=o[n]){let o=r[n],{open:l,close:s}=t
e.push({from:l.pos-o.open.length,to:l.pos+l.margin},{from:s.pos-s.margin,to:s.pos+o.close.length})}return{changes:e}}return null}function L(e,t,n=t.selection.ranges){let r=[],o=-1
for(let{from:e,to:l}of n){let n=r.length,s=1e9,i=I(t,e).line
if(i){for(let n=e;n<=l;){let a=t.doc.lineAt(n)
if(a.from>o&&(e==l||l>a.from)){o=a.from
let e=/^\s*/.exec(a.text)[0].length,t=e==a.length,n=a.text.slice(e,e+i.length)==i?e:-1
e<a.text.length&&e<s&&(s=e),r.push({line:a,comment:n,token:i,indent:e,empty:t,single:!1})}n=a.to+1}if(s<1e9)for(let e=n;e<r.length;e++)r[e].indent<r[e].line.text.length&&(r[e].indent=s)
r.length==n+1&&(r[n].single=!0)}}if(2!=e&&r.some((e=>e.comment<0&&(!e.empty||e.single)))){let e=[]
for(let{line:t,token:n,indent:o,empty:l,single:s}of r)!s&&l||e.push({from:t.from+o,insert:n+" "})
let n=t.changes(e)
return{changes:n,selection:t.selection.map(n,1)}}if(1!=e&&r.some((e=>e.comment>=0))){let e=[]
for(let{line:t,comment:n,token:o}of r)if(n>=0){let r=t.from+n,l=r+o.length
" "==t.text[l-t.from]&&l++,e.push({from:r,to:l})}return{changes:e}}return null}const J=e.define(),N=e.define(),H=t.define(),U=t.define({combine:e=>n(e,{minDepth:100,newGroupDelay:500,joinToEvent:(e,t)=>t},{minDepth:Math.max,newGroupDelay:Math.min,joinToEvent:(e,t)=>(n,r)=>e(n,r)||t(n,r)})}),z=r.define({create:()=>ie.empty,update(e,t){let n=t.state.facet(U),r=t.annotation(J)
if(r){let o=X.fromTransaction(t,r.selection),l=r.side,s=0==l?e.undone:e.done
return s=o?Y(s,s.length,n.minDepth,o):ne(s,t.startState.selection),new ie(0==l?r.rest:s,0==l?s:r.rest)}let l=t.annotation(N)
if("full"!=l&&"before"!=l||(e=e.isolate()),!1===t.annotation(o.addToHistory))return t.changes.empty?e:e.addMapping(t.changes.desc)
let s=X.fromTransaction(t),i=t.annotation(o.time),a=t.annotation(o.userEvent)
return s?e=e.addChanges(s,i,a,n,t):t.selection&&(e=e.addSelection(t.startState.selection,i,a,n.newGroupDelay)),"full"!=l&&"after"!=l||(e=e.isolate()),e},toJSON:e=>({done:e.done.map((e=>e.toJSON())),undone:e.undone.map((e=>e.toJSON()))}),fromJSON:e=>new ie(e.done.map(X.fromJSON),e.undone.map(X.fromJSON))})
function G(e={}){return[z,U.of(e),m.domEventHandlers({beforeinput(e,t){let n="historyUndo"==e.inputType?$:"historyRedo"==e.inputType?j:null
return!!n&&(e.preventDefault(),n(t))}})]}const P=z
function W(e,t){return function({state:n,dispatch:r}){if(!t&&n.readOnly)return!1
let o=n.field(z,!1)
if(!o)return!1
let l=o.pop(e,n,t)
return!!l&&(r(l),!0)}}const $=W(0,!1),j=W(1,!1),q=W(0,!0),F=W(1,!0)
function _(e){return function(t){let n=t.field(z,!1)
if(!n)return 0
let r=0==e?n.done:n.undone
return r.length-(r.length&&!r[0].changes?1:0)}}const K=_(0),Q=_(1)
class X{constructor(e,t,n,r,o){this.changes=e,this.effects=t,this.mapped=n,this.startSelection=r,this.selectionsAfter=o}setSelAfter(e){return new X(this.changes,this.effects,this.mapped,this.startSelection,e)}toJSON(){var e,t,n
return{changes:null===(e=this.changes)||void 0===e?void 0:e.toJSON(),mapped:null===(t=this.mapped)||void 0===t?void 0:t.toJSON(),startSelection:null===(n=this.startSelection)||void 0===n?void 0:n.toJSON(),selectionsAfter:this.selectionsAfter.map((e=>e.toJSON()))}}static fromJSON(e){return new X(e.changes&&l.fromJSON(e.changes),[],e.mapped&&s.fromJSON(e.mapped),e.startSelection&&i.fromJSON(e.startSelection),e.selectionsAfter.map(i.fromJSON))}static fromTransaction(e,t){let n=ee
for(let t of e.startState.facet(H)){let r=t(e)
r.length&&(n=n.concat(r))}return!n.length&&e.changes.empty?null:new X(e.changes.invert(e.startState.doc),n,void 0,t||e.startState.selection,ee)}static selection(e){return new X(void 0,ee,void 0,void 0,e)}}function Y(e,t,n,r){let o=t+1>n+20?t-n-1:0,l=e.slice(o,t)
return l.push(r),l}function Z(e,t){return e.length?t.length?e.concat(t):e:t}const ee=[],te=200
function ne(e,t){if(e.length){let n=e[e.length-1],r=n.selectionsAfter.slice(Math.max(0,n.selectionsAfter.length-te))
return r.length&&r[r.length-1].eq(t)?e:(r.push(t),Y(e,e.length-1,1e9,n.setSelAfter(r)))}return[X.selection([t])]}function re(e){let t=e[e.length-1],n=e.slice()
return n[e.length-1]=t.setSelAfter(t.selectionsAfter.slice(0,t.selectionsAfter.length-1)),n}function oe(e,t){if(!e.length)return e
let n=e.length,r=ee
for(;n;){let o=le(e[n-1],t,r)
if(o.changes&&!o.changes.empty||o.effects.length){let t=e.slice(0,n)
return t[n-1]=o,t}t=o.mapped,n--,r=o.selectionsAfter}return r.length?[X.selection(r)]:ee}function le(e,t,n){let r=Z(e.selectionsAfter.length?e.selectionsAfter.map((e=>e.map(t))):ee,n)
if(!e.changes)return X.selection(r)
let o=e.changes.map(t),l=t.mapDesc(e.changes,!0),s=e.mapped?e.mapped.composeDesc(l):l
return new X(o,a.mapEffects(e.effects,t),s,e.startSelection.map(l),r)}const se=/^(input\.type|delete)($|\.)/
class ie{constructor(e,t,n=0,r=void 0){this.done=e,this.undone=t,this.prevTime=n,this.prevUserEvent=r}isolate(){return this.prevTime?new ie(this.done,this.undone):this}addChanges(e,t,n,r,o){let l=this.done,s=l[l.length-1]
return l=s&&s.changes&&!s.changes.empty&&e.changes&&(!n||se.test(n))&&(!s.selectionsAfter.length&&t-this.prevTime<r.newGroupDelay&&r.joinToEvent(o,function(e,t){let n=[],r=!1
return e.iterChangedRanges(((e,t)=>n.push(e,t))),t.iterChangedRanges(((e,t,o,l)=>{for(let e=0;e<n.length;){let t=n[e++],s=n[e++]
l>=t&&o<=s&&(r=!0)}})),r}(s.changes,e.changes))||"input.type.compose"==n)?Y(l,l.length-1,r.minDepth,new X(e.changes.compose(s.changes),Z(e.effects,s.effects),s.mapped,s.startSelection,ee)):Y(l,l.length,r.minDepth,e),new ie(l,ee,t,n)}addSelection(e,t,n,r){let o=this.done.length?this.done[this.done.length-1].selectionsAfter:ee
return o.length>0&&t-this.prevTime<r&&n==this.prevUserEvent&&n&&/^select($|\.)/.test(n)&&(l=o[o.length-1],s=e,l.ranges.length==s.ranges.length&&0===l.ranges.filter(((e,t)=>e.empty!=s.ranges[t].empty)).length)?this:new ie(ne(this.done,e),this.undone,t,n)
var l,s}addMapping(e){return new ie(oe(this.done,e),oe(this.undone,e),this.prevTime,this.prevUserEvent)}pop(e,t,n){let r=0==e?this.done:this.undone
if(0==r.length)return null
let o=r[r.length-1],l=o.selectionsAfter[0]||t.selection
if(n&&o.selectionsAfter.length)return t.update({selection:o.selectionsAfter[o.selectionsAfter.length-1],annotations:J.of({side:e,rest:re(r),selection:l}),userEvent:0==e?"select.undo":"select.redo",scrollIntoView:!0})
if(o.changes){let n=1==r.length?ee:r.slice(0,r.length-1)
return o.mapped&&(n=oe(n,o.mapped)),t.update({changes:o.changes,selection:o.startSelection,effects:o.effects,annotations:J.of({side:e,rest:n,selection:l}),filter:!1,userEvent:0==e?"undo":"redo",scrollIntoView:!0})}return null}}ie.empty=new ie(ee,ee)
const ae=[{key:"Mod-z",run:$,preventDefault:!0},{key:"Mod-y",mac:"Mod-Shift-z",run:j,preventDefault:!0},{linux:"Ctrl-Shift-z",run:j,preventDefault:!0},{key:"Mod-u",run:q,preventDefault:!0},{key:"Alt-u",mac:"Mod-Shift-u",run:F,preventDefault:!0}]
function ce(e,t){return i.create(e.ranges.map(t),e.mainIndex)}function fe(e,t){return e.update({selection:t,scrollIntoView:!0,userEvent:"select"})}function ue({state:e,dispatch:t},n){let r=ce(e.selection,n)
return!r.eq(e.selection,!0)&&(t(fe(e,r)),!0)}function he(e,t){return i.cursor(t?e.to:e.from)}function me(e,t){return ue(e,(n=>n.empty?e.moveByChar(n,t):he(n,t)))}function de(e){return e.textDirectionAt(e.state.selection.main.head)==d.LTR}const pe=e=>me(e,!de(e)),ge=e=>me(e,de(e)),ye=e=>me(e,!0),ve=e=>me(e,!1)
function Ae(e,t){return ue(e,(n=>n.empty?e.moveByGroup(n,t):he(n,t)))}const ke=e=>Ae(e,!de(e)),we=e=>Ae(e,de(e)),Se=e=>Ae(e,!0),De=e=>Ae(e,!1),xe="undefined"!=typeof Intl&&Intl.Segmenter?new Intl.Segmenter(void 0,{granularity:"word"}):null
function Me(e,t,n){let r=e.state.charCategorizer(t.from),o=h.Space,l=t.from,s=0,a=!1,c=!1,f=!1,u=t=>{if(a)return!1
l+=n?t.length:-t.length
let i,u=r(t)
if(u==h.Word&&t.charCodeAt(0)<128&&/[\W_]/.test(t)&&(u=-1),o==h.Space&&(o=u),o!=u)return!1
if(o==h.Word)if(t.toLowerCase()==t){if(!n&&c)return!1
f=!0}else if(f){if(n)return!1
a=!0}else{if(c&&n&&r(i=e.state.sliceDoc(l,l+1))==h.Word&&i.toLowerCase()==i)return!1
c=!0}return s++,!0},m=e.moveByChar(t,n,(e=>(u(e),u)))
if(xe&&o==h.Word&&m.from==t.from+s*(n?1:-1)){let r=Math.min(t.head,m.head),o=Math.max(t.head,m.head),l=e.state.sliceDoc(r,o)
if(l.length>1&&/[\u4E00-\uffff]/.test(l)){let e=Array.from(xe.segment(l))
if(e.length>1)return n?i.cursor(t.head+e[1].index,-1):i.cursor(m.head+e[e.length-1].index,1)}}return m}function Be(e,t){return ue(e,(n=>n.empty?Me(e,n,t):he(n,t)))}const Ce=e=>Be(e,!0),Oe=e=>Be(e,!1)
function Ee(e,t,n){if(t.type.prop(n))return!0
let r=t.to-t.from
return r&&(r>2||/[^\s,.;:]/.test(e.sliceDoc(t.from,t.to)))||t.firstChild}function be(e,t,n){let r,o,l=A(e).resolveInner(t.head),s=n?S.closedBy:S.openedBy
for(let r=t.head;;){let t=n?l.childAfter(r):l.childBefore(r)
if(!t)break
Ee(e,t,s)?l=t:r=n?t.to:t.from}return o=l.type.prop(s)&&(r=n?v(e,l.from,1):v(e,l.to,-1))&&r.matched?n?r.end.to:r.end.from:n?l.to:l.from,i.cursor(o,n?-1:1)}const Te=e=>ue(e,(t=>be(e.state,t,!de(e)))),Ie=e=>ue(e,(t=>be(e.state,t,de(e))))
function Ve(e,t){return ue(e,(n=>{if(!n.empty)return he(n,t)
let r=e.moveVertically(n,t)
return r.head!=n.head?r:e.moveToLineBoundary(n,t)}))}const Re=e=>Ve(e,!1),Le=e=>Ve(e,!0)
function Je(e){let t,n=e.scrollDOM.clientHeight<e.scrollDOM.scrollHeight-2,r=0,o=0
if(n){for(let t of e.state.facet(m.scrollMargins)){let n=t(e);(null==n?void 0:n.top)&&(r=Math.max(null==n?void 0:n.top,r)),(null==n?void 0:n.bottom)&&(o=Math.max(null==n?void 0:n.bottom,o))}t=e.scrollDOM.clientHeight-r-o}else t=(e.dom.ownerDocument.defaultView||window).innerHeight
return{marginTop:r,marginBottom:o,selfScroll:n,height:Math.max(e.defaultLineHeight,t-5)}}function Ne(e,t){let n,r=Je(e),{state:o}=e,l=ce(o.selection,(n=>n.empty?e.moveVertically(n,t,r.height):he(n,t)))
if(l.eq(o.selection))return!1
if(r.selfScroll){let t=e.coordsAtPos(o.selection.main.head),s=e.scrollDOM.getBoundingClientRect(),i=s.top+r.marginTop,a=s.bottom-r.marginBottom
t&&t.top>i&&t.bottom<a&&(n=m.scrollIntoView(l.main.head,{y:"start",yMargin:t.top-i}))}return e.dispatch(fe(o,l),{effects:n}),!0}const He=e=>Ne(e,!1),Ue=e=>Ne(e,!0)
function ze(e,t,n){let r=e.lineBlockAt(t.head),o=e.moveToLineBoundary(t,n)
if(o.head==t.head&&o.head!=(n?r.to:r.from)&&(o=e.moveToLineBoundary(t,n,!1)),!n&&o.head==r.from&&r.length){let n=/^\s*/.exec(e.state.sliceDoc(r.from,Math.min(r.from+100,r.to)))[0].length
n&&t.head!=r.from+n&&(o=i.cursor(r.from+n))}return o}const Ge=e=>ue(e,(t=>ze(e,t,!0))),Pe=e=>ue(e,(t=>ze(e,t,!1))),We=e=>ue(e,(t=>ze(e,t,!de(e)))),$e=e=>ue(e,(t=>ze(e,t,de(e)))),je=e=>ue(e,(t=>i.cursor(e.lineBlockAt(t.head).from,1))),qe=e=>ue(e,(t=>i.cursor(e.lineBlockAt(t.head).to,-1)))
function Fe(e,t,n){let r=!1,o=ce(e.selection,(t=>{let o=v(e,t.head,-1)||v(e,t.head,1)||t.head>0&&v(e,t.head-1,1)||t.head<e.doc.length&&v(e,t.head+1,-1)
if(!o||!o.end)return t
r=!0
let l=o.start.from==t.head?o.end.to:o.end.from
return n?i.range(t.anchor,l):i.cursor(l)}))
return!!r&&(t(fe(e,o)),!0)}const _e=({state:e,dispatch:t})=>Fe(e,t,!1),Ke=({state:e,dispatch:t})=>Fe(e,t,!0)
function Qe(e,t){let n=ce(e.state.selection,(e=>{let n=t(e)
return i.range(e.anchor,n.head,n.goalColumn,n.bidiLevel||void 0)}))
return!n.eq(e.state.selection)&&(e.dispatch(fe(e.state,n)),!0)}function Xe(e,t){return Qe(e,(n=>e.moveByChar(n,t)))}const Ye=e=>Xe(e,!de(e)),Ze=e=>Xe(e,de(e)),et=e=>Xe(e,!0),tt=e=>Xe(e,!1)
function nt(e,t){return Qe(e,(n=>e.moveByGroup(n,t)))}const rt=e=>nt(e,!de(e)),ot=e=>nt(e,de(e)),lt=e=>nt(e,!0),st=e=>nt(e,!1)
function it(e,t){return Qe(e,(n=>Me(e,n,t)))}const at=e=>it(e,!0),ct=e=>it(e,!1),ft=e=>Qe(e,(t=>be(e.state,t,!de(e)))),ut=e=>Qe(e,(t=>be(e.state,t,de(e))))
function ht(e,t){return Qe(e,(n=>e.moveVertically(n,t)))}const mt=e=>ht(e,!1),dt=e=>ht(e,!0)
function pt(e,t){return Qe(e,(n=>e.moveVertically(n,t,Je(e).height)))}const gt=e=>pt(e,!1),yt=e=>pt(e,!0),vt=e=>Qe(e,(t=>ze(e,t,!0))),At=e=>Qe(e,(t=>ze(e,t,!1))),kt=e=>Qe(e,(t=>ze(e,t,!de(e)))),wt=e=>Qe(e,(t=>ze(e,t,de(e)))),St=e=>Qe(e,(t=>i.cursor(e.lineBlockAt(t.head).from))),Dt=e=>Qe(e,(t=>i.cursor(e.lineBlockAt(t.head).to))),xt=({state:e,dispatch:t})=>(t(fe(e,{anchor:0})),!0),Mt=({state:e,dispatch:t})=>(t(fe(e,{anchor:e.doc.length})),!0),Bt=({state:e,dispatch:t})=>(t(fe(e,{anchor:e.selection.main.anchor,head:0})),!0),Ct=({state:e,dispatch:t})=>(t(fe(e,{anchor:e.selection.main.anchor,head:e.doc.length})),!0),Ot=({state:e,dispatch:t})=>(t(e.update({selection:{anchor:0,head:e.doc.length},userEvent:"select"})),!0),Et=({state:e,dispatch:t})=>{let n=_t(e).map((({from:t,to:n})=>i.range(t,Math.min(n+1,e.doc.length))))
return t(e.update({selection:i.create(n),userEvent:"select"})),!0},bt=({state:e,dispatch:t})=>{let n=ce(e.selection,(t=>{var n
for(let r=A(e).resolveStack(t.from,1);r;r=r.next){let{node:e}=r
if((e.from<t.from&&e.to>=t.to||e.to>t.to&&e.from<=t.from)&&(null===(n=e.parent)||void 0===n?void 0:n.parent))return i.range(e.to,e.from)}return t}))
return t(fe(e,n)),!0},Tt=({state:e,dispatch:t})=>{let n=e.selection,r=null
return n.ranges.length>1?r=i.create([n.main]):n.main.empty||(r=i.create([i.cursor(n.main.head)])),!!r&&(t(fe(e,r)),!0)}
function It(e,t){if(e.state.readOnly)return!1
let n="delete.selection",{state:r}=e,o=r.changeByRange((r=>{let{from:o,to:l}=r
if(o==l){let s=t(r)
s<o?(n="delete.backward",s=Vt(e,s,!1)):s>o&&(n="delete.forward",s=Vt(e,s,!0)),o=Math.min(o,s),l=Math.max(l,s)}else o=Vt(e,o,!1),l=Vt(e,l,!0)
return o==l?{range:r}:{changes:{from:o,to:l},range:i.cursor(o,o<r.head?-1:1)}}))
return!o.changes.empty&&(e.dispatch(r.update(o,{scrollIntoView:!0,userEvent:n,effects:"delete.selection"==n?m.announce.of(r.phrase("Selection deleted")):void 0})),!0)}function Vt(e,t,n){if(e instanceof m)for(let r of e.state.facet(m.atomicRanges).map((t=>t(e))))r.between(t,t,((e,r)=>{e<t&&r>t&&(t=n?r:e)}))
return t}const Rt=(e,t,n)=>It(e,(r=>{let o,l,s=r.from,{state:i}=e,a=i.doc.lineAt(s)
if(n&&!t&&s>a.from&&s<a.from+200&&!/[^ \t]/.test(o=a.text.slice(0,s-a.from))){if("\t"==o[o.length-1])return s-1
let e=u(o,i.tabSize)%k(i)||k(i)
for(let t=0;t<e&&" "==o[o.length-1-t];t++)s--
l=s}else l=f(a.text,s-a.from,t,t)+a.from,l==s&&a.number!=(t?i.doc.lines:1)?l+=t?1:-1:!t&&/[\ufe00-\ufe0f]/.test(a.text.slice(l-a.from,s-a.from))&&(l=f(a.text,l-a.from,!1,!1)+a.from)
return l})),Lt=e=>Rt(e,!1,!0),Jt=e=>Rt(e,!1,!1),Nt=e=>Rt(e,!0,!1),Ht=(e,t)=>It(e,(n=>{let r=n.head,{state:o}=e,l=o.doc.lineAt(r),s=o.charCategorizer(r)
for(let e=null;;){if(r==(t?l.to:l.from)){r==n.head&&l.number!=(t?o.doc.lines:1)&&(r+=t?1:-1)
break}let i=f(l.text,r-l.from,t)+l.from,a=l.text.slice(Math.min(r,i)-l.from,Math.max(r,i)-l.from),c=s(a)
if(null!=e&&c!=e)break
" "==a&&r==n.head||(e=c),r=i}return r})),Ut=e=>Ht(e,!1),zt=e=>Ht(e,!0),Gt=e=>It(e,(t=>{let n=e.lineBlockAt(t.head).to
return t.head<n?n:Math.min(e.state.doc.length,t.head+1)})),Pt=e=>It(e,(t=>{let n=e.lineBlockAt(t.head).from
return t.head>n?n:Math.max(0,t.head-1)})),Wt=e=>It(e,(t=>{let n=e.moveToLineBoundary(t,!1).head
return t.head>n?n:Math.max(0,t.head-1)})),$t=e=>It(e,(t=>{let n=e.moveToLineBoundary(t,!0).head
return t.head<n?n:Math.min(e.state.doc.length,t.head+1)})),jt=({state:e,dispatch:t})=>{if(e.readOnly)return!1
let n=[]
for(let t=0,r="",o=e.doc.iter();;){if(o.next(),o.lineBreak||o.done){let e=r.search(/\s+$/)
if(e>-1&&n.push({from:t-(r.length-e),to:t}),o.done)break
r=""}else r=o.value
t+=o.value.length}return!!n.length&&(t(e.update({changes:n,userEvent:"delete"})),!0)},qt=({state:e,dispatch:t})=>{if(e.readOnly)return!1
let n=e.changeByRange((e=>({changes:{from:e.from,to:e.to,insert:c.of(["",""])},range:i.cursor(e.from)})))
return t(e.update(n,{scrollIntoView:!0,userEvent:"input"})),!0},Ft=({state:e,dispatch:t})=>{if(e.readOnly)return!1
let n=e.changeByRange((t=>{if(!t.empty||0==t.from||t.from==e.doc.length)return{range:t}
let n=t.from,r=e.doc.lineAt(n),o=n==r.from?n-1:f(r.text,n-r.from,!1)+r.from,l=n==r.to?n+1:f(r.text,n-r.from,!0)+r.from
return{changes:{from:o,to:l,insert:e.doc.slice(n,l).append(e.doc.slice(o,n))},range:i.cursor(l)}}))
return!n.changes.empty&&(t(e.update(n,{scrollIntoView:!0,userEvent:"move.character"})),!0)}
function _t(e){let t=[],n=-1
for(let r of e.selection.ranges){let o=e.doc.lineAt(r.from),l=e.doc.lineAt(r.to)
if(r.empty||r.to!=l.from||(l=e.doc.lineAt(r.to-1)),n>=o.number){let e=t[t.length-1]
e.to=l.to,e.ranges.push(r)}else t.push({from:o.from,to:l.to,ranges:[r]})
n=l.number+1}return t}function Kt(e,t,n){if(e.readOnly)return!1
let r=[],o=[]
for(let t of _t(e)){if(n?t.to==e.doc.length:0==t.from)continue
let l=e.doc.lineAt(n?t.to+1:t.from-1),s=l.length+1
if(n){r.push({from:t.to,to:l.to},{from:t.from,insert:l.text+e.lineBreak})
for(let n of t.ranges)o.push(i.range(Math.min(e.doc.length,n.anchor+s),Math.min(e.doc.length,n.head+s)))}else{r.push({from:l.from,to:t.from},{from:t.to,insert:e.lineBreak+l.text})
for(let e of t.ranges)o.push(i.range(e.anchor-s,e.head-s))}}return!!r.length&&(t(e.update({changes:r,scrollIntoView:!0,selection:i.create(o,e.selection.mainIndex),userEvent:"move.line"})),!0)}const Qt=({state:e,dispatch:t})=>Kt(e,t,!1),Xt=({state:e,dispatch:t})=>Kt(e,t,!0)
function Yt(e,t,n){if(e.readOnly)return!1
let r=[]
for(let t of _t(e))n?r.push({from:t.from,insert:e.doc.slice(t.from,t.to)+e.lineBreak}):r.push({from:t.to,insert:e.lineBreak+e.doc.slice(t.from,t.to)})
return t(e.update({changes:r,scrollIntoView:!0,userEvent:"input.copyline"})),!0}const Zt=({state:e,dispatch:t})=>Yt(e,t,!1),en=({state:e,dispatch:t})=>Yt(e,t,!0),tn=e=>{if(e.state.readOnly)return!1
let{state:t}=e,n=t.changes(_t(t).map((({from:e,to:n})=>(e>0?e--:n<t.doc.length&&n++,{from:e,to:n})))),r=ce(t.selection,(t=>{let n
if(e.lineWrapping){let r=e.lineBlockAt(t.head),o=e.coordsAtPos(t.head,t.assoc||1)
o&&(n=r.bottom+e.documentTop-o.bottom+e.defaultLineHeight/2)}return e.moveVertically(t,!0,n)})).map(n)
return e.dispatch({changes:n,selection:r,scrollIntoView:!0,userEvent:"delete.line"}),!0},nn=({state:e,dispatch:t})=>(t(e.update(e.replaceSelection(e.lineBreak),{scrollIntoView:!0,userEvent:"input"})),!0),rn=({state:e,dispatch:t})=>(t(e.update(e.changeByRange((t=>{let n=/^\s*/.exec(e.doc.lineAt(t.from).text)[0]
return{changes:{from:t.from,to:t.to,insert:e.lineBreak+n},range:i.cursor(t.from+n.length+1)}})),{scrollIntoView:!0,userEvent:"input"})),!0)
const on=sn(!1),ln=sn(!0)
function sn(e){return({state:t,dispatch:n})=>{if(t.readOnly)return!1
let r=t.changeByRange((n=>{let{from:r,to:o}=n,l=t.doc.lineAt(r),s=!e&&r==o&&function(e,t){if(/\(\)|\[\]|\{\}/.test(e.sliceDoc(t-1,t+1)))return{from:t,to:t}
let n,r=A(e).resolveInner(t),o=r.childBefore(t),l=r.childAfter(t)
return o&&l&&o.to<=t&&l.from>=t&&(n=o.type.prop(S.closedBy))&&n.indexOf(l.name)>-1&&e.doc.lineAt(o.to).from==e.doc.lineAt(l.from).from&&!/\S/.test(e.sliceDoc(o.to,l.from))?{from:o.to,to:l.from}:null}(t,r)
e&&(r=o=(o<=l.to?l:t.doc.lineAt(o)).to)
let a=new p(t,{simulateBreak:r,simulateDoubleBreak:!!s}),f=g(a,r)
for(null==f&&(f=u(/^\s*/.exec(t.doc.lineAt(r).text)[0],t.tabSize));o<l.to&&/\s/.test(l.text[o-l.from]);)o++
s?({from:r,to:o}=s):r>l.from&&r<l.from+100&&!/\S/.test(l.text.slice(0,r))&&(r=l.from)
let h=["",y(t,f)]
return s&&h.push(y(t,a.lineIndent(l.from,-1))),{changes:{from:r,to:o,insert:c.of(h)},range:i.cursor(r+1+h[1].length)}}))
return n(t.update(r,{scrollIntoView:!0,userEvent:"input"})),!0}}function an(e,t){let n=-1
return e.changeByRange((r=>{let o=[]
for(let l=r.from;l<=r.to;){let s=e.doc.lineAt(l)
s.number>n&&(r.empty||r.to>s.from)&&(t(s,o,r),n=s.number),l=s.to+1}let l=e.changes(o)
return{changes:o,range:i.range(l.mapPos(r.anchor,1),l.mapPos(r.head,1))}}))}const cn=({state:e,dispatch:t})=>{if(e.readOnly)return!1
let n=Object.create(null),r=new p(e,{overrideIndentation:e=>{let t=n[e]
return t??-1}}),o=an(e,((t,o,l)=>{let s=g(r,t.from)
if(null==s)return;/\S/.test(t.text)||(s=0)
let i=/^\s*/.exec(t.text)[0],a=y(e,s);(i!=a||l.from<t.from+i.length)&&(n[t.from]=s,o.push({from:t.from,to:t.from+i.length,insert:a}))}))
return o.changes.empty||t(e.update(o,{userEvent:"indent"})),!0},fn=({state:e,dispatch:t})=>!e.readOnly&&(t(e.update(an(e,((t,n)=>{n.push({from:t.from,insert:e.facet(w)})})),{userEvent:"input.indent"})),!0),un=({state:e,dispatch:t})=>!e.readOnly&&(t(e.update(an(e,((t,n)=>{let r=/^\s*/.exec(t.text)[0]
if(!r)return
let o=u(r,e.tabSize),l=0,s=y(e,Math.max(0,o-k(e)))
for(;l<r.length&&l<s.length&&r.charCodeAt(l)==s.charCodeAt(l);)l++
n.push({from:t.from+l,to:t.from+r.length,insert:s.slice(l)})})),{userEvent:"delete.dedent"})),!0),hn=e=>(e.setTabFocusMode(),!0),mn=e=>(e.setTabFocusMode(2e3),!0),dn=({state:e,dispatch:t})=>e.selection.ranges.some((e=>!e.empty))?fn({state:e,dispatch:t}):(t(e.update(e.replaceSelection("\t"),{scrollIntoView:!0,userEvent:"input"})),!0),pn=[{key:"Ctrl-b",run:pe,shift:Ye,preventDefault:!0},{key:"Ctrl-f",run:ge,shift:Ze},{key:"Ctrl-p",run:Re,shift:mt},{key:"Ctrl-n",run:Le,shift:dt},{key:"Ctrl-a",run:je,shift:St},{key:"Ctrl-e",run:qe,shift:Dt},{key:"Ctrl-d",run:Nt},{key:"Ctrl-h",run:Lt},{key:"Ctrl-k",run:Gt},{key:"Ctrl-Alt-h",run:Ut},{key:"Ctrl-o",run:qt},{key:"Ctrl-t",run:Ft},{key:"Ctrl-v",run:Ue}],gn=[{key:"ArrowLeft",run:pe,shift:Ye,preventDefault:!0},{key:"Mod-ArrowLeft",mac:"Alt-ArrowLeft",run:ke,shift:rt,preventDefault:!0},{mac:"Cmd-ArrowLeft",run:We,shift:kt,preventDefault:!0},{key:"ArrowRight",run:ge,shift:Ze,preventDefault:!0},{key:"Mod-ArrowRight",mac:"Alt-ArrowRight",run:we,shift:ot,preventDefault:!0},{mac:"Cmd-ArrowRight",run:$e,shift:wt,preventDefault:!0},{key:"ArrowUp",run:Re,shift:mt,preventDefault:!0},{mac:"Cmd-ArrowUp",run:xt,shift:Bt},{mac:"Ctrl-ArrowUp",run:He,shift:gt},{key:"ArrowDown",run:Le,shift:dt,preventDefault:!0},{mac:"Cmd-ArrowDown",run:Mt,shift:Ct},{mac:"Ctrl-ArrowDown",run:Ue,shift:yt},{key:"PageUp",run:He,shift:gt},{key:"PageDown",run:Ue,shift:yt},{key:"Home",run:Pe,shift:At,preventDefault:!0},{key:"Mod-Home",run:xt,shift:Bt},{key:"End",run:Ge,shift:vt,preventDefault:!0},{key:"Mod-End",run:Mt,shift:Ct},{key:"Enter",run:on},{key:"Mod-a",run:Ot},{key:"Backspace",run:Lt,shift:Lt},{key:"Delete",run:Nt},{key:"Mod-Backspace",mac:"Alt-Backspace",run:Ut},{key:"Mod-Delete",mac:"Alt-Delete",run:zt},{mac:"Mod-Backspace",run:Wt},{mac:"Mod-Delete",run:$t}].concat(pn.map((e=>({mac:e.key,run:e.run,shift:e.shift})))),yn=[{key:"Alt-ArrowLeft",mac:"Ctrl-ArrowLeft",run:Te,shift:ft},{key:"Alt-ArrowRight",mac:"Ctrl-ArrowRight",run:Ie,shift:ut},{key:"Alt-ArrowUp",run:Qt},{key:"Shift-Alt-ArrowUp",run:Zt},{key:"Alt-ArrowDown",run:Xt},{key:"Shift-Alt-ArrowDown",run:en},{key:"Escape",run:Tt},{key:"Mod-Enter",run:ln},{key:"Alt-l",mac:"Ctrl-l",run:Et},{key:"Mod-i",run:bt,preventDefault:!0},{key:"Mod-[",run:un},{key:"Mod-]",run:fn},{key:"Mod-Alt-\\",run:cn},{key:"Shift-Mod-k",run:tn},{key:"Shift-Mod-\\",run:_e},{key:"Mod-/",run:D},{key:"Alt-A",run:O},{key:"Ctrl-m",mac:"Shift-Alt-m",run:hn}].concat(gn),vn={key:"Tab",run:fn,shift:un}
export{E as blockComment,b as blockUncomment,en as copyLineDown,Zt as copyLineUp,ve as cursorCharBackward,ye as cursorCharForward,pe as cursorCharLeft,ge as cursorCharRight,Mt as cursorDocEnd,xt as cursorDocStart,De as cursorGroupBackward,Se as cursorGroupForward,ke as cursorGroupLeft,we as cursorGroupRight,Pe as cursorLineBoundaryBackward,Ge as cursorLineBoundaryForward,We as cursorLineBoundaryLeft,$e as cursorLineBoundaryRight,Le as cursorLineDown,qe as cursorLineEnd,je as cursorLineStart,Re as cursorLineUp,_e as cursorMatchingBracket,Ue as cursorPageDown,He as cursorPageUp,Oe as cursorSubwordBackward,Ce as cursorSubwordForward,Te as cursorSyntaxLeft,Ie as cursorSyntaxRight,yn as defaultKeymap,Lt as deleteCharBackward,Jt as deleteCharBackwardStrict,Nt as deleteCharForward,Ut as deleteGroupBackward,zt as deleteGroupForward,tn as deleteLine,Wt as deleteLineBoundaryBackward,$t as deleteLineBoundaryForward,Gt as deleteToLineEnd,Pt as deleteToLineStart,jt as deleteTrailingWhitespace,pn as emacsStyleKeymap,G as history,P as historyField,ae as historyKeymap,un as indentLess,fn as indentMore,cn as indentSelection,vn as indentWithTab,ln as insertBlankLine,nn as insertNewline,on as insertNewlineAndIndent,rn as insertNewlineKeepIndent,dn as insertTab,H as invertedEffects,N as isolateHistory,B as lineComment,C as lineUncomment,Xt as moveLineDown,Qt as moveLineUp,j as redo,Q as redoDepth,F as redoSelection,Ot as selectAll,tt as selectCharBackward,et as selectCharForward,Ye as selectCharLeft,Ze as selectCharRight,Ct as selectDocEnd,Bt as selectDocStart,st as selectGroupBackward,lt as selectGroupForward,rt as selectGroupLeft,ot as selectGroupRight,Et as selectLine,At as selectLineBoundaryBackward,vt as selectLineBoundaryForward,kt as selectLineBoundaryLeft,wt as selectLineBoundaryRight,dt as selectLineDown,Dt as selectLineEnd,St as selectLineStart,mt as selectLineUp,Ke as selectMatchingBracket,yt as selectPageDown,gt as selectPageUp,bt as selectParentSyntax,ct as selectSubwordBackward,at as selectSubwordForward,ft as selectSyntaxLeft,ut as selectSyntaxRight,Tt as simplifySelection,qt as splitLine,gn as standardKeymap,mn as temporarilySetTabFocusMode,O as toggleBlockComment,T as toggleBlockCommentByLine,D as toggleComment,M as toggleLineComment,hn as toggleTabFocusMode,Ft as transposeChars,$ as undo,K as undoDepth,q as undoSelection}
