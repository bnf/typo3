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
define(["jquery","nprogress","TYPO3/CMS/Backend/Notification","TYPO3/CMS/Core/Ajax/AjaxRequest"],(function(e,a,t,n){"use strict";var s;!function(e){e.extensionTable="#terTable",e.terUpdateAction=".update-from-ter",e.pagination=".pagination-wrap",e.splashscreen=".splash-receivedata",e.terTableWrapper="#terTableWrapper .table"}(s||(s={}));return class{initializeEvents(){e(s.terUpdateAction).each((a,t)=>{const n=e(t),s=n.attr("action");n.attr("action","#"),n.on("submit",()=>(this.updateFromTer(s,!0),!1)),this.updateFromTer(s,!1)})}updateFromTer(i,r){r&&(i+="&tx_extensionmanager_tools_extensionmanagerextensionmanager%5BforceUpdateCheck%5D=1"),e(s.terUpdateAction).addClass("extensionmanager-is-hidden"),e(s.extensionTable).hide(),e(s.splashscreen).addClass("extensionmanager-is-shown"),e(s.terTableWrapper).addClass("extensionmanager-is-loading"),e(s.pagination).addClass("extensionmanager-is-loading");let o=!1;a.start(),new n(i).get().then(async a=>{const n=await a.resolve();n.errorMessage.length&&t.error(TYPO3.lang["extensionList.updateFromTerFlashMessage.title"],n.errorMessage,10);const i=e(s.terUpdateAction+" .extension-list-last-updated");i.text(n.timeSinceLastUpdate),i.attr("title",TYPO3.lang["extensionList.updateFromTer.lastUpdate.timeOfLastUpdate"]+n.lastUpdateTime),n.updated&&(o=!0,window.location.replace(window.location.href))},async e=>{const a=e.response.statusText+"("+e.response.status+"): "+await e.response.text();t.warning(TYPO3.lang["extensionList.updateFromTerFlashMessage.title"],a,10)}).finally(()=>{a.done(),o||(e(s.splashscreen).removeClass("extensionmanager-is-shown"),e(s.terTableWrapper).removeClass("extensionmanager-is-loading"),e(s.pagination).removeClass("extensionmanager-is-loading"),e(s.terUpdateAction).removeClass("extensionmanager-is-hidden"),e(s.extensionTable).show())})}}}));