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
define(["jquery"],(function(e){"use strict";var t;!function(e){e.containerSelector=".t3js-newmultiplepages-container",e.addMoreFieldsButtonSelector=".t3js-newmultiplepages-createnewfields",e.doktypeSelector=".t3js-newmultiplepages-select-doktype",e.templateRow=".t3js-newmultiplepages-newlinetemplate"}(t||(t={}));return new class{constructor(){this.lineCounter=5,e(()=>{this.initializeEvents()})}initializeEvents(){e(t.addMoreFieldsButtonSelector).on("click",()=>{this.createNewFormFields()}),e(document).on("change",t.doktypeSelector,t=>{this.actOnTypeSelectChange(e(t.currentTarget))})}createNewFormFields(){for(let n=0;n<5;n++){const i=this.lineCounter+n+1,l=e(t.templateRow).html().replace(/\[0\]/g,(this.lineCounter+n).toString()).replace(/\[1\]/g,i.toString());e(l).appendTo(t.containerSelector)}this.lineCounter+=5}actOnTypeSelectChange(t){const n=t.find(":selected");e(t.data("target")).html(n.data("icon"))}}}));