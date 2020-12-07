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
define(["require","codemirror","lit","lit/decorators","TYPO3/CMS/Backend/Element/SpinnerElement"],(function(t,e,o,i){"use strict";var r=this&&this.__decorate||function(t,e,o,i){var r,n=arguments.length,s=n<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(t,e,o,i);else for(var l=t.length-1;l>=0;l--)(r=t[l])&&(s=(n<3?r(s):n>3?r(e,o,s):r(e,o))||s);return n>3&&s&&Object.defineProperty(e,o,s),s};let n=class extends o.LitElement{constructor(){super(...arguments),this.addons=["codemirror/addon/display/panel"],this.options={},this.scrollto=0,this.marktext=[],this.lineDigits=0,this.autoheight=!1,this.nolazyload=!1,this.panel="bottom",this.loaded=!1}render(){return o.html`
      <slot></slot>
      <slot name="codemirror"></slot>
      ${this.loaded?"":o.html`<typo3-backend-spinner size="large" variant="dark"></typo3-backend-spinner>`}
    `}firstUpdated(){if(this.nolazyload)return void this.initializeEditor(this.firstElementChild);const t={root:document.body};let e=new IntersectionObserver(t=>{t.forEach(t=>{t.intersectionRatio>0&&(e.unobserve(t.target),this.firstElementChild&&"textarea"===this.firstElementChild.nodeName.toLowerCase()&&this.initializeEditor(this.firstElementChild))})},t);e.observe(this)}createPanelNode(t,e){const o=document.createElement("div");o.setAttribute("class","CodeMirror-panel CodeMirror-panel-"+t),o.setAttribute("id","panel-"+t);const i=document.createElement("span");return i.textContent=e,o.appendChild(i),o}initializeEditor(o){const i=this.mode.split("/"),r=this.options;Promise.all([this.mode,...this.addons].map(e=>new Promise((function(o,i){t([e],(function(t){o("object"!=typeof t||"default"in t?{default:t}:Object.defineProperty(t,"default",{value:t,enumerable:!1}))}),i)})))).then(()=>{const t=e(t=>{const e=document.createElement("div");e.setAttribute("slot","codemirror"),e.appendChild(t),this.insertBefore(e,o)},{value:o.value,extraKeys:{"Ctrl-F":"findPersistent","Cmd-F":"findPersistent","Ctrl-Alt-F":t=>{t.setOption("fullScreen",!t.getOption("fullScreen"))},"Ctrl-Space":"autocomplete",Esc:t=>{t.getOption("fullScreen")&&t.setOption("fullScreen",!1)}},fullScreen:!1,lineNumbers:!0,lineWrapping:!0,mode:i[i.length-1]});Object.keys(r).map(e=>{t.setOption(e,r[e])}),t.on("change",()=>{o.value=t.getValue(),o.dispatchEvent(new CustomEvent("change",{bubbles:!0}))});const n=this.createPanelNode(this.panel,this.label);if(t.addPanel(n,{position:this.panel,stable:!1}),o.getAttribute("rows")){const e=18,i=4;t.setSize(null,parseInt(o.getAttribute("rows"),10)*e+i+n.getBoundingClientRect().height)}else t.getWrapperElement().style.height=document.body.getBoundingClientRect().height-t.getWrapperElement().getBoundingClientRect().top-80+"px",t.setOption("viewportMargin",1/0);this.autoheight&&t.setOption("viewportMargin",1/0),this.lineDigits>0&&t.setOption("lineNumberFormatter",t=>t.toString().padStart(this.lineDigits," ")),this.scrollto>0&&t.scrollIntoView({line:this.scrollto,ch:0});for(let e of this.marktext)e.from&&e.to&&t.markText(e.from,e.to,{className:"CodeMirror-markText"});this.loaded=!0})}};return n.styles=o.css`
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
  `,r([i.property()],n.prototype,"mode",void 0),r([i.property()],n.prototype,"label",void 0),r([i.property({type:Array})],n.prototype,"addons",void 0),r([i.property({type:Object})],n.prototype,"options",void 0),r([i.property({type:Number})],n.prototype,"scrollto",void 0),r([i.property({type:Object})],n.prototype,"marktext",void 0),r([i.property({type:Number})],n.prototype,"lineDigits",void 0),r([i.property({type:Boolean})],n.prototype,"autoheight",void 0),r([i.property({type:Boolean})],n.prototype,"nolazyload",void 0),r([i.property({type:String})],n.prototype,"panel",void 0),r([i.state()],n.prototype,"loaded",void 0),n=r([i.customElement("typo3-t3editor-codemirror")],n),{CodeMirrorElement:n}}));