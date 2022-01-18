import{EditorView,Decoration,ViewPlugin,runScopeHandlers}from"@codemirror/view";import{StateEffect,StateField,EditorSelection,Facet,combineConfig,CharCategory,Prec}from"@codemirror/state";import{showPanel,getPanel}from"@codemirror/panel";import{RangeSetBuilder}from"@codemirror/rangeset";import elt from"crelt";import{codePointAt,fromCodePoint,codePointSize}from"@codemirror/text";const basicNormalize="function"==typeof String.prototype.normalize?e=>e.normalize("NFKD"):e=>e;class SearchCursor{constructor(e,t,r=0,i=e.length,a){this.value={from:0,to:0},this.done=!1,this.matches=[],this.buffer="",this.bufferPos=0,this.iter=e.iterRange(r,i),this.bufferStart=r,this.normalize=a?e=>a(basicNormalize(e)):basicNormalize,this.query=this.normalize(t)}peek(){if(this.bufferPos==this.buffer.length){if(this.bufferStart+=this.buffer.length,this.iter.next(),this.iter.done)return-1;this.bufferPos=0,this.buffer=this.iter.value}return codePointAt(this.buffer,this.bufferPos)}next(){for(;this.matches.length;)this.matches.pop();return this.nextOverlapping()}nextOverlapping(){for(;;){let e=this.peek();if(e<0)return this.done=!0,this;let t=fromCodePoint(e),r=this.bufferStart+this.bufferPos;this.bufferPos+=codePointSize(e);let i=this.normalize(t);for(let e=0,a=r;;e++){let n=i.charCodeAt(e),s=this.match(n,a);if(s)return this.value=s,this;if(e==i.length-1)break;a==r&&e<t.length&&t.charCodeAt(e)==n&&a++}}}match(e,t){let r=null;for(let i=0;i<this.matches.length;i+=2){let a=this.matches[i],n=!1;this.query.charCodeAt(a)==e&&(a==this.query.length-1?r={from:this.matches[i+1],to:t+1}:(this.matches[i]++,n=!0)),n||(this.matches.splice(i,2),i-=2)}return this.query.charCodeAt(0)==e&&(1==this.query.length?r={from:t,to:t+1}:this.matches.push(1,t)),r}}"undefined"!=typeof Symbol&&(SearchCursor.prototype[Symbol.iterator]=function(){return this});const empty={from:-1,to:-1,match:/.*/.exec("")},baseFlags="gm"+(null==/x/.unicode?"":"u");class RegExpCursor{constructor(e,t,r,i=0,a=e.length){if(this.to=a,this.curLine="",this.done=!1,this.value=empty,/\\[sWDnr]|\n|\r|\[\^/.test(t))return new MultilineRegExpCursor(e,t,r,i,a);this.re=new RegExp(t,baseFlags+((null==r?void 0:r.ignoreCase)?"i":"")),this.iter=e.iter();let n=e.lineAt(i);this.curLineStart=n.from,this.matchPos=i,this.getLine(this.curLineStart)}getLine(e){this.iter.next(e),this.iter.lineBreak?this.curLine="":(this.curLine=this.iter.value,this.curLineStart+this.curLine.length>this.to&&(this.curLine=this.curLine.slice(0,this.to-this.curLineStart)),this.iter.next())}nextLine(){this.curLineStart=this.curLineStart+this.curLine.length+1,this.curLineStart>this.to?this.curLine="":this.getLine(0)}next(){for(let e=this.matchPos-this.curLineStart;;){this.re.lastIndex=e;let t=this.matchPos<=this.to&&this.re.exec(this.curLine);if(t){let r=this.curLineStart+t.index,i=r+t[0].length;if(this.matchPos=i+(r==i?1:0),r==this.curLine.length&&this.nextLine(),r<i||r>this.value.to)return this.value={from:r,to:i,match:t},this;e=this.matchPos-this.curLineStart}else{if(!(this.curLineStart+this.curLine.length<this.to))return this.done=!0,this;this.nextLine(),e=0}}}}const flattened=new WeakMap;class FlattenedDoc{constructor(e,t){this.from=e,this.text=t}get to(){return this.from+this.text.length}static get(e,t,r){let i=flattened.get(e);if(!i||i.from>=r||i.to<=t){let i=new FlattenedDoc(t,e.sliceString(t,r));return flattened.set(e,i),i}if(i.from==t&&i.to==r)return i;let{text:a,from:n}=i;return n>t&&(a=e.sliceString(t,n)+a,n=t),i.to<r&&(a+=e.sliceString(i.to,r)),flattened.set(e,new FlattenedDoc(n,a)),new FlattenedDoc(t,a.slice(t-n,r-n))}}class MultilineRegExpCursor{constructor(e,t,r,i,a){this.text=e,this.to=a,this.done=!1,this.value=empty,this.matchPos=i,this.re=new RegExp(t,baseFlags+((null==r?void 0:r.ignoreCase)?"i":"")),this.flat=FlattenedDoc.get(e,i,this.chunkEnd(i+5e3))}chunkEnd(e){return e>=this.to?this.to:this.text.lineAt(e).to}next(){for(;;){let e=this.re.lastIndex=this.matchPos-this.flat.from,t=this.re.exec(this.flat.text);if(t&&!t[0]&&t.index==e&&(this.re.lastIndex=e+1,t=this.re.exec(this.flat.text)),t&&this.flat.to<this.to&&t.index+t[0].length>this.flat.text.length-10&&(t=null),t){let e=this.flat.from+t.index,r=e+t[0].length;return this.value={from:e,to:r,match:t},this.matchPos=r+(e==r?1:0),this}if(this.flat.to==this.to)return this.done=!0,this;this.flat=FlattenedDoc.get(this.text,this.flat.from,this.chunkEnd(this.flat.from+2*this.flat.text.length))}}}function validRegExp(e){try{return new RegExp(e,baseFlags),!0}catch(e){return!1}}function createLineDialog(e){let t=elt("input",{class:"cm-textfield",name:"line"});function r(){let r=/^([+-])?(\d+)?(:\d+)?(%)?$/.exec(t.value);if(!r)return;let{state:i}=e,a=i.doc.lineAt(i.selection.main.head),[,n,s,o,c]=r,l=o?+o.slice(1):0,h=s?+s:a.number;if(s&&c){let e=h/100;n&&(e=e*("-"==n?-1:1)+a.number/i.doc.lines),h=Math.round(i.doc.lines*e)}else s&&n&&(h=h*("-"==n?-1:1)+a.number);let u=i.doc.line(Math.max(1,Math.min(i.doc.lines,h)));e.dispatch({effects:dialogEffect.of(!1),selection:EditorSelection.cursor(u.from+Math.max(0,Math.min(l,u.length))),scrollIntoView:!0}),e.focus()}return{dom:elt("form",{class:"cm-gotoLine",onkeydown:t=>{27==t.keyCode?(t.preventDefault(),e.dispatch({effects:dialogEffect.of(!1)}),e.focus()):13==t.keyCode&&(t.preventDefault(),r())},onsubmit:e=>{e.preventDefault(),r()}},elt("label",e.state.phrase("Go to line"),": ",t)," ",elt("button",{class:"cm-button",type:"submit"},e.state.phrase("go"))),pos:-10}}"undefined"!=typeof Symbol&&(RegExpCursor.prototype[Symbol.iterator]=MultilineRegExpCursor.prototype[Symbol.iterator]=function(){return this});const dialogEffect=StateEffect.define(),dialogField=StateField.define({create:()=>!0,update(e,t){for(let r of t.effects)r.is(dialogEffect)&&(e=r.value);return e},provide:e=>showPanel.from(e,e=>e?createLineDialog:null)}),gotoLine=e=>{let t=getPanel(e,createLineDialog);if(!t){let r=[dialogEffect.of(!0)];null==e.state.field(dialogField,!1)&&r.push(StateEffect.appendConfig.of([dialogField,baseTheme$1])),e.dispatch({effects:r}),t=getPanel(e,createLineDialog)}return t&&t.dom.querySelector("input").focus(),!0},baseTheme$1=EditorView.baseTheme({".cm-panel.cm-gotoLine":{padding:"2px 6px 4px","& label":{fontSize:"80%"}}}),defaultHighlightOptions={highlightWordAroundCursor:!1,minSelectionLength:1,maxMatches:100},highlightConfig=Facet.define({combine:e=>combineConfig(e,defaultHighlightOptions,{highlightWordAroundCursor:(e,t)=>e||t,minSelectionLength:Math.min,maxMatches:Math.min})});function highlightSelectionMatches(e){let t=[defaultTheme,matchHighlighter];return e&&t.push(highlightConfig.of(e)),t}const matchDeco=Decoration.mark({class:"cm-selectionMatch"}),mainMatchDeco=Decoration.mark({class:"cm-selectionMatch cm-selectionMatch-main"}),matchHighlighter=ViewPlugin.fromClass(class{constructor(e){this.decorations=this.getDeco(e)}update(e){(e.selectionSet||e.docChanged||e.viewportChanged)&&(this.decorations=this.getDeco(e.view))}getDeco(e){let t=e.state.facet(highlightConfig),{state:r}=e,i=r.selection;if(i.ranges.length>1)return Decoration.none;let a,n=i.main,s=null;if(n.empty){if(!t.highlightWordAroundCursor)return Decoration.none;let e=r.wordAt(n.head);if(!e)return Decoration.none;s=r.charCategorizer(n.head),a=r.sliceDoc(e.from,e.to)}else{let e=n.to-n.from;if(e<t.minSelectionLength||e>200)return Decoration.none;if(a=r.sliceDoc(n.from,n.to).trim(),!a)return Decoration.none}let o=[];for(let i of e.visibleRanges){let e=new SearchCursor(r.doc,a,i.from,i.to);for(;!e.next().done;){let{from:i,to:a}=e.value;if((!s||(0==i||s(r.sliceDoc(i-1,i))!=CharCategory.Word)&&(a==r.doc.length||s(r.sliceDoc(a,a+1))!=CharCategory.Word))&&(s&&i<=n.from&&a>=n.to?o.push(mainMatchDeco.range(i,a)):(i>=n.to||a<=n.from)&&o.push(matchDeco.range(i,a)),o.length>t.maxMatches))return Decoration.none}}return Decoration.set(o)}},{decorations:e=>e.decorations}),defaultTheme=EditorView.baseTheme({".cm-selectionMatch":{backgroundColor:"#99ff7780"},".cm-searchMatch .cm-selectionMatch":{backgroundColor:"transparent"}}),selectWord=({state:e,dispatch:t})=>{let{selection:r}=e,i=EditorSelection.create(r.ranges.map(t=>e.wordAt(t.head)||EditorSelection.cursor(t.head)),r.mainIndex);return!i.eq(r)&&(t(e.update({selection:i})),!0)};function findNextOccurrence(e,t){let{main:r,ranges:i}=e.selection,a=e.wordAt(r.head),n=a&&a.from==r.from&&a.to==r.to;for(let r=!1,a=new SearchCursor(e.doc,t,i[i.length-1].to);;){if(a.next(),!a.done){if(r&&i.some(e=>e.from==a.value.from))continue;if(n){let t=e.wordAt(a.value.from);if(!t||t.from!=a.value.from||t.to!=a.value.to)continue}return a.value}if(r)return null;a=new SearchCursor(e.doc,t,0,Math.max(0,i[i.length-1].from-1)),r=!0}}const selectNextOccurrence=({state:e,dispatch:t})=>{let{ranges:r}=e.selection;if(r.some(e=>e.from===e.to))return selectWord({state:e,dispatch:t});let i=e.sliceDoc(r[0].from,r[0].to);if(e.selection.ranges.some(t=>e.sliceDoc(t.from,t.to)!=i))return!1;let a=findNextOccurrence(e,i);return!!a&&(t(e.update({selection:e.selection.addRange(EditorSelection.range(a.from,a.to),!1),scrollIntoView:!0})),!0)},searchConfigFacet=Facet.define({combine(e){var t;return{top:e.reduce((e,t)=>null!=e?e:t.top,void 0)||!1,caseSensitive:e.reduce((e,t)=>null!=e?e:t.caseSensitive||t.matchCase,void 0)||!1,createPanel:(null===(t=e.find(e=>e.createPanel))||void 0===t?void 0:t.createPanel)||(e=>new SearchPanel(e))}}});function searchConfig(e){return searchConfigFacet.of(e)}class SearchQuery{constructor(e){this.search=e.search,this.caseSensitive=!!e.caseSensitive,this.regexp=!!e.regexp,this.replace=e.replace||"",this.valid=!!this.search&&(!this.regexp||validRegExp(this.search))}eq(e){return this.search==e.search&&this.replace==e.replace&&this.caseSensitive==e.caseSensitive&&this.regexp==e.regexp}create(){return this.regexp?new RegExpQuery(this):new StringQuery(this)}}class QueryType{constructor(e){this.spec=e}}class StringQuery extends QueryType{constructor(e){super(e),this.unquoted=e.search.replace(/\\([nrt\\])/g,(e,t)=>"n"==t?"\n":"r"==t?"\r":"t"==t?"\t":"\\")}cursor(e,t=0,r=e.length){return new SearchCursor(e,this.unquoted,t,r,this.spec.caseSensitive?void 0:e=>e.toLowerCase())}nextMatch(e,t,r){let i=this.cursor(e,r).nextOverlapping();return i.done&&(i=this.cursor(e,0,t).nextOverlapping()),i.done?null:i.value}prevMatchInRange(e,t,r){for(let i=r;;){let r=Math.max(t,i-1e4-this.unquoted.length),a=this.cursor(e,r,i),n=null;for(;!a.nextOverlapping().done;)n=a.value;if(n)return n;if(r==t)return null;i-=1e4}}prevMatch(e,t,r){return this.prevMatchInRange(e,0,t)||this.prevMatchInRange(e,r,e.length)}getReplacement(e){return this.spec.replace}matchAll(e,t){let r=this.cursor(e),i=[];for(;!r.next().done;){if(i.length>=t)return null;i.push(r.value)}return i}highlight(e,t,r,i){let a=this.cursor(e,Math.max(0,t-this.unquoted.length),Math.min(r+this.unquoted.length,e.length));for(;!a.next().done;)i(a.value.from,a.value.to)}}class RegExpQuery extends QueryType{cursor(e,t=0,r=e.length){return new RegExpCursor(e,this.spec.search,this.spec.caseSensitive?void 0:{ignoreCase:!0},t,r)}nextMatch(e,t,r){let i=this.cursor(e,r).next();return i.done&&(i=this.cursor(e,0,t).next()),i.done?null:i.value}prevMatchInRange(e,t,r){for(let i=1;;i++){let a=Math.max(t,r-1e4*i),n=this.cursor(e,a,r),s=null;for(;!n.next().done;)s=n.value;if(s&&(a==t||s.from>a+10))return s;if(a==t)return null}}prevMatch(e,t,r){return this.prevMatchInRange(e,0,t)||this.prevMatchInRange(e,r,e.length)}getReplacement(e){return this.spec.replace.replace(/\$([$&\d+])/g,(t,r)=>"$"==r?"$":"&"==r?e.match[0]:"0"!=r&&+r<e.match.length?e.match[r]:t)}matchAll(e,t){let r=this.cursor(e),i=[];for(;!r.next().done;){if(i.length>=t)return null;i.push(r.value)}return i}highlight(e,t,r,i){let a=this.cursor(e,Math.max(0,t-250),Math.min(r+250,e.length));for(;!a.next().done;)i(a.value.from,a.value.to)}}const setSearchQuery=StateEffect.define(),togglePanel=StateEffect.define(),searchState=StateField.define({create:e=>new SearchState(defaultQuery(e).create(),createSearchPanel),update(e,t){for(let r of t.effects)r.is(setSearchQuery)?e=new SearchState(r.value.create(),e.panel):r.is(togglePanel)&&(e=new SearchState(e.query,r.value?createSearchPanel:null));return e},provide:e=>showPanel.from(e,e=>e.panel)});function getSearchQuery(e){let t=e.field(searchState,!1);return t?t.query.spec:defaultQuery(e)}class SearchState{constructor(e,t){this.query=e,this.panel=t}}const matchMark=Decoration.mark({class:"cm-searchMatch"}),selectedMatchMark=Decoration.mark({class:"cm-searchMatch cm-searchMatch-selected"}),searchHighlighter=ViewPlugin.fromClass(class{constructor(e){this.view=e,this.decorations=this.highlight(e.state.field(searchState))}update(e){let t=e.state.field(searchState);(t!=e.startState.field(searchState)||e.docChanged||e.selectionSet)&&(this.decorations=this.highlight(t))}highlight({query:e,panel:t}){if(!t||!e.spec.valid)return Decoration.none;let{view:r}=this,i=new RangeSetBuilder;for(let t=0,a=r.visibleRanges,n=a.length;t<n;t++){let{from:s,to:o}=a[t];for(;t<n-1&&o>a[t+1].from-500;)o=a[++t].to;e.highlight(r.state.doc,s,o,(e,t)=>{let a=r.state.selection.ranges.some(r=>r.from==e&&r.to==t);i.add(e,t,a?selectedMatchMark:matchMark)})}return i.finish()}},{decorations:e=>e.decorations});function searchCommand(e){return t=>{let r=t.state.field(searchState,!1);return r&&r.query.spec.valid?e(t,r):openSearchPanel(t)}}const findNext=searchCommand((e,{query:t})=>{let{from:r,to:i}=e.state.selection.main,a=t.nextMatch(e.state.doc,r,i);return!(!a||a.from==r&&a.to==i)&&(e.dispatch({selection:{anchor:a.from,head:a.to},scrollIntoView:!0,effects:announceMatch(e,a),userEvent:"select.search"}),!0)}),findPrevious=searchCommand((e,{query:t})=>{let{state:r}=e,{from:i,to:a}=r.selection.main,n=t.prevMatch(r.doc,i,a);return!!n&&(e.dispatch({selection:{anchor:n.from,head:n.to},scrollIntoView:!0,effects:announceMatch(e,n),userEvent:"select.search"}),!0)}),selectMatches=searchCommand((e,{query:t})=>{let r=t.matchAll(e.state.doc,1e3);return!(!r||!r.length)&&(e.dispatch({selection:EditorSelection.create(r.map(e=>EditorSelection.range(e.from,e.to))),userEvent:"select.search.matches"}),!0)}),selectSelectionMatches=({state:e,dispatch:t})=>{let r=e.selection;if(r.ranges.length>1||r.main.empty)return!1;let{from:i,to:a}=r.main,n=[],s=0;for(let t=new SearchCursor(e.doc,e.sliceDoc(i,a));!t.next().done;){if(n.length>1e3)return!1;t.value.from==i&&(s=n.length),n.push(EditorSelection.range(t.value.from,t.value.to))}return t(e.update({selection:EditorSelection.create(n,s),userEvent:"select.search.matches"})),!0},replaceNext=searchCommand((e,{query:t})=>{let{state:r}=e,{from:i,to:a}=r.selection.main;if(r.readOnly)return!1;let n=t.nextMatch(r.doc,i,i);if(!n)return!1;let s,o,c=[];if(n.from==i&&n.to==a&&(o=r.toText(t.getReplacement(n)),c.push({from:n.from,to:n.to,insert:o}),n=t.nextMatch(r.doc,n.from,n.to)),n){let e=0==c.length||c[0].from>=n.to?0:n.to-n.from-o.length;s={anchor:n.from-e,head:n.to-e}}return e.dispatch({changes:c,selection:s,scrollIntoView:!!s,effects:n?announceMatch(e,n):void 0,userEvent:"input.replace"}),!0}),replaceAll=searchCommand((e,{query:t})=>{if(e.state.readOnly)return!1;let r=t.matchAll(e.state.doc,1e9).map(e=>{let{from:r,to:i}=e;return{from:r,to:i,insert:t.getReplacement(e)}});return!!r.length&&(e.dispatch({changes:r,userEvent:"input.replace.all"}),!0)});function createSearchPanel(e){return e.state.facet(searchConfigFacet).createPanel(e)}function defaultQuery(e,t){var r;let i=e.selection.main,a=i.empty||i.to>i.from+100?"":e.sliceDoc(i.from,i.to),n=null!==(r=null==t?void 0:t.caseSensitive)&&void 0!==r?r:e.facet(searchConfigFacet).caseSensitive;return t&&!a?t:new SearchQuery({search:a.replace(/\n/g,"\\n"),caseSensitive:n})}const openSearchPanel=e=>{let t=e.state.field(searchState,!1);if(t&&t.panel){let r=getPanel(e,createSearchPanel);if(!r)return!1;let i=r.dom.querySelector("[name=search]");if(i!=e.root.activeElement){let r=defaultQuery(e.state,t.query.spec);r.valid&&e.dispatch({effects:setSearchQuery.of(r)}),i.focus(),i.select()}}else e.dispatch({effects:[togglePanel.of(!0),t?setSearchQuery.of(defaultQuery(e.state,t.query.spec)):StateEffect.appendConfig.of(searchExtensions)]});return!0},closeSearchPanel=e=>{let t=e.state.field(searchState,!1);if(!t||!t.panel)return!1;let r=getPanel(e,createSearchPanel);return r&&r.dom.contains(e.root.activeElement)&&e.focus(),e.dispatch({effects:togglePanel.of(!1)}),!0},searchKeymap=[{key:"Mod-f",run:openSearchPanel,scope:"editor search-panel"},{key:"F3",run:findNext,shift:findPrevious,scope:"editor search-panel",preventDefault:!0},{key:"Mod-g",run:findNext,shift:findPrevious,scope:"editor search-panel",preventDefault:!0},{key:"Escape",run:closeSearchPanel,scope:"editor search-panel"},{key:"Mod-Shift-l",run:selectSelectionMatches},{key:"Alt-g",run:gotoLine},{key:"Mod-d",run:selectNextOccurrence,preventDefault:!0}];class SearchPanel{constructor(e){this.view=e;let t=this.query=e.state.field(searchState).query.spec;function r(e,t,r){return elt("button",{class:"cm-button",name:e,onclick:t,type:"button"},r)}this.commit=this.commit.bind(this),this.searchField=elt("input",{value:t.search,placeholder:phrase(e,"Find"),"aria-label":phrase(e,"Find"),class:"cm-textfield",name:"search",onchange:this.commit,onkeyup:this.commit}),this.replaceField=elt("input",{value:t.replace,placeholder:phrase(e,"Replace"),"aria-label":phrase(e,"Replace"),class:"cm-textfield",name:"replace",onchange:this.commit,onkeyup:this.commit}),this.caseField=elt("input",{type:"checkbox",name:"case",checked:t.caseSensitive,onchange:this.commit}),this.reField=elt("input",{type:"checkbox",name:"re",checked:t.regexp,onchange:this.commit}),this.dom=elt("div",{onkeydown:e=>this.keydown(e),class:"cm-search"},[this.searchField,r("next",()=>findNext(e),[phrase(e,"next")]),r("prev",()=>findPrevious(e),[phrase(e,"previous")]),r("select",()=>selectMatches(e),[phrase(e,"all")]),elt("label",null,[this.caseField,phrase(e,"match case")]),elt("label",null,[this.reField,phrase(e,"regexp")]),...e.state.readOnly?[]:[elt("br"),this.replaceField,r("replace",()=>replaceNext(e),[phrase(e,"replace")]),r("replaceAll",()=>replaceAll(e),[phrase(e,"replace all")]),elt("button",{name:"close",onclick:()=>closeSearchPanel(e),"aria-label":phrase(e,"close"),type:"button"},["×"])]])}commit(){let e=new SearchQuery({search:this.searchField.value,caseSensitive:this.caseField.checked,regexp:this.reField.checked,replace:this.replaceField.value});e.eq(this.query)||(this.query=e,this.view.dispatch({effects:setSearchQuery.of(e)}))}keydown(e){runScopeHandlers(this.view,e,"search-panel")?e.preventDefault():13==e.keyCode&&e.target==this.searchField?(e.preventDefault(),(e.shiftKey?findPrevious:findNext)(this.view)):13==e.keyCode&&e.target==this.replaceField&&(e.preventDefault(),replaceNext(this.view))}update(e){for(let t of e.transactions)for(let e of t.effects)e.is(setSearchQuery)&&!e.value.eq(this.query)&&this.setQuery(e.value)}setQuery(e){this.query=e,this.searchField.value=e.search,this.replaceField.value=e.replace,this.caseField.checked=e.caseSensitive,this.reField.checked=e.regexp}mount(){this.searchField.select()}get pos(){return 80}get top(){return this.view.state.facet(searchConfigFacet).top}}function phrase(e,t){return e.state.phrase(t)}const AnnounceMargin=30,Break=/[\s\.,:;?!]/;function announceMatch(e,{from:t,to:r}){let i=e.state.doc.lineAt(t).from,a=e.state.doc.lineAt(r).to,n=Math.max(i,t-30),s=Math.min(a,r+30),o=e.state.sliceDoc(n,s);if(n!=i)for(let e=0;e<30;e++)if(!Break.test(o[e+1])&&Break.test(o[e])){o=o.slice(e);break}if(s!=a)for(let e=o.length-1;e>o.length-30;e--)if(!Break.test(o[e-1])&&Break.test(o[e])){o=o.slice(0,e);break}return EditorView.announce.of(`${e.state.phrase("current match")}. ${o} ${e.state.phrase("on line")} ${e.state.doc.lineAt(t).number}`)}const baseTheme=EditorView.baseTheme({".cm-panel.cm-search":{padding:"2px 6px 4px",position:"relative","& [name=close]":{position:"absolute",top:"0",right:"4px",backgroundColor:"inherit",border:"none",font:"inherit",padding:0,margin:0},"& input, & button, & label":{margin:".2em .6em .2em 0"},"& input[type=checkbox]":{marginRight:".2em"},"& label":{fontSize:"80%",whiteSpace:"pre"}},"&light .cm-searchMatch":{backgroundColor:"#ffff0054"},"&dark .cm-searchMatch":{backgroundColor:"#00ffff8a"},"&light .cm-searchMatch-selected":{backgroundColor:"#ff6a0054"},"&dark .cm-searchMatch-selected":{backgroundColor:"#ff00ff8a"}}),searchExtensions=[searchState,Prec.lowest(searchHighlighter),baseTheme];export{RegExpCursor,SearchCursor,SearchQuery,closeSearchPanel,findNext,findPrevious,getSearchQuery,gotoLine,highlightSelectionMatches,openSearchPanel,replaceAll,replaceNext,searchConfig,searchKeymap,selectMatches,selectNextOccurrence,selectSelectionMatches,setSearchQuery};