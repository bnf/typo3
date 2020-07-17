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
var __importDefault=this&&this.__importDefault||function(t){return t&&t.__esModule?t:{default:t}};define(["require","exports","TYPO3/CMS/Backend/Element/Template","TYPO3/CMS/Core/SecurityUtility","TYPO3/CMS/Backend/Icons"],(function(t,e,a,n,s){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.TableWizardElement=void 0,n=__importDefault(n);const l=t=>TYPO3.lang[t];class o extends HTMLElement{constructor(){super(),this.type="textarea",this.table=[],this.appendRows=1,this.l10n={}}get firstRow(){return this.table[0]||[]}static get observedAttributes(){return["type","table","append-rows","l10n"]}createRenderRoot(){return this}attributeChangedCallback(t,e,a){switch(t){case"type":this.type=a;break;case"table":this.table=JSON.parse(a)||[];break;case"append-rows":this.appendRows=parseInt(a,10);break;case"l10n":this.l10n=JSON.parse(a)||{}}}connectedCallback(){this.render()}render(){this.renderTemplate().mountTo(this.createRenderRoot(),!0)}provideMinimalTable(){0!==this.table.length&&0!==this.firstRow.length||(this.table=[[""]])}modifyTable(t,e,a){const n=t.target;this.table[e][a]=n.value}toggleType(t){this.type="input"===this.type?"textare":"input",this.render()}moveColumn(t,e,a){this.table=this.table.map(t=>{const n=t.splice(e,1);return t.splice(a,0,...n),t}),this.render()}appendColumn(t,e){this.table=this.table.map(t=>(t.splice(e+1,0,""),t)),this.render()}removeColumn(t,e){this.table=this.table.map(t=>(t.splice(e,1),t)),this.render()}moveRow(t,e,a){const n=this.table.splice(e,1);this.table.splice(a,0,...n),this.render()}appendRow(t,e){let a=this.firstRow.concat().fill(""),n=new Array(this.appendRows).fill(a);this.table.splice(e+1,0,...n),this.render()}removeRow(t,e){this.table.splice(e,1),this.render()}renderTemplate(){const t=Object.keys(this.firstRow).map(t=>parseInt(t,10)),e=t[t.length-1],n=this.table.length-1;return a.html`
      <style>
        :host, typo3-backend-table-wizard { display: inline-block; }
      </style>
      <div class="table-fit table-fit-inline-block">
        <table class="table table-center">
          <thead>
            <th>${this.renderTypeButton()}</th>
            ${t.map(t=>a.html`
            <th>${this.renderColButtons(t,e)}</th>
            `)}
          </thead>
          <tbody>
            ${this.table.map((t,e)=>a.html`
            <tr>
              <th>${this.renderRowButtons(e,n)}</th>
              ${t.map((t,n)=>a.html`
              <td>${this.renderDataElement(t,e,n)}</td>
              `)}
            </tr>
            `)}
          </tbody>
        </table>
      </div>
    `}renderDataElement(t,e,n){const s=t=>this.modifyTable(t,e,n);switch(this.type){case"input":return a.html`
          <input class="form-control" type="text" name="TABLE[c][${e}][${n}]"
            @change="${s}" value="${t}">
        `;case"textarea":default:let l=this.convertLineBreaks(t);return a.html`
          <textarea class="form-control" rows="6" name="TABLE[c][${e}][${n}]"
            @change="${s}">${l}</textarea>
        `}}convertLineBreaks(t){const e=String.fromCharCode(10),n=new RegExp("<br[ ]*\\/?>","g"),s=a.html`${t.replace(n,e)}`.getHtml().replace(n,e);return a.unsafe`${s}`}renderTypeButton(){return a.html`
      <span class="btn-group">
        <button class="btn btn-default" type="button" title="${l("table_smallFields")}"
          @click="${t=>this.toggleType(t)}">
          ${(t=>{const e="@promise-"+(new n.default).getRandomHexValue(20);s.getIcon(t,s.sizes.small).then(t=>{document.getElementById(e).outerHTML=t});const a=document.createElement("span");return a.id=e,a.outerHTML})("input"===this.type?"actions-chevron-expand":"actions-chevron-contract")}
        </button>
      </span>
    `}renderColButtons(t,e){const n={title:l(0===t?"table_end":"table_left"),class:0===t?"double-right":"left",target:0===t?e:t-1},s={title:l(t===e?"table_start":"table_right"),class:t===e?"double-left":"right",target:t===e?0:t+1};return a.html`
      <span class="btn-group">
        <button class="btn btn-default" type="button" title="${n.title}"
                @click="${e=>this.moveColumn(e,t,n.target)}">
          <span class="t3-icon fa fa-fw fa-angle-${n.class}"></span>
        </button>
        <button class="btn btn-default" type="button" title="${s.title}"
                @click="${e=>this.moveColumn(e,t,s.target)}">
          <span class="t3-icon fa fa-fw fa-angle-${s.class}"></span>
        </button>
        <button class="btn btn-default" type="button" title="${l("table_removeColumn")}"
                @click="${e=>this.removeColumn(e,t)}">
          <span class="t3-icon fa fa-fw fa-trash"></span>
        </button>
        <button class="btn btn-default" type="button" title="${l("table_addColumn")}"
                @click="${e=>this.appendColumn(e,t)}">
          <span class="t3-icon fa fa-fw fa-plus"></span>
        </button>
      </span>
    `}renderRowButtons(t,e){const n={title:l(0===t?"table_bottom":"table_up"),class:0===t?"double-down":"up",target:0===t?e:t-1},s={title:l(t===e?"table_top":"table_down"),class:t===e?"double-up":"down",target:t===e?0:t+1};return a.html`
      <span class="btn-group${"input"===this.type?"":"-vertical"}">
        <button class="btn btn-default" type="button" title="${n.title}"
                @click="${e=>this.moveRow(e,t,n.target)}">
          <span class="t3-icon fa fa-fw fa-angle-${n.class}"></span>
        </button>
        <button class="btn btn-default" type="button" title="${s.title}"
                @click="${e=>this.moveRow(e,t,s.target)}">
          <span class="t3-icon fa fa-fw fa-angle-${s.class}"></span>
        </button>
        <button class="btn btn-default" type="button" title="${l("table_removeRow")}"
                @click="${e=>this.removeRow(e,t)}">
          <span class="t3-icon fa fa-fw fa-trash"></span>
        </button>
        <button class="btn btn-default" type="button" title="${l("table_addRow")}"
                @click="${e=>this.appendRow(e,t)}">
          <span class="t3-icon fa fa-fw fa-plus"></span>
        </button>
      </span>
    `}}e.TableWizardElement=o,window.customElements.define("typo3-backend-table-wizard",o)}));