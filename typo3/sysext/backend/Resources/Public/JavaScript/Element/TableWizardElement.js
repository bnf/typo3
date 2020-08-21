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
define(["lit-element","TYPO3/CMS/Core/lit-helper"],(function(t,e){"use strict";var l=this&&this.__decorate||function(t,e,l,a){var s,n=arguments.length,o=n<3?e:null===a?a=Object.getOwnPropertyDescriptor(e,l):a;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(t,e,l,a);else for(var i=t.length-1;i>=0;i--)(s=t[i])&&(o=(n<3?s(o):n>3?s(e,l,o):s(e,l))||o);return n>3&&o&&Object.defineProperty(e,l,o),o};let a=class extends t.LitElement{constructor(){super(...arguments),this.type="textarea",this.table=[],this.appendRows=1,this.l10n={}}get firstRow(){return this.table[0]||[]}createRenderRoot(){return this}render(){return this.renderTemplate()}provideMinimalTable(){0!==this.table.length&&0!==this.firstRow.length||(this.table=[[""]])}modifyTable(t,e,l){const a=t.target;this.table[e][l]=a.value,this.requestUpdate()}toggleType(t){this.type="input"===this.type?"textarea":"input"}moveColumn(t,e,l){this.table=this.table.map(t=>{const a=t.splice(e,1);return t.splice(l,0,...a),t}),this.requestUpdate()}appendColumn(t,e){this.table=this.table.map(t=>(t.splice(e+1,0,""),t)),this.requestUpdate()}removeColumn(t,e){this.table=this.table.map(t=>(t.splice(e,1),t)),this.requestUpdate()}moveRow(t,e,l){const a=this.table.splice(e,1);this.table.splice(l,0,...a),this.requestUpdate()}appendRow(t,e){let l=this.firstRow.concat().fill(""),a=new Array(this.appendRows).fill(l);this.table.splice(e+1,0,...a),this.requestUpdate()}removeRow(t,e){this.table.splice(e,1),this.requestUpdate()}renderTemplate(){const e=Object.keys(this.firstRow).map(t=>parseInt(t,10)),l=e[e.length-1],a=this.table.length-1;return t.html`
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
    `}renderDataElement(e,l,a){const s=t=>this.modifyTable(t,l,a);switch(this.type){case"input":return t.html`
          <input class="form-control" type="text" name="TABLE[c][${l}][${a}]"
            @change="${s}" .value="${e.replace(/\n/g,"<br>")}">
        `;case"textarea":default:return t.html`
          <textarea class="form-control" rows="6" name="TABLE[c][${l}][${a}]"
            @change="${s}" .value="${e.replace(/<br[ ]*\/?>/g,"\n")}"></textarea>
        `}}renderTypeButton(){return t.html`
      <span class="btn-group">
        <button class="btn btn-default" type="button" title="${e.lll("table_smallFields")}"
          @click="${t=>this.toggleType(t)}">
          ${e.icon("input"===this.type?"actions-chevron-expand":"actions-chevron-contract")}
        </button>
      </span>
    `}renderColButtons(l,a){const s={title:0===l?e.lll("table_end"):e.lll("table_left"),class:0===l?"double-right":"left",target:0===l?a:l-1},n={title:l===a?e.lll("table_start"):e.lll("table_right"),class:l===a?"double-left":"right",target:l===a?0:l+1};return t.html`
      <span class="btn-group">
        <button class="btn btn-default" type="button" title="${s.title}"
                @click="${t=>this.moveColumn(t,l,s.target)}">
          <span class="t3-icon fa fa-fw fa-angle-${s.class}"></span>
        </button>
        <button class="btn btn-default" type="button" title="${n.title}"
                @click="${t=>this.moveColumn(t,l,n.target)}">
          <span class="t3-icon fa fa-fw fa-angle-${n.class}"></span>
        </button>
        <button class="btn btn-default" type="button" title="${e.lll("table_removeColumn")}"
                @click="${t=>this.removeColumn(t,l)}">
          <span class="t3-icon fa fa-fw fa-trash"></span>
        </button>
        <button class="btn btn-default" type="button" title="${e.lll("table_addColumn")}"
                @click="${t=>this.appendColumn(t,l)}">
          <span class="t3-icon fa fa-fw fa-plus"></span>
        </button>
      </span>
    `}renderRowButtons(l,a){const s={title:0===l?e.lll("table_bottom"):e.lll("table_up"),class:0===l?"double-down":"up",target:0===l?a:l-1},n={title:l===a?e.lll("table_top"):e.lll("table_down"),class:l===a?"double-up":"down",target:l===a?0:l+1};return t.html`
      <span class="btn-group${"input"===this.type?"":"-vertical"}">
        <button class="btn btn-default" type="button" title="${s.title}"
                @click="${t=>this.moveRow(t,l,s.target)}">
          <span class="t3-icon fa fa-fw fa-angle-${s.class}"></span>
        </button>
        <button class="btn btn-default" type="button" title="${n.title}"
                @click="${t=>this.moveRow(t,l,n.target)}">
          <span class="t3-icon fa fa-fw fa-angle-${n.class}"></span>
        </button>
        <button class="btn btn-default" type="button" title="${e.lll("table_removeRow")}"
                @click="${t=>this.removeRow(t,l)}">
          <span class="t3-icon fa fa-fw fa-trash"></span>
        </button>
        <button class="btn btn-default" type="button" title="${e.lll("table_addRow")}"
                @click="${t=>this.appendRow(t,l)}">
          <span class="t3-icon fa fa-fw fa-plus"></span>
        </button>
      </span>
    `}};return l([t.property({type:String})],a.prototype,"type",void 0),l([t.property({type:Array})],a.prototype,"table",void 0),l([t.property({type:Number,attribute:"append-rows"})],a.prototype,"appendRows",void 0),l([t.property({type:Object})],a.prototype,"l10n",void 0),a=l([t.customElement("typo3-backend-table-wizard")],a),{TableWizardElement:a}}));