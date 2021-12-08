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
var __importDefault=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};define(["require","exports","jquery","TYPO3/CMS/Install/Module/AbstractInteractableModule","TYPO3/CMS/Backend/Modal","TYPO3/CMS/Backend/Notification","TYPO3/CMS/Core/Ajax/AjaxRequest","TYPO3/CMS/Install/Router","bootstrap","TYPO3/CMS/Install/Renderable/Clearable"],(function(e,t,a,s,o,r,l,n){"use strict";a=__importDefault(a);class i extends s.AbstractInteractableModule{constructor(){super(...arguments),this.selectorToggleAllTrigger=".t3js-localConfiguration-toggleAll",this.selectorWriteTrigger=".t3js-localConfiguration-write",this.selectorSearchTrigger=".t3js-localConfiguration-search"}initialize(e){this.currentModal=e,this.getContent(),e.on("click",this.selectorWriteTrigger,()=>{this.write()}),e.on("click",this.selectorToggleAllTrigger,()=>{const e=this.getModalBody().find(".panel-collapse"),t=e.eq(0).hasClass("in")?"hide":"show";e.collapse(t)}),a.default.expr[":"].contains=a.default.expr.createPseudo(e=>t=>a.default(t).text().toUpperCase().includes(e.toUpperCase())),e.on("keydown",t=>{const a=e.find(this.selectorSearchTrigger);t.ctrlKey||t.metaKey?"f"===String.fromCharCode(t.which).toLowerCase()&&(t.preventDefault(),a.trigger("focus")):27===t.keyCode&&(t.preventDefault(),a.val("").trigger("focus"))}),e.on("keyup",this.selectorSearchTrigger,t=>{const s=a.default(t.target).val(),o=e.find(this.selectorSearchTrigger);e.find("div.item").each((e,t)=>{const o=a.default(t);a.default(":contains("+s+")",o).length>0||a.default('input[value*="'+s+'"]',o).length>0?o.removeClass("hidden").addClass("searchhit"):o.removeClass("searchhit").addClass("hidden")}),e.find(".searchhit").parent().collapse("show");const r=o.get(0);r.clearable(),r.focus()})}getContent(){const e=this.getModalBody();new l(n.getUrl("localConfigurationGetContent")).get({cache:"no-cache"}).then(async t=>{const a=await t.resolve();!0===a.success&&(e.html(a.html),o.setButtons(a.buttons))},t=>{n.handleAjaxError(t,e)})}write(){this.setModalButtonsState(!1);const e=this.getModalBody(),t=this.getModuleContent().data("local-configuration-write-token"),s={};this.findInModal(".t3js-localConfiguration-pathValue").each((e,t)=>{const o=a.default(t);"checkbox"===o.attr("type")?t.checked?s[o.data("path")]="1":s[o.data("path")]="0":s[o.data("path")]=o.val()}),new l(n.getUrl()).post({install:{action:"localConfigurationWrite",token:t,configurationValues:s}}).then(async e=>{const t=await e.resolve();!0===t.success&&Array.isArray(t.status)?t.status.forEach(e=>{r.showMessage(e.title,e.message,e.severity)}):r.error("Something went wrong","The request was not processed successfully. Please check the browser's console and TYPO3's log.")},t=>{n.handleAjaxError(t,e)}).finally(()=>{this.setModalButtonsState(!0)})}}return new i}));