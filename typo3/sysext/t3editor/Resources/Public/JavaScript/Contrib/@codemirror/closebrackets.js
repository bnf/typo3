import{EditorView}from"@codemirror/view";import{StateEffect,MapMode,StateField,EditorSelection,CharCategory}from"@codemirror/state";import{RangeValue,RangeSet}from"@codemirror/rangeset";import{codePointSize,codePointAt,fromCodePoint}from"@codemirror/text";import{syntaxTree}from"@codemirror/language";const defaults={brackets:["(","[","{","'",'"'],before:")]}'\":;>"},closeBracketEffect=StateEffect.define({map(e,t){let r=t.mapPos(e,-1,MapMode.TrackAfter);return null==r?void 0:r}}),skipBracketEffect=StateEffect.define({map:(e,t)=>t.mapPos(e)}),closedBracket=new class extends RangeValue{};closedBracket.startSide=1,closedBracket.endSide=-1;const bracketState=StateField.define({create:()=>RangeSet.empty,update(e,t){if(t.selection){let r=t.state.doc.lineAt(t.selection.main.head).from,n=t.startState.doc.lineAt(t.startState.selection.main.head).from;r!=t.changes.mapPos(n,-1)&&(e=RangeSet.empty)}e=e.map(t.changes);for(let r of t.effects)r.is(closeBracketEffect)?e=e.update({add:[closedBracket.range(r.value,r.value+1)]}):r.is(skipBracketEffect)&&(e=e.update({filter:e=>e!=r.value}));return e}});function closeBrackets(){return[EditorView.inputHandler.of(handleInput),bracketState]}const definedClosing="()[]{}<>";function closing(e){for(let t=0;t<"()[]{}<>".length;t+=2)if("()[]{}<>".charCodeAt(t)==e)return"()[]{}<>".charAt(t+1);return fromCodePoint(e<128?e:e+1)}function config(e,t){return e.languageDataAt("closeBrackets",t)[0]||defaults}function handleInput(e,t,r,n){if(e.composing)return!1;let o=e.state.selection.main;if(n.length>2||2==n.length&&1==codePointSize(codePointAt(n,0))||t!=o.from||r!=o.to)return!1;let a=insertBracket(e.state,n);return!!a&&(e.dispatch(a),!0)}const deleteBracketPair=({state:e,dispatch:t})=>{let r=config(e,e.selection.main.head).brackets||defaults.brackets,n=null,o=e.changeByRange(t=>{if(t.empty){let n=prevChar(e.doc,t.head);for(let o of r)if(o==n&&nextChar(e.doc,t.head)==closing(codePointAt(o,0)))return{changes:{from:t.head-o.length,to:t.head+o.length},range:EditorSelection.cursor(t.head-o.length),userEvent:"delete.backward"}}return{range:n=t}});return n||t(e.update(o,{scrollIntoView:!0})),!n},closeBracketsKeymap=[{key:"Backspace",run:deleteBracketPair}];function insertBracket(e,t){let r=config(e,e.selection.main.head),n=r.brackets||defaults.brackets;for(let o of n){let a=closing(codePointAt(o,0));if(t==o)return a==o?handleSame(e,o,n.indexOf(o+o+o)>-1):handleOpen(e,o,a,r.before||defaults.before);if(t==a&&closedBracketAt(e,e.selection.main.from))return handleClose(e,o,a)}return null}function closedBracketAt(e,t){let r=!1;return e.field(bracketState).between(0,e.doc.length,e=>{e==t&&(r=!0)}),r}function nextChar(e,t){let r=e.sliceString(t,t+2);return r.slice(0,codePointSize(codePointAt(r,0)))}function prevChar(e,t){let r=e.sliceString(t-2,t);return codePointSize(codePointAt(r,0))==r.length?r:r.slice(1)}function handleOpen(e,t,r,n){let o=null,a=e.changeByRange(a=>{if(!a.empty)return{changes:[{insert:t,from:a.from},{insert:r,from:a.to}],effects:closeBracketEffect.of(a.to+t.length),range:EditorSelection.range(a.anchor+t.length,a.head+t.length)};let c=nextChar(e.doc,a.head);return!c||/\s/.test(c)||n.indexOf(c)>-1?{changes:{insert:t+r,from:a.head},effects:closeBracketEffect.of(a.head+t.length),range:EditorSelection.cursor(a.head+t.length)}:{range:o=a}});return o?null:e.update(a,{scrollIntoView:!0,userEvent:"input.type"})}function handleClose(e,t,r){let n=null,o=e.selection.ranges.map(t=>t.empty&&nextChar(e.doc,t.head)==r?EditorSelection.cursor(t.head+r.length):n=t);return n?null:e.update({selection:EditorSelection.create(o,e.selection.mainIndex),scrollIntoView:!0,effects:e.selection.ranges.map(({from:e})=>skipBracketEffect.of(e))})}function handleSame(e,t,r){let n=null,o=e.changeByRange(o=>{if(!o.empty)return{changes:[{insert:t,from:o.from},{insert:t,from:o.to}],effects:closeBracketEffect.of(o.to+t.length),range:EditorSelection.range(o.anchor+t.length,o.head+t.length)};let a=o.head,c=nextChar(e.doc,a);if(c==t){if(nodeStart(e,a))return{changes:{insert:t+t,from:a},effects:closeBracketEffect.of(a+t.length),range:EditorSelection.cursor(a+t.length)};if(closedBracketAt(e,a)){let n=r&&e.sliceDoc(a,a+3*t.length)==t+t+t;return{range:EditorSelection.cursor(a+t.length*(n?3:1)),effects:skipBracketEffect.of(a)}}}else{if(r&&e.sliceDoc(a-2*t.length,a)==t+t&&nodeStart(e,a-2*t.length))return{changes:{insert:t+t+t+t,from:a},effects:closeBracketEffect.of(a+t.length),range:EditorSelection.cursor(a+t.length)};if(e.charCategorizer(a)(c)!=CharCategory.Word){let r=e.sliceDoc(a-1,a);if(r!=t&&e.charCategorizer(a)(r)!=CharCategory.Word)return{changes:{insert:t+t,from:a},effects:closeBracketEffect.of(a+t.length),range:EditorSelection.cursor(a+t.length)}}}return{range:n=o}});return n?null:e.update(o,{scrollIntoView:!0,userEvent:"input.type"})}function nodeStart(e,t){let r=syntaxTree(e).resolveInner(t+1);return r.parent&&r.from==t}export{closeBrackets,closeBracketsKeymap,deleteBracketPair,insertBracket};