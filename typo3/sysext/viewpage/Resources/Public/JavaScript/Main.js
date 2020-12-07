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
var __importDefault=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};define(["require","exports","jquery","TYPO3/CMS/Backend/Storage/Persistent","TYPO3/CMS/Core/SecurityUtility","jquery-ui/resizable"],(function(e,t,i,s,r){"use strict";var a;i=__importDefault(i),function(e){e.resizableContainerIdentifier=".t3js-viewpage-resizeable",e.sizeIdentifier=".t3js-viewpage-size",e.moduleBodySelector=".t3js-module-body",e.customSelector=".t3js-preset-custom",e.customWidthSelector=".t3js-preset-custom",e.customHeightSelector=".t3js-preset-custom-height",e.changeOrientationSelector=".t3js-change-orientation",e.changePresetSelector=".t3js-change-preset",e.inputWidthSelector=".t3js-viewpage-input-width",e.inputHeightSelector=".t3js-viewpage-input-height",e.currentLabelSelector=".t3js-viewpage-current-label",e.topbarContainerSelector=".t3js-viewpage-topbar",e.refreshSelector=".t3js-viewpage-refresh"}(a||(a={}));class l{constructor(){this.defaultLabel="",this.minimalHeight=300,this.minimalWidth=300,this.storagePrefix="moduleData.web_view.States.",this.queue=[],this.queueIsRunning=!1,i.default(()=>{const e=i.default(".t3js-preset-custom-label");this.defaultLabel=e.length>0?e.html().trim():"",this.$iframe=i.default("#tx_this_iframe"),this.$resizableContainer=i.default(a.resizableContainerIdentifier),this.$sizeSelector=i.default(a.sizeIdentifier),this.initialize()})}static getCurrentWidth(){return i.default(a.inputWidthSelector).val()}static getCurrentHeight(){return i.default(a.inputHeightSelector).val()}static setLabel(e){i.default(a.currentLabelSelector).html((new r).encodeHtml(e))}static getCurrentLabel(){return i.default(a.currentLabelSelector).html().trim()}persistQueue(){if(!1===this.queueIsRunning&&this.queue.length>=1){this.queueIsRunning=!0;let e=this.queue.shift();s.set(e.storageIdentifier,e.data).done(()=>{this.queueIsRunning=!1,this.persistQueue()})}}addToQueue(e,t){const i={storageIdentifier:e,data:t};this.queue.push(i),this.queue.length>=1&&this.persistQueue()}setSize(e,t){isNaN(t)&&(t=this.calculateContainerMaxHeight()),t<this.minimalHeight&&(t=this.minimalHeight),isNaN(e)&&(e=this.calculateContainerMaxWidth()),e<this.minimalWidth&&(e=this.minimalWidth),i.default(a.inputWidthSelector).val(e),i.default(a.inputHeightSelector).val(t),this.$resizableContainer.css({width:e,height:t,left:0})}persistCurrentPreset(){let e={width:l.getCurrentWidth(),height:l.getCurrentHeight(),label:l.getCurrentLabel()};this.addToQueue(this.storagePrefix+"current",e)}persistCustomPreset(){let e={width:l.getCurrentWidth(),height:l.getCurrentHeight()};i.default(a.customSelector).data("width",e.width),i.default(a.customSelector).data("height",e.height),i.default(a.customWidthSelector).html(e.width),i.default(a.customHeightSelector).html(e.height),this.addToQueue(this.storagePrefix+"custom",e)}persistCustomPresetAfterChange(){clearTimeout(this.queueDelayTimer),this.queueDelayTimer=window.setTimeout(()=>{this.persistCustomPreset()},1e3)}initialize(){i.default(document).on("click",a.changeOrientationSelector,()=>{const e=i.default(a.inputHeightSelector).val(),t=i.default(a.inputWidthSelector).val();this.setSize(e,t),this.persistCurrentPreset()}),i.default(document).on("change",a.inputWidthSelector,()=>{const e=i.default(a.inputWidthSelector).val(),t=i.default(a.inputHeightSelector).val();this.setSize(e,t),l.setLabel(this.defaultLabel),this.persistCustomPresetAfterChange()}),i.default(document).on("change",a.inputHeightSelector,()=>{const e=i.default(a.inputWidthSelector).val(),t=i.default(a.inputHeightSelector).val();this.setSize(e,t),l.setLabel(this.defaultLabel),this.persistCustomPresetAfterChange()}),i.default(document).on("click",a.changePresetSelector,e=>{const t=i.default(e.currentTarget).data();this.setSize(parseInt(t.width,10),parseInt(t.height,10)),l.setLabel(t.label),this.persistCurrentPreset()}),i.default(document).on("click",a.refreshSelector,()=>{document.getElementById("tx_viewpage_iframe").contentWindow.location.reload(!0)}),this.$resizableContainer.resizable({handles:"w, sw, s, se, e"}),this.$resizableContainer.on("resizestart",e=>{i.default(e.currentTarget).append('<div id="viewpage-iframe-cover" style="z-index:99;position:absolute;width:100%;top:0;left:0;height:100%;"></div>')}),this.$resizableContainer.on("resize",(e,t)=>{t.size.width=t.originalSize.width+2*(t.size.width-t.originalSize.width),t.size.height<this.minimalHeight&&(t.size.height=this.minimalHeight),t.size.width<this.minimalWidth&&(t.size.width=this.minimalWidth),i.default(a.inputWidthSelector).val(t.size.width),i.default(a.inputHeightSelector).val(t.size.height),this.$resizableContainer.css({left:0}),l.setLabel(this.defaultLabel)}),this.$resizableContainer.on("resizestop",()=>{i.default("#viewpage-iframe-cover").remove(),this.persistCurrentPreset(),this.persistCustomPreset()})}calculateContainerMaxHeight(){this.$resizableContainer.hide();let e=i.default(a.moduleBodySelector),t=e.outerHeight()-e.height(),s=i.default(document).height(),r=i.default(a.topbarContainerSelector).outerHeight();return this.$resizableContainer.show(),s-t-r-8}calculateContainerMaxWidth(){this.$resizableContainer.hide();let e=i.default(a.moduleBodySelector),t=e.outerWidth()-e.width(),s=i.default(document).width();return this.$resizableContainer.show(),parseInt(s-t+"",10)}}return new l}));
=======
define(["jquery","TYPO3/CMS/Backend/Storage/Persistent","TYPO3/CMS/Core/SecurityUtility","jquery-ui/resizable"],(function(e,t,i){"use strict";var s;!function(e){e.resizableContainerIdentifier=".t3js-viewpage-resizeable",e.sizeIdentifier=".t3js-viewpage-size",e.moduleBodySelector=".t3js-module-body",e.customSelector=".t3js-preset-custom",e.customWidthSelector=".t3js-preset-custom",e.customHeightSelector=".t3js-preset-custom-height",e.changeOrientationSelector=".t3js-change-orientation",e.changePresetSelector=".t3js-change-preset",e.inputWidthSelector=".t3js-viewpage-input-width",e.inputHeightSelector=".t3js-viewpage-input-height",e.currentLabelSelector=".t3js-viewpage-current-label",e.topbarContainerSelector=".t3js-viewpage-topbar"}(s||(s={}));class r{constructor(){this.defaultLabel="",this.minimalHeight=300,this.minimalWidth=300,this.storagePrefix="moduleData.web_view.States.",this.queue=[],this.queueIsRunning=!1,e(()=>{const t=e(".t3js-preset-custom-label");this.defaultLabel=t.length>0?t.html().trim():"",this.$iframe=e("#tx_this_iframe"),this.$resizableContainer=e(s.resizableContainerIdentifier),this.$sizeSelector=e(s.sizeIdentifier),this.initialize()})}static getCurrentWidth(){return e(s.inputWidthSelector).val()}static getCurrentHeight(){return e(s.inputHeightSelector).val()}static setLabel(t){e(s.currentLabelSelector).html((new i).encodeHtml(t))}static getCurrentLabel(){return e(s.currentLabelSelector).html().trim()}persistQueue(){if(!1===this.queueIsRunning&&this.queue.length>=1){this.queueIsRunning=!0;let e=this.queue.shift();t.set(e.storageIdentifier,e.data).done(()=>{this.queueIsRunning=!1,this.persistQueue()})}}addToQueue(e,t){const i={storageIdentifier:e,data:t};this.queue.push(i),this.queue.length>=1&&this.persistQueue()}setSize(t,i){isNaN(i)&&(i=this.calculateContainerMaxHeight()),i<this.minimalHeight&&(i=this.minimalHeight),isNaN(t)&&(t=this.calculateContainerMaxWidth()),t<this.minimalWidth&&(t=this.minimalWidth),e(s.inputWidthSelector).val(t),e(s.inputHeightSelector).val(i),this.$resizableContainer.css({width:t,height:i,left:0})}persistCurrentPreset(){let e={width:r.getCurrentWidth(),height:r.getCurrentHeight(),label:r.getCurrentLabel()};this.addToQueue(this.storagePrefix+"current",e)}persistCustomPreset(){let t={width:r.getCurrentWidth(),height:r.getCurrentHeight()};e(s.customSelector).data("width",t.width),e(s.customSelector).data("height",t.height),e(s.customWidthSelector).html(t.width),e(s.customHeightSelector).html(t.height),this.addToQueue(this.storagePrefix+"custom",t)}persistCustomPresetAfterChange(){clearTimeout(this.queueDelayTimer),this.queueDelayTimer=window.setTimeout(()=>{this.persistCustomPreset()},1e3)}initialize(){e(document).on("click",s.changeOrientationSelector,()=>{const t=e(s.inputHeightSelector).val(),i=e(s.inputWidthSelector).val();this.setSize(t,i),this.persistCurrentPreset()}),e(document).on("change",s.inputWidthSelector,()=>{const t=e(s.inputWidthSelector).val(),i=e(s.inputHeightSelector).val();this.setSize(t,i),r.setLabel(this.defaultLabel),this.persistCustomPresetAfterChange()}),e(document).on("change",s.inputHeightSelector,()=>{const t=e(s.inputWidthSelector).val(),i=e(s.inputHeightSelector).val();this.setSize(t,i),r.setLabel(this.defaultLabel),this.persistCustomPresetAfterChange()}),e(document).on("click",s.changePresetSelector,t=>{const i=e(t.currentTarget).data();this.setSize(parseInt(i.width,10),parseInt(i.height,10)),r.setLabel(i.label),this.persistCurrentPreset()}),this.$resizableContainer.resizable({handles:"w, sw, s, se, e"}),this.$resizableContainer.on("resizestart",t=>{e(t.currentTarget).append('<div id="this-iframe-cover" style="z-index:99;position:absolute;width:100%;top:0;left:0;height:100%;"></div>')}),this.$resizableContainer.on("resize",(t,i)=>{i.size.width=i.originalSize.width+2*(i.size.width-i.originalSize.width),i.size.height<this.minimalHeight&&(i.size.height=this.minimalHeight),i.size.width<this.minimalWidth&&(i.size.width=this.minimalWidth),e(s.inputWidthSelector).val(i.size.width),e(s.inputHeightSelector).val(i.size.height),this.$resizableContainer.css({left:0}),r.setLabel(this.defaultLabel)}),this.$resizableContainer.on("resizestop",()=>{e("#viewpage-iframe-cover").remove(),this.persistCurrentPreset(),this.persistCustomPreset()})}calculateContainerMaxHeight(){this.$resizableContainer.hide();let t=e(s.moduleBodySelector),i=t.outerHeight()-t.height(),r=e(document).height(),h=e(s.topbarContainerSelector).outerHeight();return this.$resizableContainer.show(),r-i-h-8}calculateContainerMaxWidth(){this.$resizableContainer.hide();let t=e(s.moduleBodySelector),i=t.outerWidth()-t.width(),r=e(document).width();return this.$resizableContainer.show(),parseInt(r-i+"",10)}}return new r}));
>>>>>>> 8b6510d860 ([POC][WIP][TASK] TypeScript: Do only use ES6 exports, no pseudo imports)
