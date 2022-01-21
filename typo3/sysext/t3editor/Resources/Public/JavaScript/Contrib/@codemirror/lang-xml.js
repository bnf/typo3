import{parser}from"@lezer/xml";import{syntaxTree,LRLanguage,indentNodeProp,foldNodeProp,LanguageSupport}from"@codemirror/language";function tagName(e,t){let n=t&&t.getChild("TagName");return n?e.sliceString(n.from,n.to):""}function elementName(e,t){let n=t&&t.firstChild;return n&&"OpenTag"==n.name?tagName(e,n):""}function attrName(e,t,n){let o=t&&t.getChildren("Attribute").find(e=>e.from<=n&&e.to>=n),l=o&&o.getChild("AttributeName");return l?e.sliceString(l.from,l.to):""}function findParentElement(e){for(let t=e&&e.parent;t;t=t.parent)if("Element"==t.name)return t;return null}function findLocation(e,t){var n;let o=syntaxTree(e).resolveInner(t,-1),l=null;for(let e=o;!l&&e.parent;e=e.parent)"OpenTag"!=e.name&&"CloseTag"!=e.name&&"SelfClosingTag"!=e.name&&"MismatchedCloseTag"!=e.name||(l=e);if(l&&(l.to>t||l.lastChild.type.isError)){let e=l.parent;if("TagName"==o.name)return"CloseTag"==l.name||"MismatchedCloseTag"==l.name?{type:"closeTag",from:o.from,context:e}:{type:"openTag",from:o.from,context:findParentElement(e)};if("AttributeName"==o.name)return{type:"attrName",from:o.from,context:l};if("AttributeValue"==o.name)return{type:"attrValue",from:o.from,context:l};let n=o==l||"Attribute"==o.name?o.childBefore(t):o;return"StartTag"==(null==n?void 0:n.name)?{type:"openTag",from:t,context:findParentElement(e)}:"StartCloseTag"==(null==n?void 0:n.name)&&n.to<=t?{type:"closeTag",from:t,context:e}:"Is"==(null==n?void 0:n.name)?{type:"attrValue",from:t,context:l}:n?{type:"attrName",from:t,context:l}:null}if("StartCloseTag"==o.name)return{type:"closeTag",from:t,context:o.parent};for(;o.parent&&o.to==t&&!(null===(n=o.lastChild)||void 0===n?void 0:n.type.isError);)o=o.parent;return"Element"==o.name||"Text"==o.name||"Document"==o.name?{type:"tag",from:t,context:"Element"==o.name?o:findParentElement(o)}:null}class Element{constructor(e,t,n){this.attrs=t,this.attrValues=n,this.children=[],this.name=e.name,this.completion=Object.assign(Object.assign({type:"type"},e.completion||{}),{label:this.name}),this.openCompletion=Object.assign(Object.assign({},this.completion),{label:"<"+this.name}),this.closeCompletion=Object.assign(Object.assign({},this.completion),{label:"</"+this.name+">",boost:2}),this.closeNameCompletion=Object.assign(Object.assign({},this.completion),{label:this.name+">"}),this.text=e.textContent?e.textContent.map(e=>({label:e,type:"text"})):[]}}const Identifier=/^[:\-\.\w\u00b7-\uffff]*$/;function attrCompletion(e){return Object.assign(Object.assign({type:"property"},e.completion||{}),{label:e.name})}function valueCompletion(e){return"string"==typeof e?{label:`"${e}"`,type:"constant"}:/^"/.test(e.label)?e:Object.assign(Object.assign({},e),{label:`"${e.label}"`})}function completeFromSchema(e,t){let n=[],o=[],l=Object.create(null);for(let e of t){let t=attrCompletion(e);n.push(t),e.global&&o.push(t),e.values&&(l[e.name]=e.values.map(valueCompletion))}let a=[],r=[],i=Object.create(null);for(let t of e){let e=o,m=l;t.attributes&&(e=e.concat(t.attributes.map(e=>"string"==typeof e?n.find(t=>t.label==e)||{label:e,type:"property"}:(e.values&&(m==l&&(m=Object.create(m)),m[e.name]=e.values.map(valueCompletion)),attrCompletion(e)))));let s=new Element(t,e,m);i[s.name]=s,a.push(s),t.top&&r.push(s)}r.length||(r=a);for(let t=0;t<a.length;t++){let n=e[t],o=a[t];if(n.children)for(let e of n.children)i[e]&&o.children.push(i[e]);else o.children=a}return e=>{var t;let{doc:n}=e.state,m=findLocation(e.state,e.pos);if(!m||"tag"==m.type&&!e.explicit)return null;let{type:s,from:p,context:u}=m;if("openTag"==s){let e=r,t=elementName(n,u);if(t){let n=i[t];e=(null==n?void 0:n.children)||a}return{from:p,options:e.map(e=>e.completion),validFor:Identifier}}if("closeTag"==s){let o=elementName(n,u);return o?{from:p,to:e.pos+(">"==n.sliceString(e.pos,e.pos+1)?1:0),options:[(null===(t=i[o])||void 0===t?void 0:t.closeNameCompletion)||{label:o+">",type:"type"}],validFor:Identifier}:null}if("attrName"==s){let e=i[tagName(n,u)];return{from:p,options:(null==e?void 0:e.attrs)||o,validFor:Identifier}}if("attrValue"==s){let t=attrName(n,u,p);if(!t)return null;let o=i[tagName(n,u)],a=((null==o?void 0:o.attrValues)||l)[t];return a&&a.length?{from:p,to:e.pos+('"'==n.sliceString(e.pos,e.pos+1)?1:0),options:a,validFor:/^"[^"]*"?$/}:null}if("tag"==s){let t=elementName(n,u),o=i[t],l=[],m=u&&u.lastChild;!t||m&&"CloseTag"==m.name&&tagName(n,m)==t||l.push(o?o.closeCompletion:{label:"</"+t+">",type:"type",boost:2});let s=l.concat(((null==o?void 0:o.children)||(u?a:r)).map(e=>e.openCompletion));if(u&&(null==o?void 0:o.text.length)){let t=u.firstChild;t.to>e.pos-20&&!/\S/.test(e.state.sliceDoc(t.to,e.pos))&&(s=s.concat(o.text))}return{from:p,options:s,validFor:/^<\/?[:\-\.\w\u00b7-\uffff]*$/}}return null}}const xmlLanguage=LRLanguage.define({parser:parser.configure({props:[indentNodeProp.add({Element(e){let t=/^\s*<\//.test(e.textAfter);return e.lineIndent(e.node.from)+(t?0:e.unit)},"OpenTag CloseTag SelfClosingTag":e=>e.column(e.node.from)+e.unit}),foldNodeProp.add({Element(e){let t=e.firstChild,n=e.lastChild;return t&&"OpenTag"==t.name?{from:t.to,to:"CloseTag"==n.name?n.from:e.to}:null}})]}),languageData:{commentTokens:{block:{open:"\x3c!--",close:"--\x3e"}},indentOnInput:/^\s*<\/$/}});function xml(e={}){return new LanguageSupport(xmlLanguage,xmlLanguage.data.of({autocomplete:completeFromSchema(e.elements||[],e.attributes||[])}))}export{completeFromSchema,xml,xmlLanguage};