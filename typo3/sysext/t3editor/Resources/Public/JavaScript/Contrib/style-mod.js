const C="ͼ",COUNT="undefined"==typeof Symbol?"__ͼ":Symbol.for(C),SET="undefined"==typeof Symbol?"__styleSet"+Math.floor(1e8*Math.random()):Symbol("styleSet"),top="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:{};export class StyleModule{constructor(e,t){this.rules=[];let{finish:l}=t||{};function s(e){return/^@/.test(e)?[e]:e.split(/,\s*/)}function o(e,t,n,i){let r=[],h=/^@(\w+)\b/.exec(e[0]),d=h&&"keyframes"==h[1];if(h&&null==t)return n.push(e[0]+";");for(let l in t){let i=t[l];if(/&/.test(l))o(l.split(/,\s*/).map(t=>e.map(e=>t.replace(/&/,e))).reduce((e,t)=>e.concat(t)),i,n);else if(i&&"object"==typeof i){if(!h)throw new RangeError("The value of a property ("+l+") should be a primitive value.");o(s(l),i,r,d)}else null!=i&&r.push(l.replace(/_.*/,"").replace(/[A-Z]/g,e=>"-"+e.toLowerCase())+": "+i+";")}(r.length||d)&&n.push((!l||h||i?e:e.map(l)).join(", ")+" {"+r.join(" ")+"}")}for(let t in e)o(s(t),e[t],this.rules)}getRules(){return this.rules.join("\n")}static newName(){let e=top[COUNT]||1;return top[COUNT]=e+1,C+e.toString(36)}static mount(e,t){(e[SET]||new StyleSet(e)).mount(Array.isArray(t)?t:[t])}}let adoptedSet=null;class StyleSet{constructor(e){if(!e.head&&e.adoptedStyleSheets&&"undefined"!=typeof CSSStyleSheet){if(adoptedSet)return e.adoptedStyleSheets=[adoptedSet.sheet].concat(e.adoptedStyleSheets),e[SET]=adoptedSet;this.sheet=new CSSStyleSheet,e.adoptedStyleSheets=[this.sheet].concat(e.adoptedStyleSheets),adoptedSet=this}else{this.styleTag=(e.ownerDocument||e).createElement("style");let t=e.head||e;t.insertBefore(this.styleTag,t.firstChild)}this.modules=[],e[SET]=this}mount(e){let t=this.sheet,l=0,s=0;for(let o=0;o<e.length;o++){let n=e[o],i=this.modules.indexOf(n);if(i<s&&i>-1&&(this.modules.splice(i,1),s--,i=-1),-1==i){if(this.modules.splice(s++,0,n),t)for(let e=0;e<n.rules.length;e++)t.insertRule(n.rules[e],l++)}else{for(;s<i;)l+=this.modules[s++].rules.length;l+=n.rules.length,s++}}if(!t){let e="";for(let t=0;t<this.modules.length;t++)e+=this.modules[t].getRules()+"\n";this.styleTag.textContent=e}}}