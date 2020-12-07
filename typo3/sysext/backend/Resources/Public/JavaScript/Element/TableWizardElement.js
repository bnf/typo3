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
define(["lit","lit/decorators","TYPO3/CMS/Core/lit-helper","TYPO3/CMS/Backend/Element/IconElement"],(function(t,e,l){"use strict";var a=this&&this.__decorate||function(t,e,l,a){var n,s=arguments.length,o=s<3?e:null===a?a=Object.getOwnPropertyDescriptor(e,l):a;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(t,e,l,a);else for(var i=t.length-1;i>=0;i--)(n=t[i])&&(o=(s<3?n(o):s>3?n(e,l,o):n(e,l))||o);return s>3&&o&&Object.defineProperty(e,l,o),o};let n=class extends t.LitElement{constructor(){super(...arguments),this.type="textarea",this.table=[],this.appendRows=1,this.l10n={}}get firstRow(){return this.table[0]||[]}createRenderRoot(){return this}render(){return this.renderTemplate()}provideMinimalTable(){0!==this.table.length&&0!==this.firstRow.length||(this.table=[[""]])}modifyTable(t,e,l){const a=t.target;this.table[e][l]=a.value,this.requestUpdate()}toggleType(t){this.type="input"===this.type?"textarea":"input"}moveColumn(t,e,l){this.table=this.table.map(t=>{const a=t.splice(e,1);return t.splice(l,0,...a),t}),this.requestUpdate()}appendColumn(t,e){this.table=this.table.map(t=>(t.splice(e+1,0,""),t)),this.requestUpdate()}removeColumn(t,e){this.table=this.table.map(t=>(t.splice(e,1),t)),this.requestUpdate()}moveRow(t,e,l){const a=this.table.splice(e,1);this.table.splice(l,0,...a),this.requestUpdate()}appendRow(t,e){let l=this.firstRow.concat().fill(""),a=new Array(this.appendRows).fill(l);this.table.splice(e+1,0,...a),this.requestUpdate()}removeRow(t,e){this.table.splice(e,1),this.requestUpdate()}renderTemplate(){const e=Object.keys(this.firstRow).map(t=>parseInt(t,10)),l=e[e.length-1],a=this.table.length-1;return t.html`
      <style>
        :host, typo3-backend-table-wizard { display: inline-block; }
      </style>
      <div class="table-fit table-fit-inline-block">
        <table class="table table-center">
          <thead>
            <th>${this.renderTypeButton()}</th>
            ${e.map(e=>t.html`
            <th>${this.renderColButtons(e,l)}</th>
            `)}
          </thead>
          <tbody>
            ${this.table.map((e,l)=>t.html`
            <tr>
              <th>${this.renderRowButtons(l,a)}</th>
              ${e.map((e,a)=>t.html`
              <td>${this.renderDataElement(e,l,a)}</td>
              `)}
            </tr>
            `)}
          </tbody>
        </table>
      </div>
    `}renderDataElement(e,l,a){const n=t=>this.modifyTable(t,l,a);switch(this.type){case"input":return t.html`
          <input class="form-control" type="text" name="TABLE[c][${l}][${a}]"
            @change="${n}" .value="${e.replace(/\n/g,"<br>")}">
        `;case"textarea":default:return t.html`
          <textarea class="form-control" rows="6" name="TABLE[c][${l}][${a}]"
            @change="${n}" .value="${e.replace(/<br[ ]*\/?>/g,"\n")}"></textarea>
        `}}renderTypeButton(){return t.html`
      <span class="btn-group">
        <button class="btn btn-default" type="button" title="${l.lll("table_smallFields")}"
          @click="${t=>this.toggleType(t)}">
          <typo3-backend-icon identifier="${"input"===this.type?"actions-chevron-expand":"actions-chevron-contract"}" size="small"></typo3-backend-icon>
        </button>
      </span>
    `}renderColButtons(e,a){const n={title:0===e?l.lll("table_end"):l.lll("table_left"),class:0===e?"double-right":"left",target:0===e?a:e-1},s={title:e===a?l.lll("table_start"):l.lll("table_right"),class:e===a?"double-left":"right",target:e===a?0:e+1};return t.html`
      <span class="btn-group">
        <button class="btn btn-default" type="button" title="${n.title}"
                @click="${t=>this.moveColumn(t,e,n.target)}">
          <span class="t3-icon fa fa-fw fa-angle-${n.class}"></span>
        </button>
        <button class="btn btn-default" type="button" title="${s.title}"
                @click="${t=>this.moveColumn(t,e,s.target)}">
          <span class="t3-icon fa fa-fw fa-angle-${s.class}"></span>
        </button>
        <button class="btn btn-default" type="button" title="${l.lll("table_removeColumn")}"
                @click="${t=>this.removeColumn(t,e)}">
          <span class="t3-icon fa fa-fw fa-trash"></span>
        </button>
        <button class="btn btn-default" type="button" title="${l.lll("table_addColumn")}"
                @click="${t=>this.appendColumn(t,e)}">
          <span class="t3-icon fa fa-fw fa-plus"></span>
        </button>
      </span>
    `}renderRowButtons(e,a){const n={title:0===e?l.lll("table_bottom"):l.lll("table_up"),class:0===e?"double-down":"up",target:0===e?a:e-1},s={title:e===a?l.lll("table_top"):l.lll("table_down"),class:e===a?"double-up":"down",target:e===a?0:e+1};return t.html`
      <span class="btn-group${"input"===this.type?"":"-vertical"}">
        <button class="btn btn-default" type="button" title="${n.title}"
                @click="${t=>this.moveRow(t,e,n.target)}">
          <span class="t3-icon fa fa-fw fa-angle-${n.class}"></span>
        </button>
        <button class="btn btn-default" type="button" title="${s.title}"
                @click="${t=>this.moveRow(t,e,s.target)}">
          <span class="t3-icon fa fa-fw fa-angle-${s.class}"></span>
        </button>
        <button class="btn btn-default" type="button" title="${l.lll("table_removeRow")}"
                @click="${t=>this.removeRow(t,e)}">
          <span class="t3-icon fa fa-fw fa-trash"></span>
        </button>
        <button class="btn btn-default" type="button" title="${l.lll("table_addRow")}"
                @click="${t=>this.appendRow(t,e)}">
          <span class="t3-icon fa fa-fw fa-plus"></span>
        </button>
      </span>
    `}};return a([e.property({type:String})],n.prototype,"type",void 0),a([e.property({type:Array})],n.prototype,"table",void 0),a([e.property({type:Number,attribute:"append-rows"})],n.prototype,"appendRows",void 0),a([e.property({type:Object})],n.prototype,"l10n",void 0),n=a([e.customElement("typo3-backend-table-wizard")],n),{TableWizardElement:n}}));