import{parser as e}from"@lezer/php"
import{parseMixed as t}from"@lezer/common"
import{html as o}from"@codemirror/lang-html"
import{LRLanguage as n,indentNodeProp as r,continuedIndent as a,delimitedIndent as l,foldNodeProp as s,foldInside as i,LanguageSupport as c}from"@codemirror/language"
const m=n.define({name:"php",parser:e.configure({props:[r.add({IfStatement:a({except:/^\s*({|else\b|elseif\b|endif\b)/}),TryStatement:a({except:/^\s*({|catch\b|finally\b)/}),SwitchBody:e=>{let t=e.textAfter,o=/^\s*\}/.test(t),n=/^\s*(case|default)\b/.test(t)
return e.baseIndent+(o?0:n?1:2)*e.unit},ColonBlock:e=>e.baseIndent+e.unit,"Block EnumBody DeclarationList":l({closing:"}"}),ArrowFunction:e=>e.baseIndent+e.unit,"String BlockComment":()=>null,Statement:a({except:/^({|end(for|foreach|switch|while)\b)/})}),s.add({"Block EnumBody DeclarationList SwitchBody ArrayExpression ValueList":i,ColonBlock:e=>({from:e.from+1,to:e.to}),BlockComment:e=>({from:e.from+2,to:e.to-2})})]}),languageData:{commentTokens:{block:{open:"/*",close:"*/"},line:"//"},indentOnInput:/^\s*(?:case |default:|end(?:if|for(?:each)?|switch|while)|else(?:if)?|\{|\})$/,wordChars:"$",closeBrackets:{stringPrefixes:["b","B"]}}})
function p(e={}){let n,r=[]
if(null===e.baseLanguage);else if(e.baseLanguage)n=e.baseLanguage
else{let e=o({matchClosingTags:!1})
r.push(e.support),n=e.language}return new c(m.configure({wrap:n&&t((e=>e.type.isTop?{parser:n.parser,overlay:e=>"Text"==e.name}:null)),top:e.plain?"Program":"Template"}),r)}export{p as php,m as phpLanguage}
