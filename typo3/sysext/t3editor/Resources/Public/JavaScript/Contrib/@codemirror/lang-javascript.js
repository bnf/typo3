import{parser}from"@lezer/javascript";import{syntaxTree,LRLanguage,indentNodeProp,continuedIndent,flatIndent,delimitedIndent,foldNodeProp,foldInside,LanguageSupport}from"@codemirror/language";import{EditorSelection}from"@codemirror/state";import{EditorView}from"@codemirror/view";import{snippetCompletion,ifNotIn,completeFromList}from"@codemirror/autocomplete";import{NodeWeakMap,IterMode}from"@lezer/common";const snippets=[snippetCompletion("function ${name}(${params}) {\n\t${}\n}",{label:"function",detail:"definition",type:"keyword"}),snippetCompletion("for (let ${index} = 0; ${index} < ${bound}; ${index}++) {\n\t${}\n}",{label:"for",detail:"loop",type:"keyword"}),snippetCompletion("for (let ${name} of ${collection}) {\n\t${}\n}",{label:"for",detail:"of loop",type:"keyword"}),snippetCompletion("do {\n\t${}\n} while (${})",{label:"do",detail:"loop",type:"keyword"}),snippetCompletion("while (${}) {\n\t${}\n}",{label:"while",detail:"loop",type:"keyword"}),snippetCompletion("try {\n\t${}\n} catch (${error}) {\n\t${}\n}",{label:"try",detail:"/ catch block",type:"keyword"}),snippetCompletion("if (${}) {\n\t${}\n}",{label:"if",detail:"block",type:"keyword"}),snippetCompletion("if (${}) {\n\t${}\n} else {\n\t${}\n}",{label:"if",detail:"/ else block",type:"keyword"}),snippetCompletion("class ${name} {\n\tconstructor(${params}) {\n\t\t${}\n\t}\n}",{label:"class",detail:"definition",type:"keyword"}),snippetCompletion('import {${names}} from "${module}"\n${}',{label:"import",detail:"named",type:"keyword"}),snippetCompletion('import ${name} from "${module}"\n${}',{label:"import",detail:"default",type:"keyword"})],cache=new NodeWeakMap,ScopeNodes=new Set(["Script","Block","FunctionExpression","FunctionDeclaration","ArrowFunction","MethodDeclaration","ForStatement"]);function defID(e){return(t,n)=>{let o=t.node.getChild("VariableDefinition");return o&&n(o,e),!0}}const functionContext=["FunctionDeclaration"],gatherCompletions={FunctionDeclaration:defID("function"),ClassDeclaration:defID("class"),ClassExpression:()=>!0,EnumDeclaration:defID("constant"),TypeAliasDeclaration:defID("type"),NamespaceDeclaration:defID("namespace"),VariableDefinition(e,t){e.matchContext(functionContext)||t(e,"variable")},TypeDefinition(e,t){t(e,"type")},__proto__:null};function getScope(e,t){let n=cache.get(t);if(n)return n;let o=[],r=!0;function a(t,n){let r=e.sliceString(t.from,t.to);o.push({label:r,type:n})}return t.cursor(IterMode.IncludeAnonymous).iterate(t=>{if(r)r=!1;else if(t.name){let e=gatherCompletions[t.name];if(e&&e(t,a)||ScopeNodes.has(t.name))return!1}else if(t.to-t.from>8192){for(let n of getScope(e,t.node))o.push(n);return!1}}),cache.set(t,o),o}const Identifier=/^[\w$\xa1-\uffff][\w$\d\xa1-\uffff]*$/,dontComplete=["TemplateString","String","RegExp","LineComment","BlockComment","VariableDefinition","TypeDefinition","Label","PropertyDefinition","PropertyName","PrivatePropertyDefinition","PrivatePropertyName"];function localCompletionSource(e){let t=syntaxTree(e.state).resolveInner(e.pos,-1);if(dontComplete.indexOf(t.name)>-1)return null;let n=t.to-t.from<20&&Identifier.test(e.state.sliceDoc(t.from,t.to));if(!n&&!e.explicit)return null;let o=[];for(let n=t;n;n=n.parent)ScopeNodes.has(n.name)&&(o=o.concat(getScope(e.state.doc,n)));return{options:o,from:n?t.from:e.pos,validFor:Identifier}}const javascriptLanguage=LRLanguage.define({parser:parser.configure({props:[indentNodeProp.add({IfStatement:continuedIndent({except:/^\s*({|else\b)/}),TryStatement:continuedIndent({except:/^\s*({|catch\b|finally\b)/}),LabeledStatement:flatIndent,SwitchBody:e=>{let t=e.textAfter,n=/^\s*\}/.test(t),o=/^\s*(case|default)\b/.test(t);return e.baseIndent+(n?0:o?1:2)*e.unit},Block:delimitedIndent({closing:"}"}),ArrowFunction:e=>e.baseIndent+e.unit,"TemplateString BlockComment":()=>null,"Statement Property":continuedIndent({except:/^{/}),JSXElement(e){let t=/^\s*<\//.test(e.textAfter);return e.lineIndent(e.node.from)+(t?0:e.unit)},JSXEscape(e){let t=/\s*\}/.test(e.textAfter);return e.lineIndent(e.node.from)+(t?0:e.unit)},"JSXOpenTag JSXSelfClosingTag":e=>e.column(e.node.from)+e.unit}),foldNodeProp.add({"Block ClassBody SwitchBody EnumBody ObjectExpression ArrayExpression":foldInside,BlockComment:e=>({from:e.from+2,to:e.to-2})})]}),languageData:{closeBrackets:{brackets:["(","[","{","'",'"',"`"]},commentTokens:{line:"//",block:{open:"/*",close:"*/"}},indentOnInput:/^\s*(?:case |default:|\{|\}|<\/)$/,wordChars:"$"}}),typescriptLanguage=javascriptLanguage.configure({dialect:"ts"}),jsxLanguage=javascriptLanguage.configure({dialect:"jsx"}),tsxLanguage=javascriptLanguage.configure({dialect:"jsx ts"}),keywords="break case const continue default delete export extends false finally in instanceof let new return static super switch this throw true typeof var yield".split(" ").map(e=>({label:e,type:"keyword"}));function javascript(e={}){let t=e.jsx?e.typescript?tsxLanguage:jsxLanguage:e.typescript?typescriptLanguage:javascriptLanguage;return new LanguageSupport(t,[javascriptLanguage.data.of({autocomplete:ifNotIn(dontComplete,completeFromList(snippets.concat(keywords)))}),javascriptLanguage.data.of({autocomplete:localCompletionSource}),e.jsx?autoCloseTags:[]])}function elementName(e,t,n=e.length){if(!t)return"";let o=t.getChild("JSXIdentifier");return o?e.sliceString(o.from,Math.min(o.to,n)):""}const android="object"==typeof navigator&&/Android\b/.test(navigator.userAgent),autoCloseTags=EditorView.inputHandler.of((e,t,n,o)=>{if((android?e.composing:e.compositionStarted)||e.state.readOnly||t!=n||">"!=o&&"/"!=o||!javascriptLanguage.isActiveAt(e.state,t,-1))return!1;let{state:r}=e,a=r.changeByRange(e=>{var t,n,a;let i,{head:l}=e,s=syntaxTree(r).resolveInner(l,-1);if("JSXStartTag"==s.name&&(s=s.parent),">"==o&&"JSXFragmentTag"==s.name)return{range:EditorSelection.cursor(l+1),changes:{from:l,insert:"><>"}};if(">"==o&&"JSXIdentifier"==s.name){if("JSXEndTag"!=(null===(n=null===(t=s.parent)||void 0===t?void 0:t.lastChild)||void 0===n?void 0:n.name)&&(i=elementName(r.doc,s.parent,l)))return{range:EditorSelection.cursor(l+1),changes:{from:l,insert:`></${i}>`}}}else if("/"==o&&"JSXFragmentTag"==s.name){let e=s.parent,t=null==e?void 0:e.parent;if(e.from==l-1&&"JSXEndTag"!=(null===(a=t.lastChild)||void 0===a?void 0:a.name)&&(i=elementName(r.doc,null==t?void 0:t.firstChild,l))){let e=`/${i}>`;return{range:EditorSelection.cursor(l+e.length),changes:{from:l,insert:e}}}}return{range:e}});return!a.changes.empty&&(e.dispatch(a,{userEvent:"input.type",scrollIntoView:!0}),!0)});function esLint(e,t){return t||(t={parserOptions:{ecmaVersion:2019,sourceType:"module"},env:{browser:!0,node:!0,es6:!0,es2015:!0,es2017:!0,es2020:!0},rules:{}},e.getRules().forEach((e,n)=>{e.meta.docs.recommended&&(t.rules[n]=2)})),n=>{let{state:o}=n,r=[];for(let{from:n,to:a}of javascriptLanguage.findRegions(o)){let i=o.doc.lineAt(n),l={line:i.number-1,col:n-i.from,pos:n};for(let i of e.verify(o.sliceDoc(n,a),t))r.push(translateDiagnostic(i,o.doc,l))}return r}}function mapPos(e,t,n,o){return n.line(e+o.line).from+t+(1==e?o.col-1:-1)}function translateDiagnostic(e,t,n){let o=mapPos(e.line,e.column,t,n),r={from:o,to:null!=e.endLine&&1!=e.endColumn?mapPos(e.endLine,e.endColumn,t,n):o,message:e.message,source:e.ruleId?"eslint:"+e.ruleId:"eslint",severity:1==e.severity?"warning":"error"};if(e.fix){let{range:t,text:a}=e.fix,i=t[0]+n.pos-o,l=t[1]+n.pos-o;r.actions=[{name:"fix",apply(e,t){e.dispatch({changes:{from:t+i,to:t+l,insert:a},scrollIntoView:!0})}}]}return r}export{autoCloseTags,esLint,javascript,javascriptLanguage,jsxLanguage,localCompletionSource,snippets,tsxLanguage,typescriptLanguage};