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
import"bootstrap";import $ from"jquery";import"TYPO3/CMS/Install/Renderable/Clearable";import{AbstractInteractableModule}from"TYPO3/CMS/Install/Module/AbstractInteractableModule";import Modal from"TYPO3/CMS/Backend/Modal";import Notification from"TYPO3/CMS/Backend/Notification";import AjaxRequest from"TYPO3/CMS/Core/Ajax/AjaxRequest";import Router from"TYPO3/CMS/Install/Router";class LocalConfiguration extends AbstractInteractableModule{constructor(){super(...arguments),this.selectorToggleAllTrigger=".t3js-localConfiguration-toggleAll",this.selectorWriteTrigger=".t3js-localConfiguration-write",this.selectorSearchTrigger=".t3js-localConfiguration-search"}initialize(t){this.currentModal=t,this.getContent(),t.on("click",this.selectorWriteTrigger,()=>{this.write()}),t.on("click",this.selectorToggleAllTrigger,()=>{const t=this.getModalBody().find(".panel-collapse"),e=t.eq(0).hasClass("in")?"hide":"show";t.collapse(e)}),$.expr[":"].contains=$.expr.createPseudo(t=>e=>$(e).text().toUpperCase().includes(t.toUpperCase())),t.on("keydown",e=>{const o=t.find(this.selectorSearchTrigger);e.ctrlKey||e.metaKey?"f"===String.fromCharCode(e.which).toLowerCase()&&(e.preventDefault(),o.trigger("focus")):27===e.keyCode&&(e.preventDefault(),o.val("").trigger("focus"))}),t.on("keyup",this.selectorSearchTrigger,e=>{const o=$(e.target).val(),a=t.find(this.selectorSearchTrigger);t.find("div.item").each((t,e)=>{const a=$(e);$(":contains("+o+")",a).length>0||$('input[value*="'+o+'"]',a).length>0?a.removeClass("hidden").addClass("searchhit"):a.removeClass("searchhit").addClass("hidden")}),t.find(".searchhit").parent().collapse("show");const r=a.get(0);r.clearable(),r.focus()})}getContent(){const t=this.getModalBody();new AjaxRequest(Router.getUrl("localConfigurationGetContent")).get({cache:"no-cache"}).then(async e=>{const o=await e.resolve();!0===o.success&&(t.html(o.html),Modal.setButtons(o.buttons))},e=>{Router.handleAjaxError(e,t)})}write(){this.setModalButtonsState(!1);const t=this.getModalBody(),e=this.getModuleContent().data("local-configuration-write-token"),o={};this.findInModal(".t3js-localConfiguration-pathValue").each((t,e)=>{const a=$(e);"checkbox"===a.attr("type")?e.checked?o[a.data("path")]="1":o[a.data("path")]="0":o[a.data("path")]=a.val()}),new AjaxRequest(Router.getUrl()).post({install:{action:"localConfigurationWrite",token:e,configurationValues:o}}).then(async t=>{const e=await t.resolve();!0===e.success&&Array.isArray(e.status)?e.status.forEach(t=>{Notification.showMessage(t.title,t.message,t.severity)}):Notification.error("Something went wrong","The request was not processed successfully. Please check the browser's console and TYPO3's log.")},e=>{Router.handleAjaxError(e,t)}).finally(()=>{this.setModalButtonsState(!0)})}}export default new LocalConfiguration;