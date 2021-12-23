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
import"bootstrap.esm.js";import $ from"jquery.esm.js";import"TYPO3/CMS/Install/Renderable/Clearable.esm.js";import{AbstractInteractableModule}from"TYPO3/CMS/Install/Module/AbstractInteractableModule.esm.js";import Notification from"TYPO3/CMS/Backend/Notification.esm.js";import AjaxRequest from"TYPO3/CMS/Core/Ajax/AjaxRequest.esm.js";import Router from"TYPO3/CMS/Install/Router.esm.js";import DebounceEvent from"TYPO3/CMS/Core/Event/DebounceEvent.esm.js";class UpgradeDocs extends AbstractInteractableModule{constructor(){super(...arguments),this.selectorFulltextSearch=".t3js-upgradeDocs-fulltext-search",this.selectorChosenField=".t3js-upgradeDocs-chosen-select",this.selectorChangeLogsForVersionContainer=".t3js-version-changes",this.selectorChangeLogsForVersion=".t3js-changelog-list",this.selectorUpgradeDoc=".t3js-upgrade-doc"}static trimExplodeAndUnique(e,t){const s=[],o=t.split(e);for(let e=0;e<o.length;e++){const t=o[e].trim();t.length>0&&-1===$.inArray(t,s)&&s.push(t)}return s}initialize(e){this.currentModal=e;window.location!==window.parent.location?top.require(["TYPO3/CMS/Install/chosen.jquery.min"],()=>{this.getContent()}):import("TYPO3/CMS/Install/chosen.jquery.min.esm.js").then(()=>{this.getContent()}),e.on("click",".t3js-upgradeDocs-markRead",e=>{this.markRead(e.target)}),e.on("click",".t3js-upgradeDocs-unmarkRead",e=>{this.unmarkRead(e.target)}),$.expr[":"].contains=$.expr.createPseudo(e=>t=>$(t).text().toUpperCase().includes(e.toUpperCase()))}getContent(){const e=this.getModalBody();e.on("show.bs.collapse",this.selectorUpgradeDoc,e=>{this.renderTags($(e.currentTarget))}),new AjaxRequest(Router.getUrl("upgradeDocsGetContent")).get({cache:"no-cache"}).then(async t=>{const s=await t.resolve();!0===s.success&&"undefined"!==s.html&&s.html.length>0&&(e.empty().append(s.html),this.initializeFullTextSearch(),this.initializeChosenSelector(),this.loadChangelogs())},t=>{Router.handleAjaxError(t,e)})}loadChangelogs(){const e=[],t=this.getModalBody();this.findInModal(this.selectorChangeLogsForVersionContainer).each((s,o)=>{const a=new AjaxRequest(Router.getUrl("upgradeDocsGetChangelogForVersion")).withQueryArguments({install:{version:o.dataset.version}}).get({cache:"no-cache"}).then(async e=>{const t=await e.resolve();if(!0===t.success){const e=$(o),s=e.find(this.selectorChangeLogsForVersion);s.html(t.html),this.moveNotRelevantDocuments(s),e.find(".t3js-panel-loading").remove()}else Notification.error("Something went wrong","The request was not processed successfully. Please check the browser's console and TYPO3's log.")},e=>{Router.handleAjaxError(e,t)});e.push(a)}),Promise.all(e).then(()=>{this.fulltextSearchField.prop("disabled",!1),this.appendItemsToChosenSelector()})}initializeFullTextSearch(){this.fulltextSearchField=this.findInModal(this.selectorFulltextSearch);const e=this.fulltextSearchField.get(0);e.clearable({onClear:()=>{this.combinedFilterSearch()}}),e.focus(),this.initializeChosenSelector(),new DebounceEvent("keyup",()=>{this.combinedFilterSearch()}).bindTo(e)}initializeChosenSelector(){this.chosenField=this.getModalBody().find(this.selectorChosenField);const e={".chosen-select":{width:"100%",placeholder_text_multiple:"tags"},".chosen-select-deselect":{allow_single_deselect:!0},".chosen-select-no-single":{disable_search_threshold:10},".chosen-select-no-results":{no_results_text:"Oops, nothing found!"},".chosen-select-width":{width:"100%"}};for(const t in e)e.hasOwnProperty(t)&&this.findInModal(t).chosen(e[t]);this.chosenField.on("change",()=>{this.combinedFilterSearch()})}appendItemsToChosenSelector(){let e="";$(this.findInModal(this.selectorUpgradeDoc)).each((t,s)=>{e+=$(s).data("item-tags")+","});const t=UpgradeDocs.trimExplodeAndUnique(",",e).sort((e,t)=>e.toLowerCase().localeCompare(t.toLowerCase()));this.chosenField.prop("disabled",!1),$.each(t,(e,t)=>{this.chosenField.append($("<option>").text(t))}),this.chosenField.trigger("chosen:updated")}combinedFilterSearch(){const e=this.getModalBody(),t=e.find("div.item");if(this.chosenField.val().length<1&&this.fulltextSearchField.val().length<1)return this.currentModal.find(".panel-version .panel-collapse.show").collapse("hide"),t.removeClass("hidden searchhit filterhit"),!1;if(t.addClass("hidden").removeClass("searchhit filterhit"),this.chosenField.val().length>0){t.addClass("hidden").removeClass("filterhit");const s=[],o=[];$.each(this.chosenField.val(),(e,t)=>{const a='[data-item-tags*="'+t+'"]';t.includes(":",1)?s.push(a):o.push(a)});const a=o.join(""),n=[];if(s.length)for(let e of s)n.push(a+e);else n.push(a);const l=n.join(",");e.find(l).removeClass("hidden").addClass("searchhit filterhit")}else t.addClass("filterhit").removeClass("hidden");const s=this.fulltextSearchField.val();return e.find("div.item.filterhit").each((e,t)=>{const o=$(t);$(":contains("+s+")",o).length>0||$('input[value*="'+s+'"]',o).length>0?o.removeClass("hidden").addClass("searchhit"):o.removeClass("searchhit").addClass("hidden")}),e.find(".searchhit").closest(".panel-collapse").collapse("show"),e.find(".panel-version").each((e,t)=>{const s=$(t);s.find(".searchhit",".filterhit").length<1&&s.find(" > .panel-collapse").collapse("hide")}),!0}renderTags(e){const t=e.find(".t3js-tags");if(0===t.children().length){e.data("item-tags").split(",").forEach(e=>{t.append($("<span />",{class:"label"}).text(e))})}}moveNotRelevantDocuments(e){e.find('[data-item-state="read"]').appendTo(this.findInModal(".panel-body-read")),e.find('[data-item-state="notAffected"]').appendTo(this.findInModal(".panel-body-not-affected"))}markRead(e){const t=this.getModalBody(),s=this.getModuleContent().data("upgrade-docs-mark-read-token"),o=$(e).closest("button");o.toggleClass("t3js-upgradeDocs-unmarkRead t3js-upgradeDocs-markRead"),o.find("i").toggleClass("fa-check fa-ban"),o.closest(".panel").appendTo(this.findInModal(".panel-body-read")),new AjaxRequest(Router.getUrl()).post({install:{ignoreFile:o.data("filepath"),token:s,action:"upgradeDocsMarkRead"}}).catch(e=>{Router.handleAjaxError(e,t)})}unmarkRead(e){const t=this.getModalBody(),s=this.getModuleContent().data("upgrade-docs-unmark-read-token"),o=$(e).closest("button"),a=o.closest(".panel").data("item-version");o.toggleClass("t3js-upgradeDocs-markRead t3js-upgradeDocs-unmarkRead"),o.find("i").toggleClass("fa-check fa-ban"),o.closest(".panel").appendTo(this.findInModal('*[data-group-version="'+a+'"] .panel-body')),new AjaxRequest(Router.getUrl()).post({install:{ignoreFile:o.data("filepath"),token:s,action:"upgradeDocsUnmarkRead"}}).catch(e=>{Router.handleAjaxError(e,t)})}}export default new UpgradeDocs;