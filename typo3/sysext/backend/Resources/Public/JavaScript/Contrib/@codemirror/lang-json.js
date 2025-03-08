import{parser as e}from"@lezer/json"
import{LRLanguage as t,indentNodeProp as r,continuedIndent as n,foldNodeProp as a,foldInside as o,LanguageSupport as s}from"@codemirror/language"
const c=()=>e=>{try{JSON.parse(e.state.doc.toString())}catch(t){if(!(t instanceof SyntaxError))throw t
const r=function(e,t){let r
return(r=e.message.match(/at position (\d+)/))?Math.min(+r[1],t.length):(r=e.message.match(/at line (\d+) column (\d+)/))?Math.min(t.line(+r[1]).from+ +r[2]-1,t.length):0}(t,e.state.doc)
return[{from:r,message:t.message,severity:"error",to:r}]}return[]}
const i=t.define({name:"json",parser:e.configure({props:[r.add({Object:n({except:/^\s*\}/}),Array:n({except:/^\s*\]/})}),a.add({"Object Array":o})]}),languageData:{closeBrackets:{brackets:["[","{",'"']},indentOnInput:/^\s*[\}\]]$/}})
function m(){return new s(i)}export{m as json,i as jsonLanguage,c as jsonParseLinter}
