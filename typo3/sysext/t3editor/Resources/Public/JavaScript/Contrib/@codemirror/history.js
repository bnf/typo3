import{Annotation,Facet,combineConfig,StateField,EditorSelection,Transaction,ChangeSet,ChangeDesc,StateEffect}from"@codemirror/state";import{EditorView}from"@codemirror/view";const fromHistory=Annotation.define(),isolateHistory=Annotation.define(),invertedEffects=Facet.define(),historyConfig=Facet.define({combine:e=>combineConfig(e,{minDepth:100,newGroupDelay:500},{minDepth:Math.max,newGroupDelay:Math.min})});function changeEnd(e){let t=0;return e.iterChangedRanges((e,n)=>t=n),t}const historyField_=StateField.define({create:()=>HistoryState.empty,update(e,t){let n=t.state.facet(historyConfig),o=t.annotation(fromHistory);if(o){let i=t.docChanged?EditorSelection.single(changeEnd(t.changes)):void 0,s=HistEvent.fromTransaction(t,i),r=o.side,a=0==r?e.undone:e.done;return a=s?updateBranch(a,a.length,n.minDepth,s):addSelection(a,t.startState.selection),new HistoryState(0==r?o.rest:a,0==r?a:o.rest)}let i=t.annotation(isolateHistory);if("full"!=i&&"before"!=i||(e=e.isolate()),!1===t.annotation(Transaction.addToHistory))return t.changes.empty?e:e.addMapping(t.changes.desc);let s=HistEvent.fromTransaction(t),r=t.annotation(Transaction.time),a=t.annotation(Transaction.userEvent);return s?e=e.addChanges(s,r,a,n.newGroupDelay,n.minDepth):t.selection&&(e=e.addSelection(t.startState.selection,r,a,n.newGroupDelay)),"full"!=i&&"after"!=i||(e=e.isolate()),e},toJSON:e=>({done:e.done.map(e=>e.toJSON()),undone:e.undone.map(e=>e.toJSON())}),fromJSON:e=>new HistoryState(e.done.map(HistEvent.fromJSON),e.undone.map(HistEvent.fromJSON))});function history(e={}){return[historyField_,historyConfig.of(e),EditorView.domEventHandlers({beforeinput(e,t){let n="historyUndo"==e.inputType?undo:"historyRedo"==e.inputType?redo:null;return!!n&&(e.preventDefault(),n(t))}})]}const historyField=historyField_;function cmd(e,t){return function({state:n,dispatch:o}){if(!t&&n.readOnly)return!1;let i=n.field(historyField_,!1);if(!i)return!1;let s=i.pop(e,n,t);return!!s&&(o(s),!0)}}const undo=cmd(0,!1),redo=cmd(1,!1),undoSelection=cmd(0,!0),redoSelection=cmd(1,!0);function depth(e){return function(t){let n=t.field(historyField_,!1);if(!n)return 0;let o=0==e?n.done:n.undone;return o.length-(o.length&&!o[0].changes?1:0)}}const undoDepth=depth(0),redoDepth=depth(1);class HistEvent{constructor(e,t,n,o,i){this.changes=e,this.effects=t,this.mapped=n,this.startSelection=o,this.selectionsAfter=i}setSelAfter(e){return new HistEvent(this.changes,this.effects,this.mapped,this.startSelection,e)}toJSON(){var e,t,n;return{changes:null===(e=this.changes)||void 0===e?void 0:e.toJSON(),mapped:null===(t=this.mapped)||void 0===t?void 0:t.toJSON(),startSelection:null===(n=this.startSelection)||void 0===n?void 0:n.toJSON(),selectionsAfter:this.selectionsAfter.map(e=>e.toJSON())}}static fromJSON(e){return new HistEvent(e.changes&&ChangeSet.fromJSON(e.changes),[],e.mapped&&ChangeDesc.fromJSON(e.mapped),e.startSelection&&EditorSelection.fromJSON(e.startSelection),e.selectionsAfter.map(EditorSelection.fromJSON))}static fromTransaction(e,t){let n=none;for(let t of e.startState.facet(invertedEffects)){let o=t(e);o.length&&(n=n.concat(o))}return!n.length&&e.changes.empty?null:new HistEvent(e.changes.invert(e.startState.doc),n,void 0,t||e.startState.selection,none)}static selection(e){return new HistEvent(void 0,none,void 0,void 0,e)}}function updateBranch(e,t,n,o){let i=t+1>n+20?t-n-1:0,s=e.slice(i,t);return s.push(o),s}function isAdjacent(e,t){let n=[],o=!1;return e.iterChangedRanges((e,t)=>n.push(e,t)),t.iterChangedRanges((e,t,i,s)=>{for(let e=0;e<n.length;){let t=n[e++],r=n[e++];s>=t&&i<=r&&(o=!0)}}),o}function eqSelectionShape(e,t){return e.ranges.length==t.ranges.length&&0===e.ranges.filter((e,n)=>e.empty!=t.ranges[n].empty).length}function conc(e,t){return e.length?t.length?e.concat(t):e:t}const none=[],MaxSelectionsPerEvent=200;function addSelection(e,t){if(e.length){let n=e[e.length-1],o=n.selectionsAfter.slice(Math.max(0,n.selectionsAfter.length-200));return o.length&&o[o.length-1].eq(t)?e:(o.push(t),updateBranch(e,e.length-1,1e9,n.setSelAfter(o)))}return[HistEvent.selection([t])]}function popSelection(e){let t=e[e.length-1],n=e.slice();return n[e.length-1]=t.setSelAfter(t.selectionsAfter.slice(0,t.selectionsAfter.length-1)),n}function addMappingToBranch(e,t){if(!e.length)return e;let n=e.length,o=none;for(;n;){let i=mapEvent(e[n-1],t,o);if(i.changes&&!i.changes.empty||i.effects.length){let t=e.slice(0,n);return t[n-1]=i,t}t=i.mapped,n--,o=i.selectionsAfter}return o.length?[HistEvent.selection(o)]:none}function mapEvent(e,t,n){let o=conc(e.selectionsAfter.length?e.selectionsAfter.map(e=>e.map(t)):none,n);if(!e.changes)return HistEvent.selection(o);let i=e.changes.map(t),s=t.mapDesc(e.changes,!0),r=e.mapped?e.mapped.composeDesc(s):s;return new HistEvent(i,StateEffect.mapEffects(e.effects,t),r,e.startSelection.map(s),o)}const joinableUserEvent=/^(input\.type|delete)($|\.)/;class HistoryState{constructor(e,t,n=0,o){this.done=e,this.undone=t,this.prevTime=n,this.prevUserEvent=o}isolate(){return this.prevTime?new HistoryState(this.done,this.undone):this}addChanges(e,t,n,o,i){let s=this.done,r=s[s.length-1];return s=r&&r.changes&&!r.changes.empty&&e.changes&&(!n||joinableUserEvent.test(n))&&(!r.selectionsAfter.length&&t-this.prevTime<o&&isAdjacent(r.changes,e.changes)||"input.type.compose"==n)?updateBranch(s,s.length-1,i,new HistEvent(e.changes.compose(r.changes),conc(e.effects,r.effects),r.mapped,r.startSelection,none)):updateBranch(s,s.length,i,e),new HistoryState(s,none,t,n)}addSelection(e,t,n,o){let i=this.done.length?this.done[this.done.length-1].selectionsAfter:none;return i.length>0&&t-this.prevTime<o&&n==this.prevUserEvent&&n&&/^select($|\.)/.test(n)&&eqSelectionShape(i[i.length-1],e)?this:new HistoryState(addSelection(this.done,e),this.undone,t,n)}addMapping(e){return new HistoryState(addMappingToBranch(this.done,e),addMappingToBranch(this.undone,e),this.prevTime,this.prevUserEvent)}pop(e,t,n){let o=0==e?this.done:this.undone;if(0==o.length)return null;let i=o[o.length-1];if(n&&i.selectionsAfter.length)return t.update({selection:i.selectionsAfter[i.selectionsAfter.length-1],annotations:fromHistory.of({side:e,rest:popSelection(o)}),userEvent:0==e?"select.undo":"select.redo",scrollIntoView:!0});if(i.changes){let n=1==o.length?none:o.slice(0,o.length-1);return i.mapped&&(n=addMappingToBranch(n,i.mapped)),t.update({changes:i.changes,selection:i.startSelection,effects:i.effects,annotations:fromHistory.of({side:e,rest:n}),filter:!1,userEvent:0==e?"undo":"redo",scrollIntoView:!0})}return null}}HistoryState.empty=new HistoryState(none,none);const historyKeymap=[{key:"Mod-z",run:undo,preventDefault:!0},{key:"Mod-y",mac:"Mod-Shift-z",run:redo,preventDefault:!0},{key:"Mod-u",run:undoSelection,preventDefault:!0},{key:"Alt-u",mac:"Mod-Shift-u",run:redoSelection,preventDefault:!0}];export{history,historyField,historyKeymap,invertedEffects,isolateHistory,redo,redoDepth,redoSelection,undo,undoDepth,undoSelection};