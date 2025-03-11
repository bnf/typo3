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
var e=function(e,t,o,r){var i,n=arguments.length,s=n<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r
if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,o,r)
else for(var l=e.length-1;l>=0;l--)(i=e[l])&&(s=(n<3?i(s):n>3?i(t,o,s):i(t,o))||s)
return n>3&&s&&Object.defineProperty(t,o,s),s}
import{html as t,LitElement as o}from"lit"
import{customElement as r,property as i,queryAssignedElements as n}from"lit/decorators.js"
import s from"@typo3/core/ajax/ajax-request.js"
import l from"@typo3/core/event/debounce-event.js"
import{prefixAndRebaseCss as d}from"@typo3/rte-ckeditor/css-prefixer.js"
import{ClassicEditor as a}from"@ckeditor/ckeditor5-editor-classic"
const c=[{module:"@ckeditor/ckeditor5-block-quote",exports:["BlockQuote"]},{module:"@ckeditor/ckeditor5-essentials",exports:["Essentials"]},{module:"@ckeditor/ckeditor5-find-and-replace",exports:["FindAndReplace"]},{module:"@ckeditor/ckeditor5-heading",exports:["Heading"]},{module:"@ckeditor/ckeditor5-indent",exports:["Indent"]},{module:"@ckeditor/ckeditor5-link",exports:["Link"]},{module:"@ckeditor/ckeditor5-list",exports:["List"]},{module:"@ckeditor/ckeditor5-paragraph",exports:["Paragraph"]},{module:"@ckeditor/ckeditor5-clipboard",exports:["PastePlainText"]},{module:"@ckeditor/ckeditor5-paste-from-office",exports:["PasteFromOffice"]},{module:"@ckeditor/ckeditor5-remove-format",exports:["RemoveFormat"]},{module:"@ckeditor/ckeditor5-table",exports:["Table","TableToolbar","TableProperties","TableCellProperties","TableCaption"]},{module:"@ckeditor/ckeditor5-typing",exports:["TextTransformation"]},{module:"@ckeditor/ckeditor5-source-editing",exports:["SourceEditing"]},{module:"@ckeditor/ckeditor5-alignment",exports:["Alignment"]},{module:"@ckeditor/ckeditor5-style",exports:["Style"]},{module:"@ckeditor/ckeditor5-html-support",exports:["GeneralHtmlSupport"]},{module:"@ckeditor/ckeditor5-basic-styles",exports:["Bold","Italic","Subscript","Superscript","Strikethrough","Underline"]},{module:"@ckeditor/ckeditor5-special-characters",exports:["SpecialCharacters","SpecialCharactersEssentials"]},{module:"@ckeditor/ckeditor5-horizontal-line",exports:["HorizontalLine"]}]
let p=class extends o{constructor(){super(...arguments),this.options={},this.styleSheets=new Map}connectedCallback(){super.connectedCallback(),this.prefixAndLoadContentsCss()}disconnectedCallback(){super.disconnectedCallback(),document.adoptedStyleSheets=document.adoptedStyleSheets.filter((e=>!this.styleSheets.has(e))),this.styleSheets.clear()}firstUpdated(){this.target[0]instanceof HTMLTextAreaElement?this.initCKEditor():this.renderRoot.querySelector('slot[name="textarea"]').addEventListener("slotchange",(()=>this.initCKEditor()),{once:!0})}async initCKEditor(){if(!(this.target[0]instanceof HTMLTextAreaElement))throw new Error("No rich-text <textarea> content target found.")
const{importModules,removeImportModules,width,height,readOnly,debug,toolbar,placeholder,htmlSupport,wordCount,typo3link,removePlugins,...otherOptions}=this.options
"extraPlugins"in otherOptions&&delete otherOptions.extraPlugins,"contentsCss"in otherOptions&&delete otherOptions.contentsCss
const e=await this.resolvePlugins(c,importModules,removeImportModules),t={licenseKey:"GPL",...otherOptions,toolbar,plugins:e,placeholder,wordCount,typo3link:typo3link||null,removePlugins:removePlugins||[]}
void 0!==htmlSupport&&(t.htmlSupport=m(htmlSupport)),void 0!==t?.typing?.transformations&&(t.typing.transformations=m(t.typing.transformations)),a.create(this.target[0],t).then((e=>{if(this.applyEditableElementStyles(e,width,height),this.handleWordCountPlugin(e,wordCount),this.applyReadOnly(e,readOnly),e.model.document.on("change:data",(()=>{e.updateSourceElement(),this.target[0].dispatchEvent(new Event("change",{bubbles:!0,cancelable:!0}))})),e.plugins.has("SourceEditing")){const t=e.plugins.get("SourceEditing")
t.on("change:isSourceEditingMode",((o,r,i)=>{for(const[rootName]of e.editing.view.domRoots)if(i){const n=e.ui.getEditableElement(`sourceEditing:${rootName}`)
if(!(n instanceof HTMLTextAreaElement))throw new Error("Cannot find textarea related to source editing. Has CKEditor been upgraded?")
new l("input",(()=>{t.updateEditorData()}),100).bindTo(n)}}))}debug&&import("@ckeditor/ckeditor5-inspector").then((({default:CKEditorInspector})=>CKEditorInspector.attach(e,{isCollapsed:!0})))}))}render(){return t`<slot name="textarea"></slot><slot></slot>`}async resolvePlugins(e,t,o){const r=h(o||[]),i=h([...e,...t||[]]).map((e=>{const{module}=e
let{exports}=e
for(const t of r)t.module===module&&(exports=exports.filter((e=>!t.exports.includes(e))))
return{module,exports}})),n=await Promise.all(i.map((async e=>{try{return{module:await import(e.module),exports:e.exports}}catch(t){return console.error(`Failed to load CKEditor5 module ${e.module}`,t),{module:null,exports:[]}}}))),s=[]
n.forEach((({module,exports})=>{for(const e of exports)e in module?s.push(module[e]):console.error(`CKEditor5 plugin export "${e}" not available in`,module)}))
const l=s.filter((e=>e.overrides?.length>0)).map((e=>e.overrides)).flat(1)
return s.filter((e=>!l.includes(e)))}async prefixAndLoadContentsCss(){if(!Array.isArray(this.options.contentsCss))return
const e=(await Promise.allSettled(this.options.contentsCss.map((e=>this.prefixContentsCss(e,this.getAttribute("id")))))).map((e=>"fulfilled"===e.status?e.value:null)).filter((e=>null!==e))
e.forEach((e=>this.styleSheets.set(e,!0))),document.adoptedStyleSheets=[...document.adoptedStyleSheets,...e]}async prefixContentsCss(e,t){let o
try{const r=await new s(e).get()
o=await r.resolve()}catch(t){throw console.error(`Failed to fetch CSS content for CKEditor5 prefixing: "${e}"`,t),new Error}const i=d(o,e,`#${t} .ck-content`),n=new CSSStyleSheet
return await n.replace(i),n}applyEditableElementStyles(e,t,o){const r=e.editing.view,i={"min-height":o,"min-width":t}
Object.keys(i).forEach((e=>{const t=i[e]
if(!t)return
let o
o="number"!=typeof t&&Number.isNaN(Number(o))?t:`${t}px`,r.change((t=>{t.setStyle(e,o,r.document.getRoot())}))}))}handleWordCountPlugin(e,t){if(e.plugins.has("WordCount")&&(t?.displayWords||t?.displayCharacters)){const o=e.plugins.get("WordCount")
this.appendChild(o.wordCountContainer)}}applyReadOnly(e,t){t&&e.enableReadOnlyMode("typo3-lock")}}
e([i({type:Object})],p.prototype,"options",void 0),e([n({slot:"textarea"})],p.prototype,"target",void 0),p=e([r("typo3-rte-ckeditor-ckeditor5")],p)
export{p as CKEditor5Element}
function u(e,t){if("object"==typeof e){if(Array.isArray(e))return e.map((e=>t(e)??u(e,t)))
const o={}
for(const[key,value]of Object.entries(e))o[key]=t(value)??u(value,t)
return o}return e}function m(e){return u(e,(e=>{if("object"==typeof e&&"pattern"in e&&"string"==typeof e.pattern){const t=e
return new RegExp(t.pattern,t.flags||void 0)}return null}))}function h(e){return e.map((e=>"string"==typeof e?{module:e,exports:["default"]}:e))}