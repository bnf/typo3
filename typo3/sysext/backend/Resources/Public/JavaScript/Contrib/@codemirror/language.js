import{NodeProp as t,IterMode as e,Tree as r,TreeFragment as n,Parser as s,NodeType as i,NodeSet as o}from"@lezer/common"
import{StateEffect as a,StateField as l,Facet as h,EditorState as u,countColumn as c,combineConfig as f,RangeSet as d,RangeSetBuilder as p,Prec as m}from"@codemirror/state"
import{ViewPlugin as g,logException as k,EditorView as v,Decoration as w,WidgetType as b,gutter as x,GutterMarker as y,Direction as A}from"@codemirror/view"
import{tags as S,tagHighlighter as P,highlightTree as C,styleTags as T}from"@lezer/highlight"
import{StyleModule as D}from"style-mod"
var O
const I=new t
function B(t){return h.define({combine:t?e=>e.concat(t):void 0})}const L=new t
class N{constructor(t,e,r=[],n=""){this.data=t,this.name=n,u.prototype.hasOwnProperty("tree")||Object.defineProperty(u.prototype,"tree",{get(){return E(this)}}),this.parser=e,this.extension=[K.of(this),u.languageData.of(((t,e,r)=>{let n=M(t,e,r),s=n.type.prop(I)
if(!s)return[]
let i=t.facet(s),o=n.type.prop(L)
if(o){let s=n.resolve(e-n.from,r)
for(let e of o)if(e.test(s,t)){let r=t.facet(e.facet)
return"replace"==e.type?r:r.concat(i)}}return i}))].concat(r)}isActiveAt(t,e,r=-1){return M(t,e,r).type.prop(I)==this.data}findRegions(e){let n=e.facet(K)
if((null==n?void 0:n.data)==this.data)return[{from:0,to:e.doc.length}]
if(!n||!n.allowsNesting)return[]
let s=[],i=(e,n)=>{if(e.prop(I)==this.data)return void s.push({from:n,to:n+e.length})
let o=e.prop(t.mounted)
if(o){if(o.tree.prop(I)==this.data){if(o.overlay)for(let t of o.overlay)s.push({from:t.from+n,to:t.to+n})
else s.push({from:n,to:n+e.length})
return}if(o.overlay){let t=s.length
if(i(o.tree,o.overlay[0].from+n),s.length>t)return}}for(let t=0;t<e.children.length;t++){let s=e.children[t]
s instanceof r&&i(s,e.positions[t]+n)}}
return i(E(e),0),s}get allowsNesting(){return!0}}function M(t,r,n){let s=t.facet(K),i=E(t).topNode
if(!s||s.allowsNesting)for(let t=i;t;t=t.enter(r,n,e.ExcludeBuffers))t.type.isTop&&(i=t)
return i}N.setState=a.define()
class R extends N{constructor(t,e,r){super(t,e,[],r),this.parser=e}static define(t){let e=B(t.languageData)
return new R(e,t.parser.configure({props:[I.add((t=>t.isTop?e:void 0))]}),t.name)}configure(t,e){return new R(this.data,this.parser.configure(t),e||this.name)}get allowsNesting(){return this.parser.hasWrappers()}}function E(t){let e=t.field(N.state,!1)
return e?e.tree:r.empty}function j(t,e,r=50){var n
let s=null===(n=t.field(N.state,!1))||void 0===n?void 0:n.context
if(!s)return null
let i=s.viewport
s.updateViewport({from:0,to:e})
let o=s.isDone(e)||s.work(r,e)?s.tree:null
return s.updateViewport(i),o}function W(t,e=t.doc.length){var r
return(null===(r=t.field(N.state,!1))||void 0===r?void 0:r.context.isDone(e))||!1}function F(t,e=t.viewport.to,r=100){let n=j(t.state,e,r)
return n!=E(t.state)&&t.dispatch({}),!!n}function U(t){var e
return(null===(e=t.plugin(_))||void 0===e?void 0:e.isWorking())||!1}class z{constructor(t){this.doc=t,this.cursorPos=0,this.string="",this.cursor=t.iter()}get length(){return this.doc.length}syncTo(t){return this.string=this.cursor.next(t-this.cursorPos).value,this.cursorPos=t+this.string.length,this.cursorPos-this.string.length}chunk(t){return this.syncTo(t),this.string}get lineChunks(){return!0}read(t,e){let r=this.cursorPos-this.string.length
return t<r||e>=this.cursorPos?this.doc.sliceString(t,e):this.string.slice(t-r,e-r)}}let V=null
class ${constructor(t,e,r=[],n,s,i,o,a){this.parser=t,this.state=e,this.fragments=r,this.tree=n,this.treeLen=s,this.viewport=i,this.skipped=o,this.scheduleOn=a,this.parse=null,this.tempSkipped=[]}static create(t,e,n){return new $(t,e,[],r.empty,0,n,[],null)}startParse(){return this.parser.startParse(new z(this.state.doc),this.fragments)}work(t,e){return null!=e&&e>=this.state.doc.length&&(e=void 0),this.tree!=r.empty&&this.isDone(null!=e?e:this.state.doc.length)?(this.takeTree(),!0):this.withContext((()=>{var r
if("number"==typeof t){let e=Date.now()+t
t=()=>Date.now()>e}for(this.parse||(this.parse=this.startParse()),null!=e&&(null==this.parse.stoppedAt||this.parse.stoppedAt>e)&&e<this.state.doc.length&&this.parse.stopAt(e);;){let s=this.parse.advance()
if(s){if(this.fragments=this.withoutTempSkipped(n.addTree(s,this.fragments,null!=this.parse.stoppedAt)),this.treeLen=null!==(r=this.parse.stoppedAt)&&void 0!==r?r:this.state.doc.length,this.tree=s,this.parse=null,!(this.treeLen<(null!=e?e:this.state.doc.length)))return!0
this.parse=this.startParse()}if(t())return!1}}))}takeTree(){let t,e
this.parse&&(t=this.parse.parsedPos)>=this.treeLen&&((null==this.parse.stoppedAt||this.parse.stoppedAt>t)&&this.parse.stopAt(t),this.withContext((()=>{for(;!(e=this.parse.advance()););})),this.treeLen=t,this.tree=e,this.fragments=this.withoutTempSkipped(n.addTree(this.tree,this.fragments,!0)),this.parse=null)}withContext(t){let e=V
V=this
try{return t()}finally{V=e}}withoutTempSkipped(t){for(let e;e=this.tempSkipped.pop();)t=q(t,e.from,e.to)
return t}changes(t,e){let{fragments:s,tree:i,treeLen:o,viewport:a,skipped:l}=this
if(this.takeTree(),!t.empty){let e=[]
if(t.iterChangedRanges(((t,r,n,s)=>e.push({fromA:t,toA:r,fromB:n,toB:s}))),s=n.applyChanges(s,e),i=r.empty,o=0,a={from:t.mapPos(a.from,-1),to:t.mapPos(a.to,1)},this.skipped.length){l=[]
for(let e of this.skipped){let r=t.mapPos(e.from,1),n=t.mapPos(e.to,-1)
r<n&&l.push({from:r,to:n})}}}return new $(this.parser,e,s,i,o,a,l,this.scheduleOn)}updateViewport(t){if(this.viewport.from==t.from&&this.viewport.to==t.to)return!1
this.viewport=t
let e=this.skipped.length
for(let e=0;e<this.skipped.length;e++){let{from:r,to:n}=this.skipped[e]
r<t.to&&n>t.from&&(this.fragments=q(this.fragments,r,n),this.skipped.splice(e--,1))}return!(this.skipped.length>=e)&&(this.reset(),!0)}reset(){this.parse&&(this.takeTree(),this.parse=null)}skipUntilInView(t,e){this.skipped.push({from:t,to:e})}static getSkippingParser(t){return new class extends s{createParse(e,n,s){let o=s[0].from,a=s[s.length-1].to
return{parsedPos:o,advance(){let e=V
if(e){for(let t of s)e.tempSkipped.push(t)
t&&(e.scheduleOn=e.scheduleOn?Promise.all([e.scheduleOn,t]):t)}return this.parsedPos=a,new r(i.none,[],[],a-o)},stoppedAt:null,stopAt(){}}}}}isDone(t){t=Math.min(t,this.state.doc.length)
let e=this.fragments
return this.treeLen>=t&&e.length&&0==e[0].from&&e[0].to>=t}static get(){return V}}function q(t,e,r){return n.applyChanges(t,[{fromA:e,toA:r,fromB:e,toB:r}])}class G{constructor(t){this.context=t,this.tree=t.tree}apply(t){if(!t.docChanged&&this.tree==this.context.tree)return this
let e=this.context.changes(t.changes,t.state),r=this.context.treeLen==t.startState.doc.length?void 0:Math.max(t.changes.mapPos(this.context.treeLen),e.viewport.to)
return e.work(20,r)||e.takeTree(),new G(e)}static init(t){let e=Math.min(3e3,t.doc.length),r=$.create(t.facet(K).parser,t,{from:0,to:e})
return r.work(20,e)||r.takeTree(),new G(r)}}N.state=l.define({create:G.init,update(t,e){for(let t of e.effects)if(t.is(N.setState))return t.value
return e.startState.facet(K)!=e.state.facet(K)?G.init(e.state):t.apply(e)}})
let J=t=>{let e=setTimeout((()=>t()),500)
return()=>clearTimeout(e)}
"undefined"!=typeof requestIdleCallback&&(J=t=>{let e=-1,r=setTimeout((()=>{e=requestIdleCallback(t,{timeout:400})}),100)
return()=>e<0?clearTimeout(r):cancelIdleCallback(e)})
const H="undefined"!=typeof navigator&&(null===(O=navigator.scheduling)||void 0===O?void 0:O.isInputPending)?()=>navigator.scheduling.isInputPending():null,_=g.fromClass(class{constructor(t){this.view=t,this.working=null,this.workScheduled=0,this.chunkEnd=-1,this.chunkBudget=-1,this.work=this.work.bind(this),this.scheduleWork()}update(t){let e=this.view.state.field(N.state).context;(e.updateViewport(t.view.viewport)||this.view.viewport.to>e.treeLen)&&this.scheduleWork(),(t.docChanged||t.selectionSet)&&(this.view.hasFocus&&(this.chunkBudget+=50),this.scheduleWork()),this.checkAsyncSchedule(e)}scheduleWork(){if(this.working)return
let{state:t}=this.view,e=t.field(N.state)
e.tree==e.context.tree&&e.context.isDone(t.doc.length)||(this.working=J(this.work))}work(t){this.working=null
let e=Date.now()
if(this.chunkEnd<e&&(this.chunkEnd<0||this.view.hasFocus)&&(this.chunkEnd=e+3e4,this.chunkBudget=3e3),this.chunkBudget<=0)return
let{state:r,viewport:{to:n}}=this.view,s=r.field(N.state)
if(s.tree==s.context.tree&&s.context.isDone(n+1e5))return
let i=Date.now()+Math.min(this.chunkBudget,100,t&&!H?Math.max(25,t.timeRemaining()-5):1e9),o=s.context.treeLen<n&&r.doc.length>n+1e3,a=s.context.work((()=>H&&H()||Date.now()>i),n+(o?0:1e5))
this.chunkBudget-=Date.now()-e,(a||this.chunkBudget<=0)&&(s.context.takeTree(),this.view.dispatch({effects:N.setState.of(new G(s.context))})),this.chunkBudget>0&&(!a||o)&&this.scheduleWork(),this.checkAsyncSchedule(s.context)}checkAsyncSchedule(t){t.scheduleOn&&(this.workScheduled++,t.scheduleOn.then((()=>this.scheduleWork())).catch((t=>k(this.view.state,t))).then((()=>this.workScheduled--)),t.scheduleOn=null)}destroy(){this.working&&this.working()}isWorking(){return!!(this.working||this.workScheduled>0)}},{eventHandlers:{focus(){this.scheduleWork()}}}),K=h.define({combine:t=>t.length?t[0]:null,enables:t=>[N.state,_,v.contentAttributes.compute([t],(e=>{let r=e.facet(t)
return r&&r.name?{"data-language":r.name}:{}}))]})
class Q{constructor(t,e=[]){this.language=t,this.support=e,this.extension=[t,e]}}class X{constructor(t,e,r,n,s,i=void 0){this.name=t,this.alias=e,this.extensions=r,this.filename=n,this.loadFunc=s,this.support=i,this.loading=null}load(){return this.loading||(this.loading=this.loadFunc().then((t=>this.support=t),(t=>{throw this.loading=null,t})))}static of(t){let{load:e,support:r}=t
if(!e){if(!r)throw new RangeError("Must pass either 'load' or 'support' to LanguageDescription.of")
e=()=>Promise.resolve(r)}return new X(t.name,(t.alias||[]).concat(t.name).map((t=>t.toLowerCase())),t.extensions||[],t.filename,e,r)}static matchFilename(t,e){for(let r of t)if(r.filename&&r.filename.test(e))return r
let r=/\.([^.]+)$/.exec(e)
if(r)for(let e of t)if(e.extensions.indexOf(r[1])>-1)return e
return null}static matchLanguageName(t,e,r=!0){e=e.toLowerCase()
for(let r of t)if(r.alias.some((t=>t==e)))return r
if(r)for(let r of t)for(let t of r.alias){let n=e.indexOf(t)
if(n>-1&&(t.length>2||!/\w/.test(e[n-1])&&!/\w/.test(e[n+t.length])))return r}return null}}const Y=h.define(),Z=h.define({combine:t=>{if(!t.length)return"  "
let e=t[0]
if(!e||/\S/.test(e)||Array.from(e).some((t=>t!=e[0])))throw new Error("Invalid indent unit: "+JSON.stringify(t[0]))
return e}})
function tt(t){let e=t.facet(Z)
return 9==e.charCodeAt(0)?t.tabSize*e.length:e.length}function et(t,e){let r="",n=t.tabSize,s=t.facet(Z)[0]
if("\t"==s){for(;e>=n;)r+="\t",e-=n
s=" "}for(let t=0;t<e;t++)r+=s
return r}function rt(t,e){t instanceof u&&(t=new st(t))
for(let r of t.state.facet(Y)){let n=r(t,e)
if(void 0!==n)return n}let r=E(t.state)
return r.length>=e?function(t,e,r){let n=e.resolveStack(r),s=n.node.enterUnfinishedNodesBefore(r)
if(s!=n.node){let t=[]
for(let e=s;e!=n.node;e=e.parent)t.push(e)
for(let e=t.length-1;e>=0;e--)n={node:t[e],next:n}}return ot(n,t,r)}(t,r,e):null}function nt(t,e,r){let n=Object.create(null),s=new st(t,{overrideIndentation:t=>{var e
return null!==(e=n[t])&&void 0!==e?e:-1}}),i=[]
for(let o=e;o<=r;){let e=t.doc.lineAt(o)
o=e.to+1
let r=rt(s,e.from)
if(null==r)continue;/\S/.test(e.text)||(r=0)
let a=/^\s*/.exec(e.text)[0],l=et(t,r)
a!=l&&(n[e.from]=r,i.push({from:e.from,to:e.from+a.length,insert:l}))}return t.changes(i)}class st{constructor(t,e={}){this.state=t,this.options=e,this.unit=tt(t)}lineAt(t,e=1){let r=this.state.doc.lineAt(t),{simulateBreak:n,simulateDoubleBreak:s}=this.options
return null!=n&&n>=r.from&&n<=r.to?s&&n==t?{text:"",from:t}:(e<0?n<t:n<=t)?{text:r.text.slice(n-r.from),from:n}:{text:r.text.slice(0,n-r.from),from:r.from}:r}textAfterPos(t,e=1){if(this.options.simulateDoubleBreak&&t==this.options.simulateBreak)return""
let{text:r,from:n}=this.lineAt(t,e)
return r.slice(t-n,Math.min(r.length,t+100-n))}column(t,e=1){let{text:r,from:n}=this.lineAt(t,e),s=this.countColumn(r,t-n),i=this.options.overrideIndentation?this.options.overrideIndentation(n):-1
return i>-1&&(s+=i-this.countColumn(r,r.search(/\S|$/))),s}countColumn(t,e=t.length){return c(t,this.state.tabSize,e)}lineIndent(t,e=1){let{text:r,from:n}=this.lineAt(t,e),s=this.options.overrideIndentation
if(s){let t=s(n)
if(t>-1)return t}return this.countColumn(r,r.search(/\S|$/))}get simulatedBreak(){return this.options.simulateBreak||null}}const it=new t
function ot(t,e,r){for(let n=t;n;n=n.next){let t=at(n.node)
if(t)return t(ht.create(e,r,n))}return 0}function at(e){let r=e.type.prop(it)
if(r)return r
let n,s=e.firstChild
if(s&&(n=s.type.prop(t.closedBy))){let t=e.lastChild,r=t&&n.indexOf(t.name)>-1
return e=>ft(e,!0,1,void 0,r&&!function(t){return t.pos==t.options.simulateBreak&&t.options.simulateDoubleBreak}(e)?t.from:void 0)}return null==e.parent?lt:null}function lt(){return 0}class ht extends st{constructor(t,e,r){super(t.state,t.options),this.base=t,this.pos=e,this.context=r}get node(){return this.context.node}static create(t,e,r){return new ht(t,e,r)}get textAfter(){return this.textAfterPos(this.pos)}get baseIndent(){return this.baseIndentFor(this.node)}baseIndentFor(t){let e=this.state.doc.lineAt(t.from)
for(;;){let r=t.resolve(e.from)
for(;r.parent&&r.parent.from==r.from;)r=r.parent
if(ut(r,t))break
e=this.state.doc.lineAt(r.from)}return this.lineIndent(e.from)}continue(){return ot(this.context.next,this.base,this.pos)}}function ut(t,e){for(let r=e;r;r=r.parent)if(t==r)return!0
return!1}function ct({closing:t,align:e=!0,units:r=1}){return n=>ft(n,e,r,t)}function ft(t,e,r,n,s){let i=t.textAfter,o=i.match(/^\s*/)[0].length,a=n&&i.slice(o,o+n.length)==n||s==t.pos+o,l=e?function(t){let e=t.node,r=e.childAfter(e.from),n=e.lastChild
if(!r)return null
let s=t.options.simulateBreak,i=t.state.doc.lineAt(r.from),o=null==s||s<=i.from?i.to:Math.min(i.to,s)
for(let t=r.to;;){let s=e.childAfter(t)
if(!s||s==n)return null
if(!s.type.isSkipped)return s.from<o?r:null
t=s.to}}(t):null
return l?a?t.column(l.from):t.column(l.to):t.baseIndent+(a?0:t.unit*r)}const dt=t=>t.baseIndent
function pt({except:t,units:e=1}={}){return r=>{let n=t&&t.test(r.textAfter)
return r.baseIndent+(n?0:e*r.unit)}}function mt(){return u.transactionFilter.of((t=>{if(!t.docChanged||!t.isUserEvent("input.type")&&!t.isUserEvent("input.complete"))return t
let e=t.startState.languageDataAt("indentOnInput",t.startState.selection.main.head)
if(!e.length)return t
let r=t.newDoc,{head:n}=t.newSelection.main,s=r.lineAt(n)
if(n>s.from+200)return t
let i=r.sliceString(s.from,n)
if(!e.some((t=>t.test(i))))return t
let{state:o}=t,a=-1,l=[]
for(let{head:t}of o.selection.ranges){let e=o.doc.lineAt(t)
if(e.from==a)continue
a=e.from
let r=rt(o,e.from)
if(null==r)continue
let n=/^\s*/.exec(e.text)[0],s=et(o,r)
n!=s&&l.push({from:e.from,to:e.from+n.length,insert:s})}return l.length?[t,{changes:l,sequential:!0}]:t}))}const gt=h.define(),kt=new t
function vt(t){let e=t.firstChild,r=t.lastChild
return e&&e.to<r.from?{from:e.to,to:r.type.isError?t.to:r.from}:null}function wt(t){let e=t.lastChild
return e&&e.to==t.to&&e.type.isError}function bt(t,e,r){for(let n of t.facet(gt)){let s=n(t,e,r)
if(s)return s}return function(t,e,r){let n=E(t)
if(n.length<r)return null
let s=null
for(let i=n.resolveStack(r,1);i;i=i.next){let o=i.node
if(o.to<=r||o.from>r)continue
if(s&&o.from<e)break
let a=o.type.prop(kt)
if(a&&(o.to<n.length-50||n.length==t.doc.length||!wt(o))){let n=a(o,t)
n&&n.from<=r&&n.from>=e&&n.to>r&&(s=n)}}return s}(t,e,r)}function xt(t,e){let r=e.mapPos(t.from,1),n=e.mapPos(t.to,-1)
return r>=n?void 0:{from:r,to:n}}const yt=a.define({map:xt}),At=a.define({map:xt})
function St(t){let e=[]
for(let{head:r}of t.state.selection.ranges)e.some((t=>t.from<=r&&t.to>=r))||e.push(t.lineBlockAt(r))
return e}const Pt=l.define({create:()=>w.none,update(t,e){t=t.map(e.changes)
for(let r of e.effects)if(r.is(yt)&&!Dt(t,r.value.from,r.value.to)){let{preparePlaceholder:n}=e.state.facet(Ft),s=n?w.replace({widget:new $t(n(e.state,r.value))}):Vt
t=t.update({add:[s.range(r.value.from,r.value.to)]})}else r.is(At)&&(t=t.update({filter:(t,e)=>r.value.from!=t||r.value.to!=e,filterFrom:r.value.from,filterTo:r.value.to}))
if(e.selection){let r=!1,{head:n}=e.selection.main
t.between(n,n,((t,e)=>{t<n&&e>n&&(r=!0)})),r&&(t=t.update({filterFrom:n,filterTo:n,filter:(t,e)=>e<=n||t>=n}))}return t},provide:t=>v.decorations.from(t),toJSON(t,e){let r=[]
return t.between(0,e.doc.length,((t,e)=>{r.push(t,e)})),r},fromJSON(t){if(!Array.isArray(t)||t.length%2)throw new RangeError("Invalid JSON for fold state")
let e=[]
for(let r=0;r<t.length;){let n=t[r++],s=t[r++]
if("number"!=typeof n||"number"!=typeof s)throw new RangeError("Invalid JSON for fold state")
e.push(Vt.range(n,s))}return w.set(e,!0)}})
function Ct(t){return t.field(Pt,!1)||d.empty}function Tt(t,e,r){var n
let s=null
return null===(n=t.field(Pt,!1))||void 0===n||n.between(e,r,((t,e)=>{(!s||s.from>t)&&(s={from:t,to:e})})),s}function Dt(t,e,r){let n=!1
return t.between(e,e,((t,s)=>{t==e&&s==r&&(n=!0)})),n}function Ot(t,e){return t.field(Pt,!1)?e:e.concat(a.appendConfig.of(Ut()))}const It=t=>{for(let e of St(t)){let r=bt(t.state,e.from,e.to)
if(r)return t.dispatch({effects:Ot(t.state,[yt.of(r),Lt(t,r)])}),!0}return!1},Bt=t=>{if(!t.state.field(Pt,!1))return!1
let e=[]
for(let r of St(t)){let n=Tt(t.state,r.from,r.to)
n&&e.push(At.of(n),Lt(t,n,!1))}return e.length&&t.dispatch({effects:e}),e.length>0}
function Lt(t,e,r=!0){let n=t.state.doc.lineAt(e.from).number,s=t.state.doc.lineAt(e.to).number
return v.announce.of(`${t.state.phrase(r?"Folded lines":"Unfolded lines")} ${n} ${t.state.phrase("to")} ${s}.`)}const Nt=t=>{let{state:e}=t,r=[]
for(let n=0;n<e.doc.length;){let s=t.lineBlockAt(n),i=bt(e,s.from,s.to)
i&&r.push(yt.of(i)),n=(i?t.lineBlockAt(i.to):s).to+1}return r.length&&t.dispatch({effects:Ot(t.state,r)}),!!r.length},Mt=t=>{let e=t.state.field(Pt,!1)
if(!e||!e.size)return!1
let r=[]
return e.between(0,t.state.doc.length,((t,e)=>{r.push(At.of({from:t,to:e}))})),t.dispatch({effects:r}),!0}
function Rt(t,e){for(let r=e;;){let n=bt(t.state,r.from,r.to)
if(n&&n.to>e.from)return n
if(!r.from)return null
r=t.lineBlockAt(r.from-1)}}const Et=t=>{let e=[]
for(let r of St(t)){let n=Tt(t.state,r.from,r.to)
if(n)e.push(At.of(n),Lt(t,n,!1))
else{let n=Rt(t,r)
n&&e.push(yt.of(n),Lt(t,n))}}return e.length>0&&t.dispatch({effects:Ot(t.state,e)}),!!e.length},jt=[{key:"Ctrl-Shift-[",mac:"Cmd-Alt-[",run:It},{key:"Ctrl-Shift-]",mac:"Cmd-Alt-]",run:Bt},{key:"Ctrl-Alt-[",run:Nt},{key:"Ctrl-Alt-]",run:Mt}],Wt={placeholderDOM:null,preparePlaceholder:null,placeholderText:"…"},Ft=h.define({combine:t=>f(t,Wt)})
function Ut(t){let e=[Pt,Ht]
return t&&e.push(Ft.of(t)),e}function zt(t,e){let{state:r}=t,n=r.facet(Ft),s=e=>{let r=t.lineBlockAt(t.posAtDOM(e.target)),n=Tt(t.state,r.from,r.to)
n&&t.dispatch({effects:At.of(n)}),e.preventDefault()}
if(n.placeholderDOM)return n.placeholderDOM(t,s,e)
let i=document.createElement("span")
return i.textContent=n.placeholderText,i.setAttribute("aria-label",r.phrase("folded code")),i.title=r.phrase("unfold"),i.className="cm-foldPlaceholder",i.onclick=s,i}const Vt=w.replace({widget:new class extends b{toDOM(t){return zt(t,null)}}})
class $t extends b{constructor(t){super(),this.value=t}eq(t){return this.value==t.value}toDOM(t){return zt(t,this.value)}}const qt={openText:"⌄",closedText:"›",markerDOM:null,domEventHandlers:{},foldingChanged:()=>!1}
class Gt extends y{constructor(t,e){super(),this.config=t,this.open=e}eq(t){return this.config==t.config&&this.open==t.open}toDOM(t){if(this.config.markerDOM)return this.config.markerDOM(this.open)
let e=document.createElement("span")
return e.textContent=this.open?this.config.openText:this.config.closedText,e.title=t.state.phrase(this.open?"Fold line":"Unfold line"),e}}function Jt(t={}){let e=Object.assign(Object.assign({},qt),t),r=new Gt(e,!0),n=new Gt(e,!1),s=g.fromClass(class{constructor(t){this.from=t.viewport.from,this.markers=this.buildMarkers(t)}update(t){(t.docChanged||t.viewportChanged||t.startState.facet(K)!=t.state.facet(K)||t.startState.field(Pt,!1)!=t.state.field(Pt,!1)||E(t.startState)!=E(t.state)||e.foldingChanged(t))&&(this.markers=this.buildMarkers(t.view))}buildMarkers(t){let e=new p
for(let s of t.viewportLineBlocks){let i=Tt(t.state,s.from,s.to)?n:bt(t.state,s.from,s.to)?r:null
i&&e.add(s.from,s.from,i)}return e.finish()}}),{domEventHandlers:i}=e
return[s,x({class:"cm-foldGutter",markers(t){var e
return(null===(e=t.plugin(s))||void 0===e?void 0:e.markers)||d.empty},initialSpacer:()=>new Gt(e,!1),domEventHandlers:Object.assign(Object.assign({},i),{click:(t,e,r)=>{if(i.click&&i.click(t,e,r))return!0
let n=Tt(t.state,e.from,e.to)
if(n)return t.dispatch({effects:At.of(n)}),!0
let s=bt(t.state,e.from,e.to)
return!!s&&(t.dispatch({effects:yt.of(s)}),!0)}})}),Ut()]}const Ht=v.baseTheme({".cm-foldPlaceholder":{backgroundColor:"#eee",border:"1px solid #ddd",color:"#888",borderRadius:".2em",margin:"0 1px",padding:"0 1px",cursor:"pointer"},".cm-foldGutter span":{padding:"0 1px",cursor:"pointer"}})
class _t{constructor(t,e){let r
function n(t){let e=D.newName()
return(r||(r=Object.create(null)))["."+e]=t,e}this.specs=t
const s="string"==typeof e.all?e.all:e.all?n(e.all):void 0,i=e.scope
this.scope=i instanceof N?t=>t.prop(I)==i.data:i?t=>t==i:void 0,this.style=P(t.map((t=>({tag:t.tag,class:t.class||n(Object.assign({},t,{tag:null}))}))),{all:s}).style,this.module=r?new D(r):null,this.themeType=e.themeType}static define(t,e){return new _t(t,e||{})}}const Kt=h.define(),Qt=h.define({combine:t=>t.length?[t[0]]:null})
function Xt(t){let e=t.facet(Kt)
return e.length?e:t.facet(Qt)}function Yt(t,e){let r,n=[ee]
return t instanceof _t&&(t.module&&n.push(v.styleModule.of(t.module)),r=t.themeType),(null==e?void 0:e.fallback)?n.push(Qt.of(t)):r?n.push(Kt.computeN([v.darkTheme],(e=>e.facet(v.darkTheme)==("dark"==r)?[t]:[]))):n.push(Kt.of(t)),n}function Zt(t,e,r){let n=Xt(t),s=null
if(n)for(let t of n)if(!t.scope||r&&t.scope(r)){let r=t.style(e)
r&&(s=s?s+" "+r:r)}return s}class te{constructor(t){this.markCache=Object.create(null),this.tree=E(t.state),this.decorations=this.buildDeco(t,Xt(t.state)),this.decoratedTo=t.viewport.to}update(t){let e=E(t.state),r=Xt(t.state),n=r!=Xt(t.startState),{viewport:s}=t.view,i=t.changes.mapPos(this.decoratedTo,1)
e.length<s.to&&!n&&e.type==this.tree.type&&i>=s.to?(this.decorations=this.decorations.map(t.changes),this.decoratedTo=i):(e!=this.tree||t.viewportChanged||n)&&(this.tree=e,this.decorations=this.buildDeco(t.view,r),this.decoratedTo=s.to)}buildDeco(t,e){if(!e||!this.tree.length)return w.none
let r=new p
for(let{from:n,to:s}of t.visibleRanges)C(this.tree,e,((t,e,n)=>{r.add(t,e,this.markCache[n]||(this.markCache[n]=w.mark({class:n})))}),n,s)
return r.finish()}}const ee=m.high(g.fromClass(te,{decorations:t=>t.decorations})),re=_t.define([{tag:S.meta,color:"#404740"},{tag:S.link,textDecoration:"underline"},{tag:S.heading,textDecoration:"underline",fontWeight:"bold"},{tag:S.emphasis,fontStyle:"italic"},{tag:S.strong,fontWeight:"bold"},{tag:S.strikethrough,textDecoration:"line-through"},{tag:S.keyword,color:"#708"},{tag:[S.atom,S.bool,S.url,S.contentSeparator,S.labelName],color:"#219"},{tag:[S.literal,S.inserted],color:"#164"},{tag:[S.string,S.deleted],color:"#a11"},{tag:[S.regexp,S.escape,S.special(S.string)],color:"#e40"},{tag:S.definition(S.variableName),color:"#00f"},{tag:S.local(S.variableName),color:"#30a"},{tag:[S.typeName,S.namespace],color:"#085"},{tag:S.className,color:"#167"},{tag:[S.special(S.variableName),S.macroName],color:"#256"},{tag:S.definition(S.propertyName),color:"#00c"},{tag:S.comment,color:"#940"},{tag:S.invalid,color:"#f00"}]),ne=v.baseTheme({"&.cm-focused .cm-matchingBracket":{backgroundColor:"#328c8252"},"&.cm-focused .cm-nonmatchingBracket":{backgroundColor:"#bb555544"}}),se="()[]{}",ie=h.define({combine:t=>f(t,{afterCursor:!0,brackets:se,maxScanDistance:1e4,renderMatch:le})}),oe=w.mark({class:"cm-matchingBracket"}),ae=w.mark({class:"cm-nonmatchingBracket"})
function le(t){let e=[],r=t.matched?oe:ae
return e.push(r.range(t.start.from,t.start.to)),t.end&&e.push(r.range(t.end.from,t.end.to)),e}const he=[l.define({create:()=>w.none,update(t,e){if(!e.docChanged&&!e.selection)return t
let r=[],n=e.state.facet(ie)
for(let t of e.state.selection.ranges){if(!t.empty)continue
let s=pe(e.state,t.head,-1,n)||t.head>0&&pe(e.state,t.head-1,1,n)||n.afterCursor&&(pe(e.state,t.head,1,n)||t.head<e.state.doc.length&&pe(e.state,t.head+1,-1,n))
s&&(r=r.concat(n.renderMatch(s,e.state)))}return w.set(r,!0)},provide:t=>v.decorations.from(t)}),ne]
function ue(t={}){return[ie.of(t),he]}const ce=new t
function fe(e,r,n){let s=e.prop(r<0?t.openedBy:t.closedBy)
if(s)return s
if(1==e.name.length){let t=n.indexOf(e.name)
if(t>-1&&t%2==(r<0?1:0))return[n[t+r]]}return null}function de(t){let e=t.type.prop(ce)
return e?e(t.node):t}function pe(t,e,r,n={}){let s=n.maxScanDistance||1e4,i=n.brackets||se,o=E(t),a=o.resolveInner(e,r)
for(let n=a;n;n=n.parent){let s=fe(n.type,r,i)
if(s&&n.from<n.to){let o=de(n)
if(o&&(r>0?e>=o.from&&e<o.to:e>o.from&&e<=o.to))return me(t,e,r,n,o,s,i)}}return function(t,e,r,n,s,i,o){let a=r<0?t.sliceDoc(e-1,e):t.sliceDoc(e,e+1),l=o.indexOf(a)
if(l<0||l%2==0!=r>0)return null
let h={from:r<0?e-1:e,to:r>0?e+1:e},u=t.doc.iterRange(e,r>0?t.doc.length:0),c=0
for(let t=0;!u.next().done&&t<=i;){let i=u.value
r<0&&(t+=i.length)
let a=e+t*r
for(let t=r>0?0:i.length-1,e=r>0?i.length:-1;t!=e;t+=r){let e=o.indexOf(i[t])
if(!(e<0||n.resolveInner(a+t,1).type!=s))if(e%2==0==r>0)c++
else{if(1==c)return{start:h,end:{from:a+t,to:a+t+1},matched:e>>1==l>>1}
c--}}r>0&&(t+=i.length)}return u.done?{start:h,matched:!1}:null}(t,e,r,o,a.type,s,i)}function me(t,e,r,n,s,i,o){let a=n.parent,l={from:s.from,to:s.to},h=0,u=null==a?void 0:a.cursor()
if(u&&(r<0?u.childBefore(n.from):u.childAfter(n.to)))do{if(r<0?u.to<=n.from:u.from>=n.to){if(0==h&&i.indexOf(u.type.name)>-1&&u.from<u.to){let t=de(u)
return{start:l,end:t?{from:t.from,to:t.to}:void 0,matched:!0}}if(fe(u.type,r,o))h++
else if(fe(u.type,-r,o)){if(0==h){let t=de(u)
return{start:l,end:t&&t.from<t.to?{from:t.from,to:t.to}:void 0,matched:!1}}h--}}}while(r<0?u.prevSibling():u.nextSibling())
return{start:l,matched:!1}}function ge(t,e,r,n=0,s=0){null==e&&-1==(e=t.search(/[^\s\u00a0]/))&&(e=t.length)
let i=s
for(let s=n;s<e;s++)9==t.charCodeAt(s)?i+=r-i%r:i++
return i}class ke{constructor(t,e,r,n){this.string=t,this.tabSize=e,this.indentUnit=r,this.overrideIndent=n,this.pos=0,this.start=0,this.lastColumnPos=0,this.lastColumnValue=0}eol(){return this.pos>=this.string.length}sol(){return 0==this.pos}peek(){return this.string.charAt(this.pos)||void 0}next(){if(this.pos<this.string.length)return this.string.charAt(this.pos++)}eat(t){let e,r=this.string.charAt(this.pos)
if(e="string"==typeof t?r==t:r&&(t instanceof RegExp?t.test(r):t(r)),e)return++this.pos,r}eatWhile(t){let e=this.pos
for(;this.eat(t););return this.pos>e}eatSpace(){let t=this.pos
for(;/[\s\u00a0]/.test(this.string.charAt(this.pos));)++this.pos
return this.pos>t}skipToEnd(){this.pos=this.string.length}skipTo(t){let e=this.string.indexOf(t,this.pos)
if(e>-1)return this.pos=e,!0}backUp(t){this.pos-=t}column(){return this.lastColumnPos<this.start&&(this.lastColumnValue=ge(this.string,this.start,this.tabSize,this.lastColumnPos,this.lastColumnValue),this.lastColumnPos=this.start),this.lastColumnValue}indentation(){var t
return null!==(t=this.overrideIndent)&&void 0!==t?t:ge(this.string,null,this.tabSize)}match(t,e,r){if("string"==typeof t){let n=t=>r?t.toLowerCase():t
return n(this.string.substr(this.pos,t.length))==n(t)?(!1!==e&&(this.pos+=t.length),!0):null}{let r=this.string.slice(this.pos).match(t)
return r&&r.index>0?null:(r&&!1!==e&&(this.pos+=r[0].length),r)}}current(){return this.string.slice(this.start,this.pos)}}function ve(t){if("object"!=typeof t)return t
let e={}
for(let r in t){let n=t[r]
e[r]=n instanceof Array?n.slice():n}return e}const we=new WeakMap
class be extends N{constructor(e){let r,n=B(e.languageData),o={name:(a=e).name||"",token:a.token,blankLine:a.blankLine||(()=>{}),startState:a.startState||(()=>!0),copyState:a.copyState||ve,indent:a.indent||(()=>null),languageData:a.languageData||{},tokenTable:a.tokenTable||Pe}
var a
super(n,new class extends s{createParse(t,e,n){return new Ae(r,t,e,n)}},[Y.of(((t,e)=>this.getIndent(t,e)))],e.name),this.topNode=function(t){let e=i.define({id:Ce.length,name:"Document",props:[I.add((()=>t))],top:!0})
return Ce.push(e),e}(n),r=this,this.streamParser=o,this.stateAfter=new t({perNode:!0}),this.tokenTable=e.tokenTable?new Be(o.tokenTable):Le}static define(t){return new be(t)}getIndent(t,e){let r,n=E(t.state),s=n.resolve(e)
for(;s&&s.type!=this.topNode;)s=s.parent
if(!s)return null
let{overrideIndentation:i}=t.options
i&&(r=we.get(t.state),null!=r&&r<e-1e4&&(r=void 0))
let o,a,l=xe(this,n,0,s.from,null!=r?r:e)
if(l?(a=l.state,o=l.pos+1):(a=this.streamParser.startState(t.unit),o=0),e-o>1e4)return null
for(;o<e;){let r=t.state.doc.lineAt(o),n=Math.min(e,r.to)
if(r.length){let e=i?i(r.from):-1,s=new ke(r.text,t.state.tabSize,t.unit,e<0?void 0:e)
for(;s.pos<n-r.from;)Se(this.streamParser.token,s,a)}else this.streamParser.blankLine(a,t.unit)
if(n==e)break
o=r.to+1}let h=t.lineAt(e)
return i&&null==r&&we.set(t.state,h.from),this.streamParser.indent(a,/^\s*(.*)/.exec(h.text)[1],t)}get allowsNesting(){return!1}}function xe(t,e,n,s,i){let o=n>=s&&n+e.length<=i&&e.prop(t.stateAfter)
if(o)return{state:t.streamParser.copyState(o),pos:n+e.length}
for(let o=e.children.length-1;o>=0;o--){let a=e.children[o],l=n+e.positions[o],h=a instanceof r&&l<i&&xe(t,a,l,s,i)
if(h)return h}return null}function ye(t,e,n,s,i){if(i&&n<=0&&s>=e.length)return e
i||e.type!=t.topNode||(i=!0)
for(let o=e.children.length-1;o>=0;o--){let a,l=e.positions[o],h=e.children[o]
if(l<s&&h instanceof r){if(!(a=ye(t,h,n-l,s-l,i)))break
return i?new r(e.type,e.children.slice(0,o).concat(a),e.positions.slice(0,o+1),l+a.length):a}}return null}class Ae{constructor(t,e,n,s){this.lang=t,this.input=e,this.fragments=n,this.ranges=s,this.stoppedAt=null,this.chunks=[],this.chunkPos=[],this.chunk=[],this.chunkReused=void 0,this.rangeIndex=0,this.to=s[s.length-1].to
let i=$.get(),o=s[0].from,{state:a,tree:l}=function(t,e,n,s){for(let r of e){let e,s=r.from+(r.openStart?25:0),i=r.to-(r.openEnd?25:0),o=s<=n&&i>n&&xe(t,r.tree,0-r.offset,n,i)
if(o&&(e=ye(t,r.tree,n+r.offset,o.pos+r.offset,!1)))return{state:o.state,tree:e}}return{state:t.streamParser.startState(s?tt(s):4),tree:r.empty}}(t,n,o,null==i?void 0:i.state)
this.state=a,this.parsedPos=this.chunkStart=o+l.length
for(let t=0;t<l.children.length;t++)this.chunks.push(l.children[t]),this.chunkPos.push(l.positions[t])
i&&this.parsedPos<i.viewport.from-1e5&&(this.state=this.lang.streamParser.startState(tt(i.state)),i.skipUntilInView(this.parsedPos,i.viewport.from),this.parsedPos=i.viewport.from),this.moveRangeIndex()}advance(){let t=$.get(),e=null==this.stoppedAt?this.to:Math.min(this.to,this.stoppedAt),r=Math.min(e,this.chunkStart+2048)
for(t&&(r=Math.min(r,t.viewport.to));this.parsedPos<r;)this.parseLine(t)
return this.chunkStart<this.parsedPos&&this.finishChunk(),this.parsedPos>=e?this.finish():t&&this.parsedPos>=t.viewport.to?(t.skipUntilInView(this.parsedPos,e),this.finish()):null}stopAt(t){this.stoppedAt=t}lineAfter(t){let e=this.input.chunk(t)
if(this.input.lineChunks)"\n"==e&&(e="")
else{let t=e.indexOf("\n")
t>-1&&(e=e.slice(0,t))}return t+e.length<=this.to?e:e.slice(0,this.to-t)}nextLine(){let t=this.parsedPos,e=this.lineAfter(t),r=t+e.length
for(let t=this.rangeIndex;;){let n=this.ranges[t].to
if(n>=r)break
if(e=e.slice(0,n-(r-e.length)),t++,t==this.ranges.length)break
let s=this.ranges[t].from,i=this.lineAfter(s)
e+=i,r=s+i.length}return{line:e,end:r}}skipGapsTo(t,e,r){for(;;){let n=this.ranges[this.rangeIndex].to,s=t+e
if(r>0?n>s:n>=s)break
e+=this.ranges[++this.rangeIndex].from-n}return e}moveRangeIndex(){for(;this.ranges[this.rangeIndex].to<this.parsedPos;)this.rangeIndex++}emitToken(t,e,r,n,s){if(this.ranges.length>1){e+=s=this.skipGapsTo(e,s,1)
let t=this.chunk.length
r+=s=this.skipGapsTo(r,s,-1),n+=this.chunk.length-t}return this.chunk.push(t,e,r,n),s}parseLine(t){let{line:e,end:r}=this.nextLine(),n=0,{streamParser:s}=this.lang,i=new ke(e,t?t.state.tabSize:4,t?tt(t.state):2)
if(i.eol())s.blankLine(this.state,i.indentUnit)
else for(;!i.eol();){let t=Se(s.token,i,this.state)
if(t&&(n=this.emitToken(this.lang.tokenTable.resolve(t),this.parsedPos+i.start,this.parsedPos+i.pos,4,n)),i.start>1e4)break}this.parsedPos=r,this.moveRangeIndex(),this.parsedPos<this.to&&this.parsedPos++}finishChunk(){let t=r.build({buffer:this.chunk,start:this.chunkStart,length:this.parsedPos-this.chunkStart,nodeSet:Te,topID:0,maxBufferLength:2048,reused:this.chunkReused})
t=new r(t.type,t.children,t.positions,t.length,[[this.lang.stateAfter,this.lang.streamParser.copyState(this.state)]]),this.chunks.push(t),this.chunkPos.push(this.chunkStart-this.ranges[0].from),this.chunk=[],this.chunkReused=void 0,this.chunkStart=this.parsedPos}finish(){return new r(this.lang.topNode,this.chunks,this.chunkPos,this.parsedPos-this.ranges[0].from).balance()}}function Se(t,e,r){e.start=e.pos
for(let n=0;n<10;n++){let n=t(e,r)
if(e.pos>e.start)return n}throw new Error("Stream parser failed to advance stream.")}const Pe=Object.create(null),Ce=[i.none],Te=new o(Ce),De=[],Oe=Object.create(null),Ie=Object.create(null)
for(let[t,e]of[["variable","variableName"],["variable-2","variableName.special"],["string-2","string.special"],["def","variableName.definition"],["tag","tagName"],["attribute","attributeName"],["type","typeName"],["builtin","variableName.standard"],["qualifier","modifier"],["error","invalid"],["header","heading"],["property","propertyName"]])Ie[t]=Me(Pe,e)
class Be{constructor(t){this.extra=t,this.table=Object.assign(Object.create(null),Ie)}resolve(t){return t?this.table[t]||(this.table[t]=Me(this.extra,t)):0}}const Le=new Be(Pe)
function Ne(t,e){De.indexOf(t)>-1||(De.push(t),console.warn(e))}function Me(t,e){let r=[]
for(let n of e.split(" ")){let e=[]
for(let r of n.split(".")){let n=t[r]||S[r]
n?"function"==typeof n?e.length?e=e.map(n):Ne(r,`Modifier ${r} used at start of tag`):e.length?Ne(r,`Tag ${r} used as modifier`):e=Array.isArray(n)?n:[n]:Ne(r,`Unknown highlighting tag ${r}`)}for(let t of e)r.push(t)}if(!r.length)return 0
let n=e.replace(/ /g,"_"),s=n+" "+r.map((t=>t.id)),o=Oe[s]
if(o)return o.id
let a=Oe[s]=i.define({id:Ce.length,name:n,props:[T({[n]:r})]})
return Ce.push(a),a.id}function Re(t){return t.length<=4096&&/[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac\ufb50-\ufdff]/.test(t)}function Ee(t){for(let e=t.iter();!e.next().done;)if(Re(e.value))return!0
return!1}const je=h.define({combine:t=>t.some((t=>t))})
function We(t={}){let e=[Fe]
return t.alwaysIsolate&&e.push(je.of(!0)),e}const Fe=g.fromClass(class{constructor(t){this.always=t.state.facet(je)||t.textDirection!=A.LTR||t.state.facet(v.perLineTextDirection),this.hasRTL=!this.always&&Ee(t.state.doc),this.tree=E(t.state),this.decorations=this.always||this.hasRTL?Ue(t,this.tree,this.always):w.none}update(t){let e=t.state.facet(je)||t.view.textDirection!=A.LTR||t.state.facet(v.perLineTextDirection)
if(e||this.hasRTL||!function(t){let e=!1
return t.iterChanges(((t,r,n,s,i)=>{!e&&Ee(i)&&(e=!0)})),e}(t.changes)||(this.hasRTL=!0),!e&&!this.hasRTL)return
let r=E(t.state);(e!=this.always||r!=this.tree||t.docChanged||t.viewportChanged)&&(this.tree=r,this.always=e,this.decorations=Ue(t.view,r,e))}},{provide:t=>{function e(e){var r,n
return null!==(n=null===(r=e.plugin(t))||void 0===r?void 0:r.decorations)&&void 0!==n?n:w.none}return[v.outerDecorations.of(e),m.lowest(v.bidiIsolatedRanges.of(e))]}})
function Ue(e,r,n){let s=new p,i=e.visibleRanges
n||(i=function(t,e){let r=e.iter(),n=0,s=[],i=null
for(let{from:e,to:o}of t)if(!(i&&i.to>e&&(e=i.to,e>=o)))for(n+r.value.length<e&&(r.next(e-(n+r.value.length)),n=e);;){let t=n,e=n+r.value.length
if(!r.lineBreak&&Re(r.value)&&(i&&i.to>t-10?i.to=Math.min(o,e):s.push(i={from:t,to:Math.min(o,e)})),e>=o)break
n=e,r.next()}return s}(i,e.state.doc))
for(let{from:e,to:n}of i)r.iterate({enter:e=>{let r=e.type.prop(t.isolate)
r&&s.add(e.from,e.to,ze[r])},from:e,to:n})
return s.finish()}const ze={rtl:w.mark({class:"cm-iso",inclusive:!0,attributes:{dir:"rtl"},bidiIsolate:A.RTL}),ltr:w.mark({class:"cm-iso",inclusive:!0,attributes:{dir:"ltr"},bidiIsolate:A.LTR}),auto:w.mark({class:"cm-iso",inclusive:!0,attributes:{dir:"auto"},bidiIsolate:null})}
export{z as DocInput,_t as HighlightStyle,st as IndentContext,R as LRLanguage,N as Language,X as LanguageDescription,Q as LanguageSupport,$ as ParseContext,be as StreamLanguage,ke as StringStream,ht as TreeIndentContext,We as bidiIsolates,ue as bracketMatching,ce as bracketMatchingHandle,Ut as codeFolding,pt as continuedIndent,re as defaultHighlightStyle,B as defineLanguageFacet,ct as delimitedIndent,j as ensureSyntaxTree,dt as flatIndent,Nt as foldAll,It as foldCode,yt as foldEffect,Jt as foldGutter,vt as foldInside,jt as foldKeymap,kt as foldNodeProp,gt as foldService,Pt as foldState,bt as foldable,Ct as foldedRanges,F as forceParsing,tt as getIndentUnit,rt as getIndentation,Zt as highlightingFor,it as indentNodeProp,mt as indentOnInput,nt as indentRange,Y as indentService,et as indentString,Z as indentUnit,K as language,I as languageDataProp,pe as matchBrackets,L as sublanguageProp,Yt as syntaxHighlighting,U as syntaxParserRunning,E as syntaxTree,W as syntaxTreeAvailable,Et as toggleFold,Mt as unfoldAll,Bt as unfoldCode,At as unfoldEffect}
