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
define(["require","jquery","../AbstractInteractableModule","TYPO3/CMS/Backend/Modal","TYPO3/CMS/Backend/Notification","TYPO3/CMS/Core/Ajax/AjaxRequest","../../Router","bootstrap"],(function(e,t,s,n,i,r,o){"use strict";class a extends s.AbstractInteractableModule{constructor(){super(...arguments),this.selectorWriteTrigger=".t3js-systemMaintainer-write",this.selectorChosenContainer=".t3js-systemMaintainer-chosen",this.selectorChosenField=".t3js-systemMaintainer-chosen-select"}initialize(t){this.currentModal=t,window.location!==window.parent.location?top.require(["TYPO3/CMS/Install/chosen.jquery.min"],()=>{this.getList()}):new Promise((function(t,s){e(["TYPO3/CMS/Install/chosen.jquery.min"],(function(e){t("object"!=typeof e||"default"in e?{default:e}:Object.defineProperty(e,"default",{value:e,enumerable:!1}))}),s)})).then(()=>{this.getList()}),t.on("click",this.selectorWriteTrigger,e=>{e.preventDefault(),this.write()})}getList(){const e=this.getModalBody();new r(o.getUrl("systemMaintainerGetList")).get({cache:"no-cache"}).then(async s=>{const i=await s.resolve();if(!0===i.success){e.html(i.html),n.setButtons(i.buttons),Array.isArray(i.users)&&i.users.forEach(s=>{let n=s.username;s.disable&&(n="[DISABLED] "+n);const i=t("<option>",{value:s.uid}).text(n);s.isSystemMaintainer&&i.attr("selected","selected"),e.find(this.selectorChosenField).append(i)});const s={".t3js-systemMaintainer-chosen-select":{width:"100%",placeholder_text_multiple:"users"}};for(const t in s)s.hasOwnProperty(t)&&e.find(t).chosen(s[t]);e.find(this.selectorChosenContainer).show(),e.find(this.selectorChosenField).trigger("chosen:updated")}},t=>{o.handleAjaxError(t,e)})}write(){this.setModalButtonsState(!1);const e=this.getModalBody(),t=this.getModuleContent().data("system-maintainer-write-token"),s=this.findInModal(this.selectorChosenField).val();new r(o.getUrl()).post({install:{users:s,token:t,action:"systemMaintainerWrite"}}).then(async e=>{const t=await e.resolve();!0===t.success?Array.isArray(t.status)&&t.status.forEach(e=>{i.success(e.title,e.message)}):i.error("Something went wrong","The request was not processed successfully. Please check the browser's console and TYPO3's log.")},t=>{o.handleAjaxError(t,e)}).finally(()=>{this.setModalButtonsState(!0)})}}return new a}));