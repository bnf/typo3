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
var __decorate=this&&this.__decorate||function(t,e,a,l){var s,n=arguments.length,o=n<3?e:null===l?l=Object.getOwnPropertyDescriptor(e,a):l;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(t,e,a,l);else for(var i=t.length-1;i>=0;i--)(s=t[i])&&(o=(n<3?s(o):n>3?s(e,a,o):s(e,a))||o);return n>3&&o&&Object.defineProperty(e,a,o),o};define(["require","exports","lit-element","lit-html/directives/unsafe-html","lit-html/directives/until","TYPO3/CMS/Backend/Icons"],(function(t,e,a,l,s,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.TableWizardElement=void 0;const o=t=>TYPO3.lang[t];let i=class extends a.LitElement{constructor(){super(...arguments),this.type="textarea",this.table=[],this.appendRows=1,this.l10n={}}get firstRow(){return this.table[0]||[]}createRenderRoot(){return this}render(){return this.renderTemplate()}provideMinimalTable(){0!==this.table.length&&0!==this.firstRow.length||(this.table=[[""]])}modifyTable(t,e,a){const l=t.target;this.table[e][a]=l.value,this.requestUpdate()}toggleType(t){this.type="input"===this.type?"textarea":"input"}moveColumn(t,e,a){this.table=this.table.map(t=>{const l=t.splice(e,1);return t.splice(a,0,...l),t}),this.requestUpdate()}appendColumn(t,e){this.table=this.table.map(t=>(t.splice(e+1,0,""),t)),this.requestUpdate()}removeColumn(t,e){this.table=this.table.map(t=>(t.splice(e,1),t)),this.requestUpdate()}moveRow(t,e,a){const l=this.table.splice(e,1);this.table.splice(a,0,...l),this.requestUpdate()}appendRow(t,e){let a=this.firstRow.concat().fill(""),l=new Array(this.appendRows).fill(a);this.table.splice(e+1,0,...l),this.requestUpdate()}removeRow(t,e){this.table.splice(e,1),this.requestUpdate()}renderTemplate(){const t=Object.keys(this.firstRow).map(t=>parseInt(t,10)),e=t[t.length-1],l=this.table.length-1;return a.html`
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
              <th>${this.renderRowButtons(e,l)}</th>
              ${t.map((t,l)=>a.html`
              <td>${this.renderDataElement(t,e,l)}</td>
              `)}
            </tr>
            `)}
          </tbody>
        </table>
      </div>
    `}renderDataElement(t,e,l){const s=t=>this.modifyTable(t,e,l);switch(this.type){case"input":return a.html`
          <input class="form-control" type="text" name="TABLE[c][${e}][${l}]"
            @change="${s}" .value="${t.replace(/\n/g,"<br>")}">
        `;case"textarea":default:return a.html`
          <textarea class="form-control" rows="6" name="TABLE[c][${e}][${l}]"
            @change="${s}" .value="${t.replace(/<br[ ]*\/?>/g,"\n")}"></textarea>
        `}}renderTypeButton(){return a.html`
      <span class="btn-group">
        <button class="btn btn-default" type="button" title="${o("table_smallFields")}"
          @click="${t=>this.toggleType(t)}">
          ${s.until((t="input"===this.type?"actions-chevron-expand":"actions-chevron-contract",n.getIcon(t,n.sizes.small).then(t=>a.html`${l.unsafeHTML(t)}`)))}
        </button>
      </span>
    `;var t}renderColButtons(t,e){const l={title:o(0===t?"table_end":"table_left"),class:0===t?"double-right":"left",target:0===t?e:t-1},s={title:o(t===e?"table_start":"table_right"),class:t===e?"double-left":"right",target:t===e?0:t+1};return a.html`
      <span class="btn-group">
        <button class="btn btn-default" type="button" title="${l.title}"
                @click="${e=>this.moveColumn(e,t,l.target)}">
          <span class="t3-icon fa fa-fw fa-angle-${l.class}"></span>
        </button>
        <button class="btn btn-default" type="button" title="${s.title}"
                @click="${e=>this.moveColumn(e,t,s.target)}">
          <span class="t3-icon fa fa-fw fa-angle-${s.class}"></span>
        </button>
        <button class="btn btn-default" type="button" title="${o("table_removeColumn")}"
                @click="${e=>this.removeColumn(e,t)}">
          <span class="t3-icon fa fa-fw fa-trash"></span>
        </button>
        <button class="btn btn-default" type="button" title="${o("table_addColumn")}"
                @click="${e=>this.appendColumn(e,t)}">
          <span class="t3-icon fa fa-fw fa-plus"></span>
        </button>
      </span>
    `}renderRowButtons(t,e){const l={title:o(0===t?"table_bottom":"table_up"),class:0===t?"double-down":"up",target:0===t?e:t-1},s={title:o(t===e?"table_top":"table_down"),class:t===e?"double-up":"down",target:t===e?0:t+1};return a.html`
      <span class="btn-group${"input"===this.type?"":"-vertical"}">
        <button class="btn btn-default" type="button" title="${l.title}"
                @click="${e=>this.moveRow(e,t,l.target)}">
          <span class="t3-icon fa fa-fw fa-angle-${l.class}"></span>
        </button>
        <button class="btn btn-default" type="button" title="${s.title}"
                @click="${e=>this.moveRow(e,t,s.target)}">
          <span class="t3-icon fa fa-fw fa-angle-${s.class}"></span>
        </button>
        <button class="btn btn-default" type="button" title="${o("table_removeRow")}"
                @click="${e=>this.removeRow(e,t)}">
          <span class="t3-icon fa fa-fw fa-trash"></span>
        </button>
        <button class="btn btn-default" type="button" title="${o("table_addRow")}"
                @click="${e=>this.appendRow(e,t)}">
          <span class="t3-icon fa fa-fw fa-plus"></span>
        </button>
      </span>
    `}};__decorate([a.property({type:String})],i.prototype,"type",void 0),__decorate([a.property({type:Array})],i.prototype,"table",void 0),__decorate([a.property({type:Number,attribute:"append-rows"})],i.prototype,"appendRows",void 0),__decorate([a.property({type:Object})],i.prototype,"l10n",void 0),i=__decorate([a.customElement("typo3-backend-table-wizard")],i),e.TableWizardElement=i}));