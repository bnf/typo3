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
var e=function(e,t,o,r){var i,s=arguments.length,n=s<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r
if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,o,r)
else for(var l=e.length-1;l>=0;l--)(i=e[l])&&(n=(s<3?i(n):s>3?i(t,o,n):i(t,o))||n)
return s>3&&n&&Object.defineProperty(t,o,n),n}
import{LitElement as t,html as o,css as r}from"lit"
import{customElement as i,property as s,state as n}from"lit/decorators.js"
import{EditorView as l,lineNumbers as a,highlightSpecialChars as d,drawSelection as h,keymap as p,placeholder as c}from"@codemirror/view"
import{EditorState as m,Compartment as y}from"@codemirror/state"
import{syntaxHighlighting as u,defaultHighlightStyle as f}from"@codemirror/language"
import{defaultKeymap as b,indentWithTab as g}from"@codemirror/commands"
import{oneDark as v}from"@codemirror/theme-one-dark"
import{executeJavaScriptModuleInstruction as w,loadModule as k,resolveSubjectRef as E}from"@typo3/core/java-script-item-processor.js"
import"@typo3/backend/element/spinner-element.js"
let x=class extends t{constructor(){super(...arguments),this.mode=null,this.addons=[],this.keymaps=[],this.lineDigits=0,this.autoheight=!1,this.nolazyload=!1,this.readonly=!1,this.fullscreen=!1,this.panel="bottom",this.editorTheme=null,this.editorView=null}static{this.styles=r`:host{position:relative;display:block}:host([fullscreen]){position:fixed;inset:64px 0 0;z-index:9}:host([fullscreen]) .cm-scroller{min-height:initial;max-height:100%}:host([autoheight]) .cm-scroller{max-height:initial}.codemirror-label{font-size:.875em;opacity:.75}.codemirror-label-top{margin-bottom:.25rem}.codemirror-label-bottom{margin-top:.25rem}typo3-backend-spinner{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)}.cm-editor{overflow:hidden;border-radius:var(--typo3-input-border-radius);border:var(--typo3-input-border-width) solid var(--typo3-input-border-color);transition:outline-color .15s ease-in-out,box-shadow .15s ease-in-out}.cm-focused{border-color:var(--typo3-input-focus-border-color);outline-offset:0;outline:.25rem solid color-mix(in srgb,var(--typo3-form-control-focus-border-color),transparent 25%)}.cm-gutters{height:auto!important;position:relative!important}.cm-content{min-height:calc(8px + 12px * 1.4 * var(--rows,18))!important}.cm-scroller{min-height:100%;max-height:calc(100dvh - 10rem)}`}setContent(e){null!==this.editorView&&this.editorView.dispatch({changes:{from:0,to:this.editorView.state.doc.length,insert:e}})}getContent(){return this.editorView.state.doc.toString()}render(){return o`${this.label&&"top"===this.panel?o`<div class="codemirror-label codemirror-label-top">${this.label}</div>`:""}<div id="codemirror-parent" @keydown="${e=>this.onKeydown(e)}"></div>${this.label&&"bottom"===this.panel?o`<div class="codemirror-label codemirror-label-bottom">${this.label}</div>`:""} ${null===this.editorView?o`<typo3-backend-spinner size="large"></typo3-backend-spinner>`:""}`}firstUpdated(){if(this.nolazyload)return void this.initializeEditor(this.firstElementChild)
const e={root:document.body},t=new IntersectionObserver((e=>{e.forEach((e=>{e.intersectionRatio>0&&(t.unobserve(e.target),this.firstElementChild&&"textarea"===this.firstElementChild.nodeName.toLowerCase()&&this.initializeEditor(this.firstElementChild))}))}),e)
t.observe(this)}onKeydown(e){e.ctrlKey&&e.altKey&&"f"===e.key&&(e.preventDefault(),this.fullscreen=!0),"Escape"===e.key&&this.fullscreen&&(e.preventDefault(),this.fullscreen=!1)}async initializeEditor(e){const t=l.updateListener.of((t=>{t.docChanged&&(e.value=t.state.doc.toString(),e.dispatchEvent(new CustomEvent("change",{bubbles:!0})))}))
this.lineDigits>0?this.style.setProperty("--rows",this.lineDigits.toString()):e.getAttribute("rows")&&this.style.setProperty("--rows",e.getAttribute("rows")),this.editorTheme=new y
const o=[this.editorTheme.of([]),t,a(),d(),h(),m.allowMultipleSelections.of(!0),u(f,{fallback:!0})]
if(this.readonly&&o.push(m.readOnly.of(!0)),this.placeholder&&o.push(c(this.placeholder)),this.mode){const e=await w(this.mode)
o.push(...e)}this.addons.length>0&&o.push(...await Promise.all(this.addons.map((e=>w(e)))))
const r=[...b,g]
if(this.keymaps.length>0){const e=await Promise.all(this.keymaps.map((e=>k(e).then((t=>E(t,e))))))
e.forEach((e=>r.push(...e)))}o.push(p.of(r)),this.editorView=new l({state:m.create({doc:e.value,extensions:o}),parent:this.renderRoot.querySelector("#codemirror-parent"),root:this.renderRoot}),this.toggleDarkMode(this.darkModeEnabled())
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",(()=>{this.toggleDarkMode(this.darkModeEnabled())}))}darkModeEnabled(){const e=window.getComputedStyle(this).colorScheme
return"light only"!==e&&"light"!==e&&("dark only"===e||"dark"===e||window.matchMedia("(prefers-color-scheme: dark)").matches)}toggleDarkMode(e){this.editorView.dispatch({effects:this.editorTheme.reconfigure(e?v:[])})}}
e([s({type:Object})],x.prototype,"mode",void 0),e([s({type:Array})],x.prototype,"addons",void 0),e([s({type:Array})],x.prototype,"keymaps",void 0),e([s({type:Number})],x.prototype,"lineDigits",void 0),e([s({type:Boolean,reflect:!0})],x.prototype,"autoheight",void 0),e([s({type:Boolean})],x.prototype,"nolazyload",void 0),e([s({type:Boolean})],x.prototype,"readonly",void 0),e([s({type:Boolean,reflect:!0})],x.prototype,"fullscreen",void 0),e([s({type:String})],x.prototype,"label",void 0),e([s({type:String})],x.prototype,"placeholder",void 0),e([s({type:String})],x.prototype,"panel",void 0),e([n()],x.prototype,"editorTheme",void 0),e([n()],x.prototype,"editorView",void 0),x=e([i("typo3-t3editor-codemirror")],x)
export{x as CodeMirrorElement}
