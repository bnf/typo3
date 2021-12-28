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
import"bootstrap";import $ from"jquery";import"TYPO3/CMS/Install/Renderable/Clearable.esm.js";import{AbstractInteractableModule}from"TYPO3/CMS/Install/Module/AbstractInteractableModule.esm.js";import ModuleMenu from"TYPO3/CMS/Backend/ModuleMenu.esm.js";import Notification from"TYPO3/CMS/Backend/Notification.esm.js";import AjaxRequest from"TYPO3/CMS/Core/Ajax/AjaxRequest.esm.js";import Router from"TYPO3/CMS/Install/Router.esm.js";class ExtensionConfiguration extends AbstractInteractableModule{constructor(){super(...arguments),this.selectorFormListener=".t3js-extensionConfiguration-form",this.selectorSearchInput=".t3js-extensionConfiguration-search"}initialize(t){this.currentModal=t,this.getContent(),t.on("keydown",e=>{const a=t.find(this.selectorSearchInput);e.ctrlKey||e.metaKey?"f"===String.fromCharCode(e.which).toLowerCase()&&(e.preventDefault(),a.trigger("focus")):27===e.keyCode&&(e.preventDefault(),a.val("").trigger("focus"))}),t.on("keyup",this.selectorSearchInput,e=>{const a=$(e.target).val(),o=t.find(this.selectorSearchInput);t.find(".search-item").each((t,e)=>{const o=$(e);$(":contains("+a+")",o).length>0||$('input[value*="'+a+'"]',o).length>0?o.removeClass("hidden").addClass("searchhit"):o.removeClass("searchhit").addClass("hidden")}),t.find(".searchhit").collapse("show");const r=o.get(0);r.clearable(),r.focus()}),t.on("submit",this.selectorFormListener,t=>{t.preventDefault(),this.write($(t.currentTarget))})}getContent(){const t=this.getModalBody();new AjaxRequest(Router.getUrl("extensionConfigurationGetContent")).get({cache:"no-cache"}).then(async e=>{const a=await e.resolve();!0===a.success&&(t.html(a.html),this.initializeWrap())},e=>{Router.handleAjaxError(e,t)})}write(t){const e=this.getModalBody(),a=this.getModuleContent().data("extension-configuration-write-token"),o={};$.each(t.serializeArray(),(t,e)=>{o[e.name]=e.value}),new AjaxRequest(Router.getUrl()).post({install:{token:a,action:"extensionConfigurationWrite",extensionKey:t.attr("data-extensionKey"),extensionConfiguration:o}}).then(async t=>{const e=await t.resolve();!0===e.success&&Array.isArray(e.status)?(e.status.forEach(t=>{Notification.showMessage(t.title,t.message,t.severity)}),"backend"===$("body").data("context")&&ModuleMenu.App.refreshMenu()):Notification.error("Something went wrong","The request was not processed successfully. Please check the browser's console and TYPO3's log.")},t=>{Router.handleAjaxError(t,e)})}initializeWrap(){this.findInModal(".t3js-emconf-offset").each((t,e)=>{var a,o;const r=$(e),n=r.parent(),i=r.attr("id"),s=r.attr("value").split(",");r.attr("data-offsetfield-x","#"+i+"_offset_x").attr("data-offsetfield-y","#"+i+"_offset_y").wrap('<div class="hidden"></div>');const l=$("<div>",{class:"form-multigroup-item"}).append($("<div>",{class:"input-group"}).append($("<div>",{class:"input-group-addon"}).text("x"),$("<input>",{id:i+"_offset_x",class:"form-control t3js-emconf-offsetfield","data-target":"#"+i,value:null===(a=s[0])||void 0===a?void 0:a.trim()}))),d=$("<div>",{class:"form-multigroup-item"}).append($("<div>",{class:"input-group"}).append($("<div>",{class:"input-group-addon"}).text("y"),$("<input>",{id:i+"_offset_y",class:"form-control t3js-emconf-offsetfield","data-target":"#"+i,value:null===(o=s[1])||void 0===o?void 0:o.trim()}))),c=$("<div>",{class:"form-multigroup-wrap"}).append(l,d);n.append(c),n.find(".t3js-emconf-offsetfield").on("keyup",t=>{const e=n.find($(t.currentTarget).data("target"));e.val(n.find(e.data("offsetfield-x")).val()+","+n.find(e.data("offsetfield-y")).val())})}),this.findInModal(".t3js-emconf-wrap").each((t,e)=>{var a,o;const r=$(e),n=r.parent(),i=r.attr("id"),s=r.attr("value").split("|");r.attr("data-wrapfield-start","#"+i+"_wrap_start").attr("data-wrapfield-end","#"+i+"_wrap_end").wrap('<div class="hidden"></div>');const l=$("<div>",{class:"form-multigroup-wrap"}).append($("<div>",{class:"form-multigroup-item"}).append($("<input>",{id:i+"_wrap_start",class:"form-control t3js-emconf-wrapfield","data-target":"#"+i,value:null===(a=s[0])||void 0===a?void 0:a.trim()})),$("<div>",{class:"form-multigroup-item"}).append($("<input>",{id:i+"_wrap_end",class:"form-control t3js-emconf-wrapfield","data-target":"#"+i,value:null===(o=s[1])||void 0===o?void 0:o.trim()})));n.append(l),n.find(".t3js-emconf-wrapfield").on("keyup",t=>{const e=n.find($(t.currentTarget).data("target"));e.val(n.find(e.data("wrapfield-start")).val()+"|"+n.find(e.data("wrapfield-end")).val())})})}}export default new ExtensionConfiguration;