import{Text,findClusterBreak}from"@codemirror/text";export{Text}from"@codemirror/text";const DefaultSplit=/\r\n?|\n/;var MapMode=function(e){return e[e.Simple=0]="Simple",e[e.TrackDel=1]="TrackDel",e[e.TrackBefore=2]="TrackBefore",e[e.TrackAfter=3]="TrackAfter",e}(MapMode||(MapMode={}));class ChangeDesc{constructor(e){this.sections=e}get length(){let e=0;for(let t=0;t<this.sections.length;t+=2)e+=this.sections[t];return e}get newLength(){let e=0;for(let t=0;t<this.sections.length;t+=2){let n=this.sections[t+1];e+=n<0?this.sections[t]:n}return e}get empty(){return 0==this.sections.length||2==this.sections.length&&this.sections[1]<0}iterGaps(e){for(let t=0,n=0,r=0;t<this.sections.length;){let i=this.sections[t++],s=this.sections[t++];s<0?(e(n,r,i),r+=i):r+=s,n+=i}}iterChangedRanges(e,t=!1){iterChanges(this,e,t)}get invertedDesc(){let e=[];for(let t=0;t<this.sections.length;){let n=this.sections[t++],r=this.sections[t++];r<0?e.push(n,r):e.push(r,n)}return new ChangeDesc(e)}composeDesc(e){return this.empty?e:e.empty?this:composeSets(this,e)}mapDesc(e,t=!1){return e.empty?this:mapSet(this,e,t)}mapPos(e,t=-1,n=MapMode.Simple){let r=0,i=0;for(let s=0;s<this.sections.length;){let a=this.sections[s++],o=this.sections[s++],l=r+a;if(o<0){if(l>e)return i+(e-r);i+=a}else{if(n!=MapMode.Simple&&l>=e&&(n==MapMode.TrackDel&&r<e&&l>e||n==MapMode.TrackBefore&&r<e||n==MapMode.TrackAfter&&l>e))return null;if(l>e||l==e&&t<0&&!a)return e==r||t<0?i:i+o;i+=o}r=l}if(e>r)throw new RangeError(`Position ${e} is out of range for changeset of length ${r}`);return i}touchesRange(e,t=e){for(let n=0,r=0;n<this.sections.length&&r<=t;){let i=r+this.sections[n++];if(this.sections[n++]>=0&&r<=t&&i>=e)return!(r<e&&i>t)||"cover";r=i}return!1}toString(){let e="";for(let t=0;t<this.sections.length;){let n=this.sections[t++],r=this.sections[t++];e+=(e?" ":"")+n+(r>=0?":"+r:"")}return e}toJSON(){return this.sections}static fromJSON(e){if(!Array.isArray(e)||e.length%2||e.some(e=>"number"!=typeof e))throw new RangeError("Invalid JSON representation of ChangeDesc");return new ChangeDesc(e)}}class ChangeSet extends ChangeDesc{constructor(e,t){super(e),this.inserted=t}apply(e){if(this.length!=e.length)throw new RangeError("Applying change set to a document with the wrong length");return iterChanges(this,(t,n,r,i,s)=>e=e.replace(r,r+(n-t),s),!1),e}mapDesc(e,t=!1){return mapSet(this,e,t,!0)}invert(e){let t=this.sections.slice(),n=[];for(let r=0,i=0;r<t.length;r+=2){let s=t[r],a=t[r+1];if(a>=0){t[r]=a,t[r+1]=s;let o=r>>1;for(;n.length<o;)n.push(Text.empty);n.push(s?e.slice(i,i+s):Text.empty)}i+=s}return new ChangeSet(t,n)}compose(e){return this.empty?e:e.empty?this:composeSets(this,e,!0)}map(e,t=!1){return e.empty?this:mapSet(this,e,t,!0)}iterChanges(e,t=!1){iterChanges(this,e,t)}get desc(){return new ChangeDesc(this.sections)}filter(e){let t=[],n=[],r=[],i=new SectionIter(this);e:for(let s=0,a=0;;){let o=s==e.length?1e9:e[s++];for(;a<o||a==o&&0==i.len;){if(i.done)break e;let e=Math.min(i.len,o-a);addSection(r,e,-1);let s=-1==i.ins?-1:0==i.off?i.ins:0;addSection(t,e,s),s>0&&addInsert(n,t,i.text),i.forward(e),a+=e}let l=e[s++];for(;a<l;){if(i.done)break e;let e=Math.min(i.len,l-a);addSection(t,e,-1),addSection(r,e,-1==i.ins?-1:0==i.off?i.ins:0),i.forward(e),a+=e}}return{changes:new ChangeSet(t,n),filtered:new ChangeDesc(r)}}toJSON(){let e=[];for(let t=0;t<this.sections.length;t+=2){let n=this.sections[t],r=this.sections[t+1];r<0?e.push(n):0==r?e.push([n]):e.push([n].concat(this.inserted[t>>1].toJSON()))}return e}static of(e,t,n){let r=[],i=[],s=0,a=null;function o(e=!1){if(!e&&!r.length)return;s<t&&addSection(r,t-s,-1);let n=new ChangeSet(r,i);a=a?a.compose(n.map(a)):n,r=[],i=[],s=0}return function e(l){if(Array.isArray(l))for(let t of l)e(t);else if(l instanceof ChangeSet){if(l.length!=t)throw new RangeError(`Mismatched change set length (got ${l.length}, expected ${t})`);o(),a=a?a.compose(l.map(a)):l}else{let{from:e,to:a=e,insert:c}=l;if(e>a||e<0||a>t)throw new RangeError(`Invalid change range ${e} to ${a} (in doc of length ${t})`);let h=c?"string"==typeof c?Text.of(c.split(n||DefaultSplit)):c:Text.empty,f=h.length;if(e==a&&0==f)return;e<s&&o(),e>s&&addSection(r,e-s,-1),addSection(r,a-e,f),addInsert(i,r,h),s=a}}(e),o(!a),a}static empty(e){return new ChangeSet(e?[e,-1]:[],[])}static fromJSON(e){if(!Array.isArray(e))throw new RangeError("Invalid JSON representation of ChangeSet");let t=[],n=[];for(let r=0;r<e.length;r++){let i=e[r];if("number"==typeof i)t.push(i,-1);else{if(!Array.isArray(i)||"number"!=typeof i[0]||i.some((e,t)=>t&&"string"!=typeof e))throw new RangeError("Invalid JSON representation of ChangeSet");if(1==i.length)t.push(i[0],0);else{for(;n.length<r;)n.push(Text.empty);n[r]=Text.of(i.slice(1)),t.push(i[0],n[r].length)}}}return new ChangeSet(t,n)}}function addSection(e,t,n,r=!1){if(0==t&&n<=0)return;let i=e.length-2;i>=0&&n<=0&&n==e[i+1]?e[i]+=t:0==t&&0==e[i]?e[i+1]+=n:r?(e[i]+=t,e[i+1]+=n):e.push(t,n)}function addInsert(e,t,n){if(0==n.length)return;let r=t.length-2>>1;if(r<e.length)e[e.length-1]=e[e.length-1].append(n);else{for(;e.length<r;)e.push(Text.empty);e.push(n)}}function iterChanges(e,t,n){let r=e.inserted;for(let i=0,s=0,a=0;a<e.sections.length;){let o=e.sections[a++],l=e.sections[a++];if(l<0)i+=o,s+=o;else{let c=i,h=s,f=Text.empty;for(;c+=o,h+=l,l&&r&&(f=f.append(r[a-2>>1])),!(n||a==e.sections.length||e.sections[a+1]<0);)o=e.sections[a++],l=e.sections[a++];t(i,c,s,h,f),i=c,s=h}}}function mapSet(e,t,n,r=!1){let i=[],s=r?[]:null,a=new SectionIter(e),o=new SectionIter(t);for(let e=0,t=0;;)if(-1==a.ins)e+=a.len,a.next();else if(-1==o.ins&&t<e){let n=Math.min(o.len,e-t);o.forward(n),addSection(i,n,-1),t+=n}else if(o.ins>=0&&(a.done||t<e||t==e&&(o.len<a.len||o.len==a.len&&!n))){for(addSection(i,o.ins,-1);e>t&&!a.done&&e+a.len<t+o.len;)e+=a.len,a.next();t+=o.len,o.next()}else{if(!(a.ins>=0)){if(a.done&&o.done)return s?new ChangeSet(i,s):new ChangeDesc(i);throw new Error("Mismatched change set lengths")}{let n=0,r=e+a.len;for(;;)if(o.ins>=0&&t>e&&t+o.len<r)n+=o.ins,t+=o.len,o.next();else{if(!(-1==o.ins&&t<r))break;{let e=Math.min(o.len,r-t);n+=e,o.forward(e),t+=e}}addSection(i,n,a.ins),s&&addInsert(s,i,a.text),e=r,a.next()}}}function composeSets(e,t,n=!1){let r=[],i=n?[]:null,s=new SectionIter(e),a=new SectionIter(t);for(let e=!1;;){if(s.done&&a.done)return i?new ChangeSet(r,i):new ChangeDesc(r);if(0==s.ins)addSection(r,s.len,0,e),s.next();else if(0!=a.len||a.done){if(s.done||a.done)throw new Error("Mismatched change set lengths");{let t=Math.min(s.len2,a.len),n=r.length;if(-1==s.ins){let n=-1==a.ins?-1:a.off?0:a.ins;addSection(r,t,n,e),i&&n&&addInsert(i,r,a.text)}else-1==a.ins?(addSection(r,s.off?0:s.len,t,e),i&&addInsert(i,r,s.textBit(t))):(addSection(r,s.off?0:s.len,a.off?0:a.ins,e),i&&!a.off&&addInsert(i,r,a.text));e=(s.ins>t||a.ins>=0&&a.len>t)&&(e||r.length>n),s.forward2(t),a.forward(t)}}else addSection(r,0,a.ins,e),i&&addInsert(i,r,a.text),a.next()}}class SectionIter{constructor(e){this.set=e,this.i=0,this.next()}next(){let{sections:e}=this.set;this.i<e.length?(this.len=e[this.i++],this.ins=e[this.i++]):(this.len=0,this.ins=-2),this.off=0}get done(){return-2==this.ins}get len2(){return this.ins<0?this.len:this.ins}get text(){let{inserted:e}=this.set,t=this.i-2>>1;return t>=e.length?Text.empty:e[t]}textBit(e){let{inserted:t}=this.set,n=this.i-2>>1;return n>=t.length&&!e?Text.empty:t[n].slice(this.off,null==e?void 0:this.off+e)}forward(e){e==this.len?this.next():(this.len-=e,this.off+=e)}forward2(e){-1==this.ins?this.forward(e):e==this.ins?this.next():(this.ins-=e,this.off+=e)}}class SelectionRange{constructor(e,t,n){this.from=e,this.to=t,this.flags=n}get anchor(){return 16&this.flags?this.to:this.from}get head(){return 16&this.flags?this.from:this.to}get empty(){return this.from==this.to}get assoc(){return 4&this.flags?-1:8&this.flags?1:0}get bidiLevel(){let e=3&this.flags;return 3==e?null:e}get goalColumn(){let e=this.flags>>5;return 33554431==e?void 0:e}map(e,t=-1){let n=e.mapPos(this.from,t),r=e.mapPos(this.to,t);return n==this.from&&r==this.to?this:new SelectionRange(n,r,this.flags)}extend(e,t=e){if(e<=this.anchor&&t>=this.anchor)return EditorSelection.range(e,t);let n=Math.abs(e-this.anchor)>Math.abs(t-this.anchor)?e:t;return EditorSelection.range(this.anchor,n)}eq(e){return this.anchor==e.anchor&&this.head==e.head}toJSON(){return{anchor:this.anchor,head:this.head}}static fromJSON(e){if(!e||"number"!=typeof e.anchor||"number"!=typeof e.head)throw new RangeError("Invalid JSON representation for SelectionRange");return EditorSelection.range(e.anchor,e.head)}}class EditorSelection{constructor(e,t=0){this.ranges=e,this.mainIndex=t}map(e,t=-1){return e.empty?this:EditorSelection.create(this.ranges.map(n=>n.map(e,t)),this.mainIndex)}eq(e){if(this.ranges.length!=e.ranges.length||this.mainIndex!=e.mainIndex)return!1;for(let t=0;t<this.ranges.length;t++)if(!this.ranges[t].eq(e.ranges[t]))return!1;return!0}get main(){return this.ranges[this.mainIndex]}asSingle(){return 1==this.ranges.length?this:new EditorSelection([this.main])}addRange(e,t=!0){return EditorSelection.create([e].concat(this.ranges),t?0:this.mainIndex+1)}replaceRange(e,t=this.mainIndex){let n=this.ranges.slice();return n[t]=e,EditorSelection.create(n,this.mainIndex)}toJSON(){return{ranges:this.ranges.map(e=>e.toJSON()),main:this.mainIndex}}static fromJSON(e){if(!e||!Array.isArray(e.ranges)||"number"!=typeof e.main||e.main>=e.ranges.length)throw new RangeError("Invalid JSON representation for EditorSelection");return new EditorSelection(e.ranges.map(e=>SelectionRange.fromJSON(e)),e.main)}static single(e,t=e){return new EditorSelection([EditorSelection.range(e,t)],0)}static create(e,t=0){if(0==e.length)throw new RangeError("A selection needs at least one range");for(let n=0,r=0;r<e.length;r++){let i=e[r];if(i.empty?i.from<=n:i.from<n)return normalized(e.slice(),t);n=i.to}return new EditorSelection(e,t)}static cursor(e,t=0,n,r){return new SelectionRange(e,e,(0==t?0:t<0?4:8)|(null==n?3:Math.min(2,n))|(null!=r?r:33554431)<<5)}static range(e,t,n){let r=(null!=n?n:33554431)<<5;return t<e?new SelectionRange(t,e,16|r):new SelectionRange(e,t,r)}}function normalized(e,t=0){let n=e[t];e.sort((e,t)=>e.from-t.from),t=e.indexOf(n);for(let n=1;n<e.length;n++){let r=e[n],i=e[n-1];if(r.empty?r.from<=i.to:r.from<i.to){let s=i.from,a=Math.max(r.to,i.to);n<=t&&t--,e.splice(--n,2,r.anchor>r.head?EditorSelection.range(a,s):EditorSelection.range(s,a))}}return new EditorSelection(e,t)}function checkSelection(e,t){for(let n of e.ranges)if(n.to>t)throw new RangeError("Selection points outside of document")}let nextID=0;class Facet{constructor(e,t,n,r,i){this.combine=e,this.compareInput=t,this.compare=n,this.isStatic=r,this.extensions=i,this.id=nextID++,this.default=e([])}static define(e={}){return new Facet(e.combine||(e=>e),e.compareInput||((e,t)=>e===t),e.compare||(e.combine?(e,t)=>e===t:sameArray),!!e.static,e.enables)}of(e){return new FacetProvider([],this,0,e)}compute(e,t){if(this.isStatic)throw new Error("Can't compute a static facet");return new FacetProvider(e,this,1,t)}computeN(e,t){if(this.isStatic)throw new Error("Can't compute a static facet");return new FacetProvider(e,this,2,t)}from(e,t){return t||(t=e=>e),this.compute([e],n=>t(n.field(e)))}}function sameArray(e,t){return e==t||e.length==t.length&&e.every((e,n)=>e===t[n])}class FacetProvider{constructor(e,t,n,r){this.dependencies=e,this.facet=t,this.type=n,this.value=r,this.id=nextID++}dynamicSlot(e){var t;let n=this.value,r=this.facet.compareInput,i=e[this.id]>>1,s=2==this.type,a=!1,o=!1,l=[];for(let n of this.dependencies)"doc"==n?a=!0:"selection"==n?o=!0:0==(1&(null!==(t=e[n.id])&&void 0!==t?t:1))&&l.push(e[n.id]);return(e,t)=>{let c=e.values[i];if(c===Uninitialized)return e.values[i]=n(e),1;if(t){if(a&&t.docChanged||o&&(t.docChanged||t.selection)||l.some(t=>(1&ensureAddr(e,t))>0)){let t=n(e);if(s?!compareArray(t,c,r):!r(t,c))return e.values[i]=t,1}}return 0}}}function compareArray(e,t,n){if(e.length!=t.length)return!1;for(let r=0;r<e.length;r++)if(!n(e[r],t[r]))return!1;return!0}function dynamicFacetSlot(e,t,n){let r=n.map(t=>e[t.id]),i=n.map(e=>e.type),s=r.filter(e=>!(1&e)),a=e[t.id]>>1;return(e,n)=>{let o=e.values[a],l=o===Uninitialized||!n;for(let t of s)1&ensureAddr(e,t)&&(l=!0);if(!l)return 0;let c=[];for(let t=0;t<r.length;t++){let n=getAddr(e,r[t]);if(2==i[t])for(let e of n)c.push(e);else c.push(n)}let h=t.combine(c);return o!==Uninitialized&&t.compare(h,o)?0:(e.values[a]=h,1)}}const initField=Facet.define({static:!0});class StateField{constructor(e,t,n,r,i){this.id=e,this.createF=t,this.updateF=n,this.compareF=r,this.spec=i,this.provides=void 0}static define(e){let t=new StateField(nextID++,e.create,e.update,e.compare||((e,t)=>e===t),e);return e.provide&&(t.provides=e.provide(t)),t}create(e){let t=e.facet(initField).find(e=>e.field==this);return((null==t?void 0:t.create)||this.createF)(e)}slot(e){let t=e[this.id]>>1;return(e,n)=>{let r=e.values[t];if(r===Uninitialized)return e.values[t]=this.create(e),1;if(n){let i=this.updateF(r,n);if(!this.compareF(r,i))return e.values[t]=i,1}return 0}}init(e){return[this,initField.of({field:this,create:e})]}get extension(){return this}}const Prec_={lowest:4,low:3,default:2,high:1,highest:0};function prec(e){return t=>new PrecExtension(t,e)}const Prec={lowest:prec(Prec_.lowest),low:prec(Prec_.low),default:prec(Prec_.default),high:prec(Prec_.high),highest:prec(Prec_.highest),fallback:prec(Prec_.lowest),extend:prec(Prec_.high),override:prec(Prec_.highest)};class PrecExtension{constructor(e,t){this.inner=e,this.prec=t}}class Compartment{of(e){return new CompartmentInstance(this,e)}reconfigure(e){return Compartment.reconfigure.of({compartment:this,extension:e})}get(e){return e.config.compartments.get(this)}}class CompartmentInstance{constructor(e,t){this.compartment=e,this.inner=t}}class Configuration{constructor(e,t,n,r,i){for(this.base=e,this.compartments=t,this.dynamicSlots=n,this.address=r,this.staticValues=i,this.statusTemplate=[];this.statusTemplate.length<n.length;)this.statusTemplate.push(0)}staticFacet(e){let t=this.address[e.id];return null==t?e.default:this.staticValues[t>>1]}static resolve(e,t,n){let r=[],i=Object.create(null),s=new Map;for(let n of flatten(e,t,s))n instanceof StateField?r.push(n):(i[n.facet.id]||(i[n.facet.id]=[])).push(n);let a=Object.create(null),o=[],l=[],c=[];for(let e of r)a[e.id]=l.length<<1,l.push(t=>e.slot(t)),c.push([]);for(let e in i){let t=i[e],r=t[0].facet;if(t.every(e=>0==e.type)){a[r.id]=o.length<<1|1;let e=r.combine(t.map(e=>e.value)),i=n?n.config.address[r.id]:null;if(null!=i){let t=getAddr(n,i);r.compare(e,t)&&(e=t)}o.push(e)}else{for(let e of t)0==e.type?(a[e.id]=o.length<<1|1,o.push(e.value)):(a[e.id]=l.length<<1,l.push(t=>e.dynamicSlot(t)),c.push(e.dependencies.filter(e=>"string"!=typeof e).map(e=>e.id)));a[r.id]=l.length<<1,l.push(e=>dynamicFacetSlot(e,r,t)),c.push(t.filter(e=>0!=e.type).map(e=>e.id))}}let h=l.map(e=>Uninitialized);if(n){let e=(t,r)=>{if(r>7)return!1;let i=a[t];if(!(1&i))return c[i>>1].every(t=>e(t,r+1));let s=n.config.address[t];return null!=s&&getAddr(n,s)==o[i>>1]};for(let t in a){let r=a[t],i=n.config.address[t];null!=i&&0==(1&r)&&e(+t,0)&&(h[r>>1]=getAddr(n,i))}}return{configuration:new Configuration(e,s,l.map(e=>e(a)),a,o),values:h}}}function flatten(e,t,n){let r=[[],[],[],[],[]],i=new Map;return function e(s,a){let o=i.get(s);if(null!=o){if(o>=a)return;let e=r[o].indexOf(s);e>-1&&r[o].splice(e,1),s instanceof CompartmentInstance&&n.delete(s.compartment)}if(i.set(s,a),Array.isArray(s))for(let t of s)e(t,a);else if(s instanceof CompartmentInstance){if(n.has(s.compartment))throw new RangeError("Duplicate use of compartment in extensions");let r=t.get(s.compartment)||s.inner;n.set(s.compartment,r),e(r,a)}else if(s instanceof PrecExtension)e(s.inner,s.prec);else if(s instanceof StateField)r[a].push(s),s.provides&&e(s.provides,a);else if(s instanceof FacetProvider)r[a].push(s),s.facet.extensions&&e(s.facet.extensions,a);else{let t=s.extension;if(!t)throw new Error(`Unrecognized extension value in extension set (${s}). This sometimes happens because multiple instances of @codemirror/state are loaded, breaking instanceof checks.`);e(t,a)}}(e,Prec_.default),r.reduce((e,t)=>e.concat(t))}const Uninitialized={};function ensureAddr(e,t){if(1&t)return 2;let n=t>>1,r=e.status[n];if(4==r)throw new Error("Cyclic dependency between fields and/or facets");if(2&r)return r;e.status[n]=4;let i=e.config.dynamicSlots[n](e,e.applying);return e.status[n]=2|i}function getAddr(e,t){return 1&t?e.config.staticValues[t>>1]:e.values[t>>1]}const languageData=Facet.define(),allowMultipleSelections=Facet.define({combine:e=>e.some(e=>e),static:!0}),lineSeparator=Facet.define({combine:e=>e.length?e[0]:void 0,static:!0}),changeFilter=Facet.define(),transactionFilter=Facet.define(),transactionExtender=Facet.define(),readOnly=Facet.define({combine:e=>!!e.length&&e[0]});class Annotation{constructor(e,t){this.type=e,this.value=t}static define(){return new AnnotationType}}class AnnotationType{of(e){return new Annotation(this,e)}}class StateEffectType{constructor(e){this.map=e}of(e){return new StateEffect(this,e)}}class StateEffect{constructor(e,t){this.type=e,this.value=t}map(e){let t=this.type.map(this.value,e);return void 0===t?void 0:t==this.value?this:new StateEffect(this.type,t)}is(e){return this.type==e}static define(e={}){return new StateEffectType(e.map||(e=>e))}static mapEffects(e,t){if(!e.length)return e;let n=[];for(let r of e){let e=r.map(t);e&&n.push(e)}return n}}StateEffect.reconfigure=StateEffect.define(),StateEffect.appendConfig=StateEffect.define();class Transaction{constructor(e,t,n,r,i,s){this.startState=e,this.changes=t,this.selection=n,this.effects=r,this.annotations=i,this.scrollIntoView=s,this._doc=null,this._state=null,n&&checkSelection(n,t.newLength),i.some(e=>e.type==Transaction.time)||(this.annotations=i.concat(Transaction.time.of(Date.now())))}get newDoc(){return this._doc||(this._doc=this.changes.apply(this.startState.doc))}get newSelection(){return this.selection||this.startState.selection.map(this.changes)}get state(){return this._state||this.startState.applyTransaction(this),this._state}annotation(e){for(let t of this.annotations)if(t.type==e)return t.value}get docChanged(){return!this.changes.empty}get reconfigured(){return this.startState.config!=this.state.config}isUserEvent(e){let t=this.annotation(Transaction.userEvent);return!(!t||!(t==e||t.length>e.length&&t.slice(0,e.length)==e&&"."==t[e.length]))}}function joinRanges(e,t){let n=[];for(let r=0,i=0;;){let s,a;if(r<e.length&&(i==t.length||t[i]>=e[r]))s=e[r++],a=e[r++];else{if(!(i<t.length))return n;s=t[i++],a=t[i++]}!n.length||n[n.length-1]<s?n.push(s,a):n[n.length-1]<a&&(n[n.length-1]=a)}}function mergeTransaction(e,t,n){var r;let i,s,a;return n?(i=t.changes,s=ChangeSet.empty(t.changes.length),a=e.changes.compose(t.changes)):(i=t.changes.map(e.changes),s=e.changes.mapDesc(t.changes,!0),a=e.changes.compose(i)),{changes:a,selection:t.selection?t.selection.map(s):null===(r=e.selection)||void 0===r?void 0:r.map(i),effects:StateEffect.mapEffects(e.effects,i).concat(StateEffect.mapEffects(t.effects,s)),annotations:e.annotations.length?e.annotations.concat(t.annotations):t.annotations,scrollIntoView:e.scrollIntoView||t.scrollIntoView}}function resolveTransactionInner(e,t,n){let r=t.selection,i=asArray(t.annotations);return t.userEvent&&(i=i.concat(Transaction.userEvent.of(t.userEvent))),{changes:t.changes instanceof ChangeSet?t.changes:ChangeSet.of(t.changes||[],n,e.facet(lineSeparator)),selection:r&&(r instanceof EditorSelection?r:EditorSelection.single(r.anchor,r.head)),effects:asArray(t.effects),annotations:i,scrollIntoView:!!t.scrollIntoView}}function resolveTransaction(e,t,n){let r=resolveTransactionInner(e,t.length?t[0]:{},e.doc.length);t.length&&!1===t[0].filter&&(n=!1);for(let i=1;i<t.length;i++){!1===t[i].filter&&(n=!1);let s=!!t[i].sequential;r=mergeTransaction(r,resolveTransactionInner(e,t[i],s?r.changes.newLength:e.doc.length),s)}let i=new Transaction(e,r.changes,r.selection,r.effects,r.annotations,r.scrollIntoView);return extendTransaction(n?filterTransaction(i):i)}function filterTransaction(e){let t=e.startState,n=!0;for(let r of t.facet(changeFilter)){let t=r(e);if(!1===t){n=!1;break}Array.isArray(t)&&(n=!0===n?t:joinRanges(n,t))}if(!0!==n){let r,i;if(!1===n)i=e.changes.invertedDesc,r=ChangeSet.empty(t.doc.length);else{let t=e.changes.filter(n);r=t.changes,i=t.filtered.invertedDesc}e=new Transaction(t,r,e.selection&&e.selection.map(i),StateEffect.mapEffects(e.effects,i),e.annotations,e.scrollIntoView)}let r=t.facet(transactionFilter);for(let n=r.length-1;n>=0;n--){let i=r[n](e);e=i instanceof Transaction?i:Array.isArray(i)&&1==i.length&&i[0]instanceof Transaction?i[0]:resolveTransaction(t,asArray(i),!1)}return e}function extendTransaction(e){let t=e.startState,n=t.facet(transactionExtender),r=e;for(let i=n.length-1;i>=0;i--){let s=n[i](e);s&&Object.keys(s).length&&(r=mergeTransaction(e,resolveTransactionInner(t,s,e.changes.newLength),!0))}return r==e?e:new Transaction(t,e.changes,e.selection,r.effects,r.annotations,r.scrollIntoView)}Transaction.time=Annotation.define(),Transaction.userEvent=Annotation.define(),Transaction.addToHistory=Annotation.define(),Transaction.remote=Annotation.define();const none=[];function asArray(e){return null==e?none:Array.isArray(e)?e:[e]}var CharCategory=function(e){return e[e.Word=0]="Word",e[e.Space=1]="Space",e[e.Other=2]="Other",e}(CharCategory||(CharCategory={}));const nonASCIISingleCaseWordChar=/[\u00df\u0587\u0590-\u05f4\u0600-\u06ff\u3040-\u309f\u30a0-\u30ff\u3400-\u4db5\u4e00-\u9fcc\uac00-\ud7af]/;let wordChar;try{wordChar=new RegExp("[\\p{Alphabetic}\\p{Number}_]","u")}catch(e){}function hasWordChar(e){if(wordChar)return wordChar.test(e);for(let t=0;t<e.length;t++){let n=e[t];if(/\w/.test(n)||n>""&&(n.toUpperCase()!=n.toLowerCase()||nonASCIISingleCaseWordChar.test(n)))return!0}return!1}function makeCategorizer(e){return t=>{if(!/\S/.test(t))return CharCategory.Space;if(hasWordChar(t))return CharCategory.Word;for(let n=0;n<e.length;n++)if(t.indexOf(e[n])>-1)return CharCategory.Word;return CharCategory.Other}}class EditorState{constructor(e,t,n,r,i=null){this.config=e,this.doc=t,this.selection=n,this.values=r,this.applying=null,this.status=e.statusTemplate.slice(),this.applying=i,i&&(i._state=this);for(let e=0;e<this.config.dynamicSlots.length;e++)ensureAddr(this,e<<1);this.applying=null}field(e,t=!0){let n=this.config.address[e.id];if(null!=n)return ensureAddr(this,n),getAddr(this,n);if(t)throw new RangeError("Field is not present in this state")}update(...e){return resolveTransaction(this,e,!0)}applyTransaction(e){let t,n=this.config,{base:r,compartments:i}=n;for(let t of e.effects)t.is(Compartment.reconfigure)?(n&&(i=new Map,n.compartments.forEach((e,t)=>i.set(t,e)),n=null),i.set(t.value.compartment,t.value.extension)):t.is(StateEffect.reconfigure)?(n=null,r=t.value):t.is(StateEffect.appendConfig)&&(n=null,r=asArray(r).concat(t.value));if(n)t=e.startState.values.slice();else{let e=Configuration.resolve(r,i,this);n=e.configuration,t=new EditorState(n,this.doc,this.selection,e.values,null).values}new EditorState(n,e.newDoc,e.newSelection,t,e)}replaceSelection(e){return"string"==typeof e&&(e=this.toText(e)),this.changeByRange(t=>({changes:{from:t.from,to:t.to,insert:e},range:EditorSelection.cursor(t.from+e.length)}))}changeByRange(e){let t=this.selection,n=e(t.ranges[0]),r=this.changes(n.changes),i=[n.range],s=asArray(n.effects);for(let n=1;n<t.ranges.length;n++){let a=e(t.ranges[n]),o=this.changes(a.changes),l=o.map(r);for(let e=0;e<n;e++)i[e]=i[e].map(l);let c=r.mapDesc(o,!0);i.push(a.range.map(c)),r=r.compose(l),s=StateEffect.mapEffects(s,l).concat(StateEffect.mapEffects(asArray(a.effects),c))}return{changes:r,selection:EditorSelection.create(i,t.mainIndex),effects:s}}changes(e=[]){return e instanceof ChangeSet?e:ChangeSet.of(e,this.doc.length,this.facet(EditorState.lineSeparator))}toText(e){return Text.of(e.split(this.facet(EditorState.lineSeparator)||DefaultSplit))}sliceDoc(e=0,t=this.doc.length){return this.doc.sliceString(e,t,this.lineBreak)}facet(e){let t=this.config.address[e.id];return null==t?e.default:(ensureAddr(this,t),getAddr(this,t))}toJSON(e){let t={doc:this.sliceDoc(),selection:this.selection.toJSON()};if(e)for(let n in e){let r=e[n];r instanceof StateField&&(t[n]=r.spec.toJSON(this.field(e[n]),this))}return t}static fromJSON(e,t={},n){if(!e||"string"!=typeof e.doc)throw new RangeError("Invalid JSON representation for EditorState");let r=[];if(n)for(let t in n){let i=n[t],s=e[t];r.push(i.init(e=>i.spec.fromJSON(s,e)))}return EditorState.create({doc:e.doc,selection:EditorSelection.fromJSON(e.selection),extensions:t.extensions?r.concat([t.extensions]):r})}static create(e={}){let{configuration:t,values:n}=Configuration.resolve(e.extensions||[],new Map),r=e.doc instanceof Text?e.doc:Text.of((e.doc||"").split(t.staticFacet(EditorState.lineSeparator)||DefaultSplit)),i=e.selection?e.selection instanceof EditorSelection?e.selection:EditorSelection.single(e.selection.anchor,e.selection.head):EditorSelection.single(0);return checkSelection(i,r.length),t.staticFacet(allowMultipleSelections)||(i=i.asSingle()),new EditorState(t,r,i,n)}get tabSize(){return this.facet(EditorState.tabSize)}get lineBreak(){return this.facet(EditorState.lineSeparator)||"\n"}get readOnly(){return this.facet(readOnly)}phrase(e){for(let t of this.facet(EditorState.phrases))if(Object.prototype.hasOwnProperty.call(t,e))return t[e];return e}languageDataAt(e,t,n=-1){let r=[];for(let i of this.facet(languageData))for(let s of i(this,t,n))Object.prototype.hasOwnProperty.call(s,e)&&r.push(s[e]);return r}charCategorizer(e){return makeCategorizer(this.languageDataAt("wordChars",e).join(""))}wordAt(e){let{text:t,from:n,length:r}=this.doc.lineAt(e),i=this.charCategorizer(e),s=e-n,a=e-n;for(;s>0;){let e=findClusterBreak(t,s,!1);if(i(t.slice(e,s))!=CharCategory.Word)break;s=e}for(;a<r;){let e=findClusterBreak(t,a);if(i(t.slice(a,e))!=CharCategory.Word)break;a=e}return s==a?null:EditorSelection.range(s+n,a+n)}}function combineConfig(e,t,n={}){let r={};for(let t of e)for(let e of Object.keys(t)){let i=t[e],s=r[e];if(void 0===s)r[e]=i;else if(s===i||void 0===i);else{if(!Object.hasOwnProperty.call(n,e))throw new Error("Config merge conflict for field "+e);r[e]=n[e](s,i)}}for(let e in t)void 0===r[e]&&(r[e]=t[e]);return r}EditorState.allowMultipleSelections=allowMultipleSelections,EditorState.tabSize=Facet.define({combine:e=>e.length?e[0]:4}),EditorState.lineSeparator=lineSeparator,EditorState.readOnly=readOnly,EditorState.phrases=Facet.define(),EditorState.languageData=languageData,EditorState.changeFilter=changeFilter,EditorState.transactionFilter=transactionFilter,EditorState.transactionExtender=transactionExtender,Compartment.reconfigure=StateEffect.define();export{Annotation,AnnotationType,ChangeDesc,ChangeSet,CharCategory,Compartment,EditorSelection,EditorState,Facet,MapMode,Prec,SelectionRange,StateEffect,StateEffectType,StateField,Transaction,combineConfig};