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
import e from"@typo3/core/document-service.js";import t from"@typo3/core/event/regular-event.js";var o;!function(e){e.containerSelector=".t3js-newmultiplepages-container",e.addMoreFieldsButtonSelector=".t3js-newmultiplepages-createnewfields",e.pageTitleSelector=".t3js-newmultiplepages-page-title",e.doktypeSelector=".t3js-newmultiplepages-select-doktype",e.resetFieldsSelector=".t3js-newmultiplepages-reset-fields",e.templateRow=".t3js-newmultiplepages-newlinetemplate"}(o||(o={}));export default new class{constructor(){this.lineCounter=5,e.ready().then((()=>{this.initializeEvents()}))}initializeEvents(){new t("click",this.createNewFormFields.bind(this)).delegateTo(document,o.addMoreFieldsButtonSelector),new t("change",this.actOnPageTitleChange).delegateTo(document,o.pageTitleSelector),new t("change",this.actOnTypeSelectChange).delegateTo(document,o.doktypeSelector),new t("click",this.resetFieldAttributes).delegateTo(document,o.resetFieldsSelector)}createNewFormFields(){const e=document.querySelector(o.containerSelector),t=document.querySelector(o.templateRow)?.innerHTML||"";if(null!==e&&""!==t){for(let o=0;o<5;o++){const l=this.lineCounter+o+1;e.innerHTML+=t.replace(/\[0\]/g,(this.lineCounter+o).toString()).replace(/\[1\]/g,l.toString())}this.lineCounter+=5}}actOnPageTitleChange(){this.setAttribute("value",this.value)}actOnTypeSelectChange(){for(const e of this.options)e.removeAttribute("selected");const e=this.options[this.selectedIndex],t=document.querySelector(this.dataset.target);null!==e&&null!==t&&(e.setAttribute("selected","selected"),t.innerHTML=e.dataset.icon)}resetFieldAttributes(){document.querySelectorAll(o.containerSelector+" "+o.pageTitleSelector).forEach((e=>{e.removeAttribute("value")})),document.querySelectorAll(o.containerSelector+" "+o.doktypeSelector).forEach((e=>{for(const t of e)t.removeAttribute("selected");const t=e.options[0]?.dataset.icon,o=document.querySelector(e.dataset.target);t&&null!==o&&(o.innerHTML=t)}))}};