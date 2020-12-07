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
<<<<<<< HEAD
var __decorate=this&&this.__decorate||function(t,e,l,a){var n,o=arguments.length,i=o<3?e:null===a?a=Object.getOwnPropertyDescriptor(e,l):a;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)i=Reflect.decorate(t,e,l,a);else for(var s=t.length-1;s>=0;s--)(n=t[s])&&(i=(o<3?n(i):o>3?n(e,l,i):n(e,l))||i);return o>3&&i&&Object.defineProperty(e,l,i),i};define(["require","exports","lit","lit/decorators","TYPO3/CMS/Core/lit-helper","TYPO3/CMS/Backend/Severity","TYPO3/CMS/Backend/Modal","TYPO3/CMS/Backend/Enum/Severity","TYPO3/CMS/Backend/Element/IconElement"],(function(t,e,l,a,n,o,i,s){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.TableWizardElement=void 0;let r=class extends l.LitElement{constructor(){super(),this.type="textarea",this.selectorData="",this.appendRows=1,this.l10n={},this.table=[],this.selectorData=this.getAttribute("selector"),this.readTableFromTextarea()}get firstRow(){return this.table[0]||[]}createRenderRoot(){return this}render(){return this.renderTemplate()}provideMinimalTable(){0!==this.table.length&&0!==this.firstRow.length||(this.table=[[""]])}readTableFromTextarea(){let t=document.querySelector(this.selectorData),e=[];t.value.split("\n").forEach(t=>{if(""!==t){let l=t.split("|");e.push(l)}}),this.table=e}writeTableSyntaxToTextarea(){let t=document.querySelector(this.selectorData),e="";this.table.forEach(t=>{e+=t.join("|")+"\n"}),t.value=e}modifyTable(t,e,l){const a=t.target;this.table[e][l]=a.value,this.writeTableSyntaxToTextarea(),this.requestUpdate()}toggleType(t){this.type="input"===this.type?"textarea":"input"}moveColumn(t,e,l){this.table=this.table.map(t=>{const a=t.splice(e,1);return t.splice(l,0,...a),t}),this.writeTableSyntaxToTextarea(),this.requestUpdate()}appendColumn(t,e){this.table=this.table.map(t=>(t.splice(e+1,0,""),t)),this.writeTableSyntaxToTextarea(),this.requestUpdate()}removeColumn(t,e){this.table=this.table.map(t=>(t.splice(e,1),t)),this.writeTableSyntaxToTextarea(),this.requestUpdate()}moveRow(t,e,l){const a=this.table.splice(e,1);this.table.splice(l,0,...a),this.writeTableSyntaxToTextarea(),this.requestUpdate()}appendRow(t,e){let l=this.firstRow.concat().fill(""),a=new Array(this.appendRows).fill(l);this.table.splice(e+1,0,...a),this.writeTableSyntaxToTextarea(),this.requestUpdate()}removeRow(t,e){this.table.splice(e,1),this.writeTableSyntaxToTextarea(),this.requestUpdate()}renderTemplate(){this.provideMinimalTable();const t=Object.keys(this.firstRow).map(t=>parseInt(t,10)),e=t[t.length-1],a=this.table.length-1;return l.html`
=======
define(["lit","lit/decorators","TYPO3/CMS/Core/lit-helper","TYPO3/CMS/Backend/Element/IconElement"],(function(t,e,l){"use strict";var a=this&&this.__decorate||function(t,e,l,a){var n,s=arguments.length,o=s<3?e:null===a?a=Object.getOwnPropertyDescriptor(e,l):a;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(t,e,l,a);else for(var i=t.length-1;i>=0;i--)(n=t[i])&&(o=(s<3?n(o):s>3?n(e,l,o):n(e,l))||o);return s>3&&o&&Object.defineProperty(e,l,o),o};let n=class extends t.LitElement{constructor(){super(...arguments),this.type="textarea",this.table=[],this.appendRows=1,this.l10n={}}get firstRow(){return this.table[0]||[]}createRenderRoot(){return this}render(){return this.renderTemplate()}provideMinimalTable(){0!==this.table.length&&0!==this.firstRow.length||(this.table=[[""]])}modifyTable(t,e,l){const a=t.target;this.table[e][l]=a.value,this.requestUpdate()}toggleType(t){this.type="input"===this.type?"textarea":"input"}moveColumn(t,e,l){this.table=this.table.map(t=>{const a=t.splice(e,1);return t.splice(l,0,...a),t}),this.requestUpdate()}appendColumn(t,e){this.table=this.table.map(t=>(t.splice(e+1,0,""),t)),this.requestUpdate()}removeColumn(t,e){this.table=this.table.map(t=>(t.splice(e,1),t)),this.requestUpdate()}moveRow(t,e,l){const a=this.table.splice(e,1);this.table.splice(l,0,...a),this.requestUpdate()}appendRow(t,e){let l=this.firstRow.concat().fill(""),a=new Array(this.appendRows).fill(l);this.table.splice(e+1,0,...a),this.requestUpdate()}removeRow(t,e){this.table.splice(e,1),this.requestUpdate()}renderTemplate(){const e=Object.keys(this.firstRow).map(t=>parseInt(t,10)),l=e[e.length-1],a=this.table.length-1;return t.html`
>>>>>>> 8b6510d860 ([POC][WIP][TASK] TypeScript: Do only use ES6 exports, no pseudo imports)
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
<<<<<<< HEAD
    `}renderDataElement(t,e,a){const n=t=>this.modifyTable(t,e,a);switch(this.type){case"input":return l.html`
          <input class="form-control" type="text" name="TABLE[c][${e}][${a}]"
            @change="${n}" .value="${t.replace(/\n/g,"<br>")}">
        `;case"textarea":default:return l.html`
          <textarea class="form-control" rows="6" name="TABLE[c][${e}][${a}]"
            @change="${n}" .value="${t.replace(/<br[ ]*\/?>/g,"\n")}"></textarea>
        `}}renderTypeButton(){return l.html`
      <span class="btn-group">
        <button class="btn btn-default" type="button" title="${n.lll("table_smallFields")}"
                @click="${t=>this.toggleType(t)}">
=======
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
>>>>>>> 8b6510d860 ([POC][WIP][TASK] TypeScript: Do only use ES6 exports, no pseudo imports)
          <typo3-backend-icon identifier="${"input"===this.type?"actions-chevron-expand":"actions-chevron-contract"}" size="small"></typo3-backend-icon>
        </button>
        <button class="btn btn-default" type="button" title="${n.lll("table_setCount")}"
                @click="${t=>this.showTableConfigurationModal(t)}">
          <typo3-backend-icon identifier="actions-add" size="small"></typo3-backend-icon>
        </button>
        <button class="btn btn-default" type="button" title="${n.lll("table_showCode")}"
                @click="${t=>this.showTableSyntax(t)}">
          <typo3-backend-icon identifier="actions-code" size="small"></typo3-backend-icon>
        </button>
      </span>
<<<<<<< HEAD
    `}renderColButtons(t,e){const a={title:0===t?n.lll("table_end"):n.lll("table_left"),class:0===t?"bar-right":"left",target:0===t?e:t-1},o={title:t===e?n.lll("table_start"):n.lll("table_right"),class:t===e?"bar-left":"right",target:t===e?0:t+1};return l.html`
      <span class="btn-group">
        <button class="btn btn-default" type="button" title="${a.title}"
                @click="${e=>this.moveColumn(e,t,a.target)}">
          <typo3-backend-icon identifier="actions-chevron-${a.class}" size="small"></typo3-backend-icon>
        </button>
        <button class="btn btn-default" type="button" title="${o.title}"
                @click="${e=>this.moveColumn(e,t,o.target)}">
          <typo3-backend-icon identifier="actions-chevron-${o.class}" size="small"></typo3-backend-icon>
        </button>
        <button class="btn btn-default" type="button" title="${n.lll("table_removeColumn")}"
                @click="${e=>this.removeColumn(e,t)}">
          <typo3-backend-icon identifier="actions-delete" size="small"></typo3-backend-icon>
        </button>
        <button class="btn btn-default" type="button" title="${n.lll("table_addColumn")}"
                @click="${e=>this.appendColumn(e,t)}">
          <typo3-backend-icon identifier="actions-add" size="small"></typo3-backend-icon>
        </button>
      </span>
    `}renderRowButtons(t,e){const a={title:0===t?n.lll("table_bottom"):n.lll("table_up"),class:0===t?"bar-down":"up",target:0===t?e:t-1},o={title:t===e?n.lll("table_top"):n.lll("table_down"),class:t===e?"bar-up":"down",target:t===e?0:t+1};return l.html`
      <span class="btn-group${"input"===this.type?"":"-vertical"}">
        <button class="btn btn-default" type="button" title="${a.title}"
                @click="${e=>this.moveRow(e,t,a.target)}">
          <typo3-backend-icon identifier="actions-chevron-${a.class}" size="small"></typo3-backend-icon>
        </button>
        <button class="btn btn-default" type="button" title="${o.title}"
                @click="${e=>this.moveRow(e,t,o.target)}">
          <typo3-backend-icon identifier="actions-chevron-${o.class}" size="small"></typo3-backend-icon>
        </button>
        <button class="btn btn-default" type="button" title="${n.lll("table_removeRow")}"
                @click="${e=>this.removeRow(e,t)}">
          <typo3-backend-icon identifier="actions-delete" size="small"></typo3-backend-icon>
        </button>
        <button class="btn btn-default" type="button" title="${n.lll("table_addRow")}"
                @click="${e=>this.appendRow(e,t)}">
          <typo3-backend-icon identifier="actions-add" size="small"></typo3-backend-icon>
        </button>
      </span>
    `}showTableConfigurationModal(t){const e=this.firstRow.length,a=this.table.length,r=a||1,c=e||1;i.advanced({content:"",title:n.lll("table_setCountHeadline"),severity:s.SeverityEnum.notice,size:i.sizes.small,buttons:[{text:n.lll("button.close")||"Close",active:!0,btnClass:"btn-default",name:"cancel",trigger:()=>i.dismiss()},{text:n.lll("table_buttonApply")||"Apply",btnClass:"btn-"+o.getCssClass(s.SeverityEnum.info),name:"apply",trigger:()=>{const l=i.currentModal[0].querySelector("#t3js-expand-rows"),n=i.currentModal[0].querySelector("#t3js-expand-cols");if(null!==l&&null!==n)if(l.checkValidity()&&n.checkValidity()){const o=Number(l.value)-a,s=Number(n.value)-e;this.setColAndRowCount(t,s,o),i.dismiss()}else l.reportValidity(),n.reportValidity()}}],callback:t=>{l.render(l.html`
            <div class="form-group ">
              <label>${n.lll("table_rowCount")}</label>
              <input id="t3js-expand-rows" class="form-control" type="number" min="1" required value="${r}">
            </div>
            <div class="form-group ">
              <label>${n.lll("table_colCount")}</label>
              <input id="t3js-expand-cols" class="form-control" type="number" min="1" required value="${c}">
            </div>
          `,t[0].querySelector(".t3js-modal-body"))}})}showTableSyntax(t){i.advanced({content:"",title:n.lll("table_showCode"),severity:s.SeverityEnum.notice,size:i.sizes.small,buttons:[{text:n.lll("button.close")||"Close",active:!0,btnClass:"btn-default",name:"cancel",trigger:()=>i.dismiss()},{text:n.lll("table_buttonApply")||"Apply",btnClass:"btn-"+o.getCssClass(s.SeverityEnum.info),name:"apply",trigger:()=>{document.querySelector(this.selectorData).value=i.currentModal[0].querySelector("textarea").value,this.readTableFromTextarea(),this.requestUpdate(),i.dismiss()}}],callback:t=>{let e=document.querySelector(this.selectorData);l.render(l.html`<textarea style="width: 100%;">${e.value}</textarea>`,t[0].querySelector(".t3js-modal-body"))}})}setColAndRowCount(t,e,l){const a=this.table.length;if(l>0)for(let e=0;e<l;e++)this.appendRow(t,a);else for(let e=0;e<Math.abs(l);e++)this.removeRow(t,this.table.length-1);if(e>0)for(let l=0;l<e;l++)this.appendColumn(t,e);else for(let l=0;l<Math.abs(e);l++)this.removeColumn(t,this.firstRow.length-1)}};__decorate([a.property({type:String})],r.prototype,"type",void 0),__decorate([a.property({type:String})],r.prototype,"selectorData",void 0),__decorate([a.property({type:Number,attribute:"append-rows"})],r.prototype,"appendRows",void 0),__decorate([a.property({type:Object})],r.prototype,"l10n",void 0),r=__decorate([a.customElement("typo3-backend-table-wizard")],r),e.TableWizardElement=r}));
=======
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
>>>>>>> 8b6510d860 ([POC][WIP][TASK] TypeScript: Do only use ES6 exports, no pseudo imports)
