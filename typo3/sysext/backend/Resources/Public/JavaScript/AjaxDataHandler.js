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
var __importDefault=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};define(["require","exports","TYPO3/CMS/Backend/BroadcastMessage","TYPO3/CMS/Core/Ajax/AjaxRequest","./Enum/Severity","jquery","TYPO3/CMS/Backend/BroadcastService","./Icons","./Modal","./Notification","./Viewport","TYPO3/CMS/Core/SecurityUtility"],(function(e,t,a,s,n,i,r,o,c,d,l,h){"use strict";var u;i=__importDefault(i),function(e){e.hide=".t3js-record-hide",e.delete=".t3js-record-delete",e.icon=".t3js-icon"}(u||(u={}));class p{constructor(){this.isInitialized=!1,r.listen(),i.default(()=>{this.initialize()}),this.securityUtility=new h,this.processToken=this.securityUtility.getRandomHexValue(16),document.addEventListener("typo3:ajax-data-handler:instruction@"+this.processToken,this.onInstruction.bind(this))}static refreshPageTree(){l.NavigationContainer&&l.NavigationContainer.PageTree&&l.NavigationContainer.PageTree.refreshTree()}static call(e){return new s(TYPO3.settings.ajaxUrls.record_process).withQueryArguments(e).get()}static resolveElementReference(e,t){return{table:e.data("table"),uid:t.data("uid")}}static broadcastProcessSucceeded(e){r.post(new a.BroadcastMessage("ajax-data-handler","process-succeeded",e))}static broadcastProcessFailed(e){r.post(new a.BroadcastMessage("ajax-data-handler","process-failed",e))}process(e,t){return p.call(e).then(async a=>{const s=await a.resolve("json");return s.hasErrors&&this.handleErrors(s),p.broadcastProcessSucceeded(Object.assign(Object.assign({},t),{parameters:e,processToken:this.processToken,response:await a.dereference(),hasErrors:s.hasErrors,result:s})),s}).catch(async a=>{throw p.broadcastProcessFailed(Object.assign(Object.assign({},t),{parameters:e,processToken:this.processToken,response:await a.dereference(),hasErrors:!0})),a})}initialize(){this.isInitialized||(this.isInitialized=!0,i.default(document).on("click",u.hide,e=>{e.preventDefault();const t=i.default(e.currentTarget);this.processToggleRecord(t)}),i.default(document).on("click",u.delete,e=>{e.preventDefault();const t=i.default(e.currentTarget);t.tooltip("hide"),this.confirmDeleteRecord(t)}))}onInstruction(e){const t=e.detail.payload;if(t.processToken!==this.processToken)return;const a=t.parameters,s=this.findElement(t.elementIdentifier);switch(t.action){case"delete":s?this.processDeleteRecord(i.default(s)):a&&this.process(a);break;case"toggle":s?this.processToggleRecord(i.default(s)):a&&this.process(a)}}toggleRow(e){const t=e.find(u.hide),a=t.closest("table[data-table]").data("table"),s=t.data("params");let n,r,c;"hidden"===t.data("state")?(r="visible",n=s.replace("=0","=1"),c="actions-edit-hide"):(r="hidden",n=s.replace("=1","=0"),c="actions-edit-unhide"),t.data("state",r).data("params",n),t.tooltip("hide").one("hidden.bs.tooltip",()=>{const e=t.data("toggleTitle");t.data("toggleTitle",t.attr("data-original-title")).attr("data-original-title",e)});const d=t.find(u.icon);o.getIcon(c,o.sizes.small).then(e=>{d.replaceWith(e)});const l=e.find(".col-icon "+u.icon);"hidden"===r?o.getIcon("miscellaneous-placeholder",o.sizes.small,"overlay-hidden").then(e=>{l.append(i.default(e).find(".icon-overlay"))}):l.find(".icon-overlay").remove(),e.fadeTo("fast",.4,()=>{e.fadeTo("fast",1)}),"pages"===a&&p.refreshPageTree()}processToggleRecord(e){const t=e.data("params"),a=e.closest("table[data-table]"),s=e.closest("tr[data-uid]"),n=p.resolveElementReference(a,s),i=e.find(u.icon);this._showSpinnerIcon(i);const r=Object.assign(Object.assign({},n),{action:"toggle",component:"ajax-data-handler",elementIdentifier:this.identifyElement(e.get(0))});this.process(t,r).then(e=>{e.hasErrors||this.toggleRow(s)}).catch(async e=>{})}confirmDeleteRecord(e){c.confirm(e.data("title"),e.data("message"),n.SeverityEnum.warning,[{text:e.data("button-close-text")||TYPO3.lang["button.cancel"]||"Cancel",active:!0,btnClass:"btn-default",name:"cancel"},{text:e.data("button-ok-text")||TYPO3.lang["button.delete"]||"Delete",btnClass:"btn-warning",name:"delete"}]).on("button.clicked",t=>{"cancel"===t.target.getAttribute("name")?c.dismiss():"delete"===t.target.getAttribute("name")&&(c.dismiss(),this.processDeleteRecord(e))})}processDeleteRecord(e){const t=e.data("params");let a=e.find(u.icon);this._showSpinnerIcon(a);const s=e.closest("table[data-table]");let n=e.closest("tr[data-uid]");const i=p.resolveElementReference(s,n),r=Object.assign(Object.assign({},i),{action:"delete",component:"ajax-data-handler",elementIdentifier:this.identifyElement(e.get(0))});this.process(t,r).then(t=>{if(o.getIcon("actions-edit-delete",o.sizes.small).then(t=>{a=e.find(u.icon),a.replaceWith(t)}),t.hasErrors)return;const r=e.closest(".panel"),c=r.find(".panel-heading"),d=s.find("[data-l10nparent="+i.uid+"]").closest("tr[data-uid]");if(n=n.add(d),n.fadeTo("slow",.4,()=>{n.slideUp("slow",()=>{n.remove(),0===s.find("tbody tr").length&&r.slideUp("slow")})}),"0"===e.data("l10parent")||""===e.data("l10parent")){const e=Number(c.find(".t3js-table-total-items").html());c.find(".t3js-table-total-items").text(e-1)}"pages"===i.table&&p.refreshPageTree()}).catch(async e=>{})}handleErrors(e){i.default.each(e.messages,(e,t)=>{d.error(t.title,t.message)})}_showSpinnerIcon(e){o.getIcon("spinner-circle-dark",o.sizes.small).then(t=>{e.replaceWith(t)})}identifyElement(e){const t="identifier"+this.processToken;let a=e.dataset[t];return a||(a=this.securityUtility.getRandomHexValue(16),e.dataset[t]=a),a}findElement(e){if(!e)return null;const t="[data-identifier"+this.processToken+'="'+e+'"]';return document.querySelector(t)}}return new p}));