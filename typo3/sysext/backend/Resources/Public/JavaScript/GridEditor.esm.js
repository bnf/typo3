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
import{SeverityEnum}from"TYPO3/CMS/Backend/Enum/Severity";import"bootstrap";import $ from"jquery";import Modal from"TYPO3/CMS/Backend/Modal";import SecurityUtility from"TYPO3/CMS/Core/SecurityUtility";export class GridEditor{constructor(t=null){this.colCount=1,this.rowCount=1,this.readOnly=!1,this.nameLabel="name",this.columnLabel="column label",this.defaultCell={spanned:0,rowspan:1,colspan:1,name:"",colpos:"",column:void 0},this.selectorEditor=".t3js-grideditor",this.selectorAddColumn=".t3js-grideditor-addcolumn",this.selectorRemoveColumn=".t3js-grideditor-removecolumn",this.selectorAddRowTop=".t3js-grideditor-addrow-top",this.selectorRemoveRowTop=".t3js-grideditor-removerow-top",this.selectorAddRowBottom=".t3js-grideditor-addrow-bottom",this.selectorRemoveRowBottom=".t3js-grideditor-removerow-bottom",this.selectorLinkEditor=".t3js-grideditor-link-editor",this.selectorLinkExpandRight=".t3js-grideditor-link-expand-right",this.selectorLinkShrinkLeft=".t3js-grideditor-link-shrink-left",this.selectorLinkExpandDown=".t3js-grideditor-link-expand-down",this.selectorLinkShrinkUp=".t3js-grideditor-link-shrink-up",this.selectorConfigPreview=".t3js-grideditor-preview-config",this.selectorPreviewArea=".t3js-tsconfig-preview-area",this.selectorCodeMirror=".t3js-grideditor-preview-config .CodeMirror",this.modalButtonClickHandler=t=>{const e=t.target;"cancel"===e.name?Modal.currentModal.trigger("modal-dismiss"):"ok"===e.name&&(this.setName(Modal.currentModal.find(".t3js-grideditor-field-name").val(),Modal.currentModal.data("col"),Modal.currentModal.data("row")),this.setColumn(Modal.currentModal.find(".t3js-grideditor-field-colpos").val(),Modal.currentModal.data("col"),Modal.currentModal.data("row")),this.drawTable(),this.writeConfig(this.export2LayoutRecord()),Modal.currentModal.trigger("modal-dismiss"))},this.addColumnHandler=t=>{t.preventDefault(),this.addColumn(),this.drawTable(),this.writeConfig(this.export2LayoutRecord())},this.removeColumnHandler=t=>{t.preventDefault(),this.removeColumn(),this.drawTable(),this.writeConfig(this.export2LayoutRecord())},this.addRowTopHandler=t=>{t.preventDefault(),this.addRowTop(),this.drawTable(),this.writeConfig(this.export2LayoutRecord())},this.addRowBottomHandler=t=>{t.preventDefault(),this.addRowBottom(),this.drawTable(),this.writeConfig(this.export2LayoutRecord())},this.removeRowTopHandler=t=>{t.preventDefault(),this.removeRowTop(),this.drawTable(),this.writeConfig(this.export2LayoutRecord())},this.removeRowBottomHandler=t=>{t.preventDefault(),this.removeRowBottom(),this.drawTable(),this.writeConfig(this.export2LayoutRecord())},this.linkEditorHandler=t=>{t.preventDefault();const e=$(t.target);this.showOptions(e.data("col"),e.data("row"))},this.linkExpandRightHandler=t=>{t.preventDefault();const e=$(t.target);this.addColspan(e.data("col"),e.data("row")),this.drawTable(),this.writeConfig(this.export2LayoutRecord())},this.linkShrinkLeftHandler=t=>{t.preventDefault();const e=$(t.target);this.removeColspan(e.data("col"),e.data("row")),this.drawTable(),this.writeConfig(this.export2LayoutRecord())},this.linkExpandDownHandler=t=>{t.preventDefault();const e=$(t.target);this.addRowspan(e.data("col"),e.data("row")),this.drawTable(),this.writeConfig(this.export2LayoutRecord())},this.linkShrinkUpHandler=t=>{t.preventDefault();const e=$(t.target);this.removeRowspan(e.data("col"),e.data("row")),this.drawTable(),this.writeConfig(this.export2LayoutRecord())};const e=$(this.selectorEditor);this.colCount=e.data("colcount"),this.rowCount=e.data("rowcount"),this.readOnly=e.data("readonly"),this.field=$('input[name="'+e.data("field")+'"]'),this.data=e.data("data"),this.nameLabel=null!==t?t.nameLabel:"Name",this.columnLabel=null!==t?t.columnLabel:"Column",this.targetElement=$(this.selectorEditor),this.initializeEvents(),this.addVisibilityObserver(e.get(0)),this.drawTable(),this.writeConfig(this.export2LayoutRecord())}static stripMarkup(t){return(new SecurityUtility).stripHtml(t)}initializeEvents(){this.readOnly||($(document).on("click",this.selectorAddColumn,this.addColumnHandler),$(document).on("click",this.selectorRemoveColumn,this.removeColumnHandler),$(document).on("click",this.selectorAddRowTop,this.addRowTopHandler),$(document).on("click",this.selectorAddRowBottom,this.addRowBottomHandler),$(document).on("click",this.selectorRemoveRowTop,this.removeRowTopHandler),$(document).on("click",this.selectorRemoveRowBottom,this.removeRowBottomHandler),$(document).on("click",this.selectorLinkEditor,this.linkEditorHandler),$(document).on("click",this.selectorLinkExpandRight,this.linkExpandRightHandler),$(document).on("click",this.selectorLinkShrinkLeft,this.linkShrinkLeftHandler),$(document).on("click",this.selectorLinkExpandDown,this.linkExpandDownHandler),$(document).on("click",this.selectorLinkShrinkUp,this.linkShrinkUpHandler))}getNewCell(){return $.extend({},this.defaultCell)}writeConfig(t){this.field.val(t);const e=t.split("\n");let o="";for(const t of e)t&&(o+="\t\t\t"+t+"\n");let n="mod.web_layout.BackendLayouts {\n  exampleKey {\n    title = Example\n    icon = EXT:example_extension/Resources/Public/Images/BackendLayouts/default.gif\n    config {\n"+o.replace(new RegExp("\t","g"),"  ")+"    }\n  }\n}\n";$(this.selectorConfigPreview).find(this.selectorPreviewArea).empty().append(n);const i=document.querySelector(this.selectorCodeMirror);i&&i.CodeMirror.setValue(n)}addRowTop(){const t=[];for(let e=0;e<this.colCount;e++){const o=this.getNewCell();o.name=e+"x"+this.data.length,t[e]=o}this.data.unshift(t),this.rowCount++}addRowBottom(){const t=[];for(let e=0;e<this.colCount;e++){const o=this.getNewCell();o.name=e+"x"+this.data.length,t[e]=o}this.data.push(t),this.rowCount++}removeRowTop(){if(this.rowCount<=1)return!1;const t=[];for(let e=1;e<this.rowCount;e++)t.push(this.data[e]);for(let t=0;t<this.colCount;t++)1===this.data[0][t].spanned&&this.findUpperCellWidthRowspanAndDecreaseByOne(t,0);return this.data=t,this.rowCount--,!0}removeRowBottom(){if(this.rowCount<=1)return!1;const t=[];for(let e=0;e<this.rowCount-1;e++)t.push(this.data[e]);for(let t=0;t<this.colCount;t++)1===this.data[this.rowCount-1][t].spanned&&this.findUpperCellWidthRowspanAndDecreaseByOne(t,this.rowCount-1);return this.data=t,this.rowCount--,!0}findUpperCellWidthRowspanAndDecreaseByOne(t,e){const o=this.getCell(t,e-1);return!!o&&(1===o.spanned?this.findUpperCellWidthRowspanAndDecreaseByOne(t,e-1):o.rowspan>1&&this.removeRowspan(t,e-1),!0)}removeColumn(){if(this.colCount<=1)return!1;const t=[];for(let e=0;e<this.rowCount;e++){const o=[];for(let t=0;t<this.colCount-1;t++)o.push(this.data[e][t]);1===this.data[e][this.colCount-1].spanned&&this.findLeftCellWidthColspanAndDecreaseByOne(this.colCount-1,e),t.push(o)}return this.data=t,this.colCount--,!0}findLeftCellWidthColspanAndDecreaseByOne(t,e){const o=this.getCell(t-1,e);return!!o&&(1===o.spanned?this.findLeftCellWidthColspanAndDecreaseByOne(t-1,e):o.colspan>1&&this.removeColspan(t-1,e),!0)}addColumn(){for(let t=0;t<this.rowCount;t++){const e=this.getNewCell();e.name=this.colCount+"x"+t,this.data[t].push(e)}this.colCount++}drawTable(){const t=$("<colgroup>");for(let e=0;e<this.colCount;e++){const e=100/this.colCount;t.append($("<col>").css({width:parseInt(e.toString(),10)+"%"}))}const e=$('<table id="base" class="table editor">');e.append(t);for(let t=0;t<this.rowCount;t++){if(0===this.data[t].length)continue;const o=$("<tr>");for(let e=0;e<this.colCount;e++){const n=this.data[t][e];if(1===n.spanned)continue;const i=100/this.rowCount,r=100/this.colCount,s=$("<td>").css({height:parseInt(i.toString(),10)*n.rowspan+"%",width:parseInt(r.toString(),10)*n.colspan+"%"});if(!this.readOnly){const o=$('<div class="cell_container">');s.append(o);const n=$('<a href="#" data-col="'+e+'" data-row="'+t+'">');o.append(n.clone().attr("class","t3js-grideditor-link-editor link link_editor").attr("title",TYPO3.lang.grid_editCell)),this.cellCanSpanRight(e,t)&&o.append(n.clone().attr("class","t3js-grideditor-link-expand-right link link_expand_right").attr("title",TYPO3.lang.grid_mergeCell)),this.cellCanShrinkLeft(e,t)&&o.append(n.clone().attr("class","t3js-grideditor-link-shrink-left link link_shrink_left").attr("title",TYPO3.lang.grid_splitCell)),this.cellCanSpanDown(e,t)&&o.append(n.clone().attr("class","t3js-grideditor-link-expand-down link link_expand_down").attr("title",TYPO3.lang.grid_mergeCell)),this.cellCanShrinkUp(e,t)&&o.append(n.clone().attr("class","t3js-grideditor-link-shrink-up link link_shrink_up").attr("title",TYPO3.lang.grid_splitCell))}s.append($('<div class="cell_data">').html(TYPO3.lang.grid_name+": "+(n.name?GridEditor.stripMarkup(n.name):TYPO3.lang.grid_notSet)+"<br />"+TYPO3.lang.grid_column+": "+(void 0===n.column||isNaN(n.column)?TYPO3.lang.grid_notSet:parseInt(n.column,10)))),n.colspan>1&&s.attr("colspan",n.colspan),n.rowspan>1&&s.attr("rowspan",n.rowspan),o.append(s)}e.append(o)}$(this.targetElement).empty().append(e)}setName(t,e,o){const n=this.getCell(e,o);return!!n&&(n.name=GridEditor.stripMarkup(t),!0)}setColumn(t,e,o){const n=this.getCell(e,o);return!!n&&(n.column=parseInt(t.toString(),10),!0)}showOptions(t,e){const o=this.getCell(t,e);if(!o)return!1;let n;n=0===o.column?0:o.column?parseInt(o.column.toString(),10):"";const i=$("<div>"),r=$('<div class="form-group">'),s=$("<label>"),a=$("<input>");i.append([r.clone().append([s.clone().text(TYPO3.lang.grid_nameHelp),a.clone().attr("type","text").attr("class","t3js-grideditor-field-name form-control").attr("name","name").val(GridEditor.stripMarkup(o.name)||"")]),r.clone().append([s.clone().text(TYPO3.lang.grid_columnHelp),a.clone().attr("type","text").attr("class","t3js-grideditor-field-colpos form-control").attr("name","column").val(n)])]);const l=Modal.show(TYPO3.lang.grid_windowTitle,i,SeverityEnum.notice,[{active:!0,btnClass:"btn-default",name:"cancel",text:$(this).data("button-close-text")||TYPO3.lang["button.cancel"]||"Cancel"},{btnClass:"btn-primary",name:"ok",text:$(this).data("button-ok-text")||TYPO3.lang["button.ok"]||"OK"}]);return l.data("col",t),l.data("row",e),l.on("button.clicked",this.modalButtonClickHandler),!0}getCell(t,e){return!(t>this.colCount-1)&&(!(e>this.rowCount-1)&&(this.data.length>e-1&&this.data[e].length>t-1?this.data[e][t]:null))}cellCanSpanRight(t,e){if(t===this.colCount-1)return!1;const o=this.getCell(t,e);let n;if(o.rowspan>1){for(let i=e;i<e+o.rowspan;i++)if(n=this.getCell(t+o.colspan,i),!n||1===n.spanned||n.colspan>1||n.rowspan>1)return!1}else if(n=this.getCell(t+o.colspan,e),!n||1===o.spanned||1===n.spanned||n.colspan>1||n.rowspan>1)return!1;return!0}cellCanSpanDown(t,e){if(e===this.rowCount-1)return!1;const o=this.getCell(t,e);let n;if(o.colspan>1){for(let i=t;i<t+o.colspan;i++)if(n=this.getCell(i,e+o.rowspan),!n||1===n.spanned||n.colspan>1||n.rowspan>1)return!1}else if(n=this.getCell(t,e+o.rowspan),!n||1===o.spanned||1===n.spanned||n.colspan>1||n.rowspan>1)return!1;return!0}cellCanShrinkLeft(t,e){return this.data[e][t].colspan>1}cellCanShrinkUp(t,e){return this.data[e][t].rowspan>1}addColspan(t,e){const o=this.getCell(t,e);if(!o||!this.cellCanSpanRight(t,e))return!1;for(let n=e;n<e+o.rowspan;n++)this.data[n][t+o.colspan].spanned=1;return o.colspan+=1,!0}addRowspan(t,e){const o=this.getCell(t,e);if(!o||!this.cellCanSpanDown(t,e))return!1;for(let n=t;n<t+o.colspan;n++)this.data[e+o.rowspan][n].spanned=1;return o.rowspan+=1,!0}removeColspan(t,e){const o=this.getCell(t,e);if(!o||!this.cellCanShrinkLeft(t,e))return!1;o.colspan-=1;for(let n=e;n<e+o.rowspan;n++)this.data[n][t+o.colspan].spanned=0;return!0}removeRowspan(t,e){const o=this.getCell(t,e);if(!o||!this.cellCanShrinkUp(t,e))return!1;o.rowspan-=1;for(let n=t;n<t+o.colspan;n++)this.data[e+o.rowspan][n].spanned=0;return!0}export2LayoutRecord(){let t="backend_layout {\n\tcolCount = "+this.colCount+"\n\trowCount = "+this.rowCount+"\n\trows {\n";for(let e=0;e<this.rowCount;e++){t+="\t\t"+(e+1)+" {\n",t+="\t\t\tcolumns {\n";let o=0;for(let n=0;n<this.colCount;n++){const i=this.getCell(n,e);if(i&&!i.spanned){const r=GridEditor.stripMarkup(i.name)||"";o++,t+="\t\t\t\t"+o+" {\n",t+="\t\t\t\t\tname = "+(r||n+"x"+e)+"\n",i.colspan>1&&(t+="\t\t\t\t\tcolspan = "+i.colspan+"\n"),i.rowspan>1&&(t+="\t\t\t\t\trowspan = "+i.rowspan+"\n"),"number"==typeof i.column&&(t+="\t\t\t\t\tcolPos = "+i.column+"\n"),t+="\t\t\t\t}\n"}}t+="\t\t\t}\n",t+="\t\t}\n"}return t+="\t}\n}\n",t}addVisibilityObserver(t){null===t.offsetParent&&new IntersectionObserver((t,e)=>{t.forEach(t=>{const e=document.querySelector(this.selectorCodeMirror);t.intersectionRatio>0&&e&&e.CodeMirror.refresh()})}).observe(t)}}