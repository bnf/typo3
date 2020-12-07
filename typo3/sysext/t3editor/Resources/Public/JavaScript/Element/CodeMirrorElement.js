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
define(["require","codemirror","lit-element","TYPO3/CMS/Backend/FormEngine","TYPO3/CMS/Backend/Element/SpinnerElement"],(function(e,t,o,n){"use strict";var r=this&&this.__decorate||function(e,t,o,n){var r,i=arguments.length,s=i<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,o):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,o,n);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(s=(i<3?r(s):i>3?r(t,o,s):r(t,o))||s);return i>3&&s&&Object.defineProperty(t,o,s),s};let i=class extends o.LitElement{constructor(){super(...arguments),this.addons=[],this.options={},this.loaded=!1}static get styles(){return o.css`
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
    `}render(){return o.html`
      <slot></slot>
      <slot name="codemirror"></slot>
      ${this.loaded?"":o.html`<typo3-backend-spinner size="large"></typo3-backend-spinner>`}
    `}firstUpdated(){const e={root:document.body};let t=new IntersectionObserver(e=>{e.forEach(e=>{e.intersectionRatio>0&&(t.unobserve(e.target),this.firstElementChild&&"textarea"===this.firstElementChild.nodeName.toLowerCase()&&this.initializeEditor(this.firstElementChild))})},e);t.observe(this)}createPanelNode(e,t){const o=document.createElement("div");o.setAttribute("class","CodeMirror-panel CodeMirror-panel-"+e),o.setAttribute("id","panel-"+e);const n=document.createElement("span");return n.textContent=t,o.appendChild(n),o}initializeEditor(o){const r=this.mode.split("/"),i=this.options;Promise.all([this.mode,...this.addons].map(t=>new Promise((function(o,n){e([t],(function(e){o("object"!=typeof e||"default"in e?{default:e}:Object.defineProperty(e,"default",{value:e,enumerable:!1}))}),n)})))).then(()=>{const e=t(e=>{const t=document.createElement("div");t.setAttribute("slot","codemirror"),t.appendChild(e),this.insertBefore(t,o)},{value:o.value,extraKeys:{"Ctrl-F":"findPersistent","Cmd-F":"findPersistent","Ctrl-Alt-F":e=>{e.setOption("fullScreen",!e.getOption("fullScreen"))},"Ctrl-Space":"autocomplete",Esc:e=>{e.getOption("fullScreen")&&e.setOption("fullScreen",!1)}},fullScreen:!1,lineNumbers:!0,lineWrapping:!0,mode:r[r.length-1]});Object.keys(i).map(t=>{e.setOption(t,i[t])}),e.on("change",()=>{o.value=e.getValue(),n.Validation.markFieldAsChanged(o)});const s=this.createPanelNode("bottom",this.label);if(e.addPanel(s,{position:"bottom",stable:!1}),o.getAttribute("rows")){const t=18,n=4;e.setSize(null,parseInt(o.getAttribute("rows"),10)*t+n+s.getBoundingClientRect().height)}else e.getWrapperElement().style.height=document.body.getBoundingClientRect().height-e.getWrapperElement().getBoundingClientRect().top-80+"px",e.setOption("viewportMargin",1/0);this.loaded=!0})}};return r([o.property()],i.prototype,"mode",void 0),r([o.property()],i.prototype,"label",void 0),r([o.property({type:Array})],i.prototype,"addons",void 0),r([o.property({type:Object})],i.prototype,"options",void 0),r([o.internalProperty()],i.prototype,"loaded",void 0),i=r([o.customElement("typo3-t3editor-codemirror")],i),{CodeMirrorElement:i}}));