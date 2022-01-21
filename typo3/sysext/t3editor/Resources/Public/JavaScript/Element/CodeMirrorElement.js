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
var __decorate=function(e,t,o,r){var i,n=arguments.length,d=n<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)d=Reflect.decorate(e,t,o,r);else for(var a=e.length-1;a>=0;a--)(i=e[a])&&(d=(n<3?i(d):n>3?i(t,o,d):i(t,o))||d);return n>3&&d&&Object.defineProperty(t,o,d),d};import{LitElement,html,css}from"lit";import{customElement,property,state}from"lit/decorators.js";import{EditorState,basicSetup}from"@codemirror/basic-setup";import{EditorView}from"@codemirror/view";import{javascript}from"@codemirror/lang-javascript";import{oneDark}from"@codemirror/theme-one-dark";import"TYPO3/CMS/Backend/Element/SpinnerElement.js";let CodeMirrorElement=class extends LitElement{constructor(){super(...arguments),this.addons=["codemirror/addon/display/panel"],this.options={},this.scrollto=0,this.marktext=[],this.lineDigits=0,this.autoheight=!1,this.nolazyload=!1,this.panel="bottom",this.loaded=!1}render(){return html`
      <div id="codemirror-parent"></div>
      ${this.loaded?"":html`<typo3-backend-spinner size="large" variant="dark"></typo3-backend-spinner>`}
    `}firstUpdated(){if(this.nolazyload)return void this.initializeEditor(this.firstElementChild);const e={root:document.body};let t=new IntersectionObserver(e=>{e.forEach(e=>{e.intersectionRatio>0&&(t.unobserve(e.target),this.firstElementChild&&"textarea"===this.firstElementChild.nodeName.toLowerCase()&&this.initializeEditor(this.firstElementChild))})},e);t.observe(this)}createPanelNode(e,t){const o=document.createElement("div");o.setAttribute("class","CodeMirror-panel CodeMirror-panel-"+e),o.setAttribute("id","panel-"+e);const r=document.createElement("span");return r.textContent=t,o.appendChild(r),o}initializeEditor(e){this.mode.split("/"),this.options;let t;const o=EditorView.updateListener.of(t=>{t.docChanged&&(e.value=t.state.doc.toString(),e.dispatchEvent(new CustomEvent("change",{bubbles:!0})))});t=new EditorView({state:EditorState.create({doc:e.value,extensions:[oneDark,basicSetup,o,javascript()]}),parent:this.renderRoot.querySelector("#codemirror-parent"),root:this.renderRoot}),this.loaded=!0}};CodeMirrorElement.styles=css`
   :host {
     display: block;
     position: relative;
   }
   typo3-backend-spinner {
     position: absolute;
     top: 50%;
     left: 50%;
     transform: translate(-50%, -50%);
   }
  `,__decorate([property()],CodeMirrorElement.prototype,"mode",void 0),__decorate([property()],CodeMirrorElement.prototype,"label",void 0),__decorate([property({type:Array})],CodeMirrorElement.prototype,"addons",void 0),__decorate([property({type:Object})],CodeMirrorElement.prototype,"options",void 0),__decorate([property({type:Number})],CodeMirrorElement.prototype,"scrollto",void 0),__decorate([property({type:Object})],CodeMirrorElement.prototype,"marktext",void 0),__decorate([property({type:Number})],CodeMirrorElement.prototype,"lineDigits",void 0),__decorate([property({type:Boolean})],CodeMirrorElement.prototype,"autoheight",void 0),__decorate([property({type:Boolean})],CodeMirrorElement.prototype,"nolazyload",void 0),__decorate([property({type:String})],CodeMirrorElement.prototype,"panel",void 0),__decorate([state()],CodeMirrorElement.prototype,"loaded",void 0),CodeMirrorElement=__decorate([customElement("typo3-t3editor-codemirror")],CodeMirrorElement);export{CodeMirrorElement};