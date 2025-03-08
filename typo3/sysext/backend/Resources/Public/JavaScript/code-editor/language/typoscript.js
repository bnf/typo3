/*
 * This file is part of the TYPO3 CMS project.
 *
 * It is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License, either version 2
 * of the License, or any later version.
 *
 * For the full copyright and license information, please read the
 * LICENSE.txt file that was distributed with this source code.
 *
 * The TYPO3 project - inspiring people to share!
 */
import t from"@typo3/core/document-service.js"
import{StreamLanguage as e,LanguageSupport as n}from"@codemirror/language"
import{TypoScriptStreamParserFactory as o}from"@typo3/backend/code-editor/stream-parser/typoscript.js"
import{TsCodeCompletion as r}from"@typo3/backend/code-editor/autocomplete/ts-code-completion.js"
import{syntaxTree as s}from"@codemirror/language"
export function typoscript(){const t=e.define((new o).create()),r=t.data.of({autocomplete:complete})
return new n(t,[r])}const c=(async()=>{await t.ready()
const e=parseInt(document.querySelector('input[name="effectivePid"]')?.value,10)
return new r(e)})()
export async function complete(t){if(!t.explicit)return null
const e=function(t){const e=t.state.sliceDoc().split(t.state.lineBreak).length,n=t.state.sliceDoc(0,t.pos).split(t.state.lineBreak).length,o=t.state.sliceDoc().split(t.state.lineBreak)[n-1],r=t.state.sliceDoc(t.pos-1,t.pos),c="."===r,a=function(t,e){const n=Array(t).fill("").map((()=>[]))
let o=0,r=1
s(e.state).cursor().iterate((s=>{const c=s.type.name||s.name
if("Document"===c)return
const a=s.from,i=s.to
o<a&&e.state.sliceDoc(o,a).split(e.state.lineBreak).forEach((e=>{e&&(n[Math.min(r-1,t-1)].push({type:null,string:e,start:o,end:o+e.length}),r++,o+=e.length)}))
const l=e.state.sliceDoc(s.from,s.to)
r=e.state.sliceDoc(0,s.from).split(e.state.lineBreak).length,n[r-1].push({type:c,string:l,start:a,end:i}),o=i})),o<e.state.doc.length&&n[r-1].push({type:null,string:e.state.sliceDoc(o),start:o,end:e.state.doc.length})
return n}(e,t)
return{lineTokens:a,currentLineNumber:n,currentLine:o,lineCount:e,completingAfterDot:c}}(t),n=t.pos-(e.completingAfterDot?1:0),o=s(t.state).resolveInner(n,-1),r="Document"===o.name||e.completingAfterDot?"":t.state.sliceDoc(o.from,n),a="Document"===o.name||e.completingAfterDot?t.pos:o.from
let i={start:o.from,end:n,string:r,type:o.name};/^[\w$_]*$/.test(r)||(i={start:t.pos,end:t.pos,string:"",type:"."===r?"property":null}),e.token=i
const l=(await c).refreshCodeCompletion(e)
if(("string"===o.name||"comment"===o.name)&&function(t,e){const n=t.length
for(let o=0;o<e.length;++o)if(t===e[o].substr(n))return!0
return!1}(r,l))return null
const p=function(t,e){const n=new Set,o=e=>{0!==e.lastIndexOf(t,0)||n.has(e)||n.add(e)}
for(let t=0,n=e.length;t<n;++t)o(e[t])
const r=Array.from(n)
return r.sort(),r}(r,l)
return{from:a,options:p.map((t=>({label:t,type:"keyword"})))}}