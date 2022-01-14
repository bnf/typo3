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
import $ from"jquery";import AjaxRequest from"@typo3/core/Ajax/AjaxRequest.js";import Icons from"@typo3/Backend/Icons.js";import PersistentStorage from"@typo3/Backend/Storage/Persistent.js";import Viewport from"@typo3/Backend/Viewport.js";var Identifiers;!function(e){e.containerSelector="#typo3-cms-backend-backend-toolbaritems-systeminformationtoolbaritem",e.toolbarIconSelector=".toolbar-item-icon .t3js-icon",e.menuContainerSelector=".dropdown-menu",e.moduleLinks=".t3js-systeminformation-module",e.counter=".t3js-systeminformation-counter"}(Identifiers||(Identifiers={}));class SystemInformationMenu{constructor(){this.timer=null,this.updateMenu=()=>{const e=$(Identifiers.toolbarIconSelector,Identifiers.containerSelector),t=e.clone(),o=$(Identifiers.containerSelector).find(Identifiers.menuContainerSelector);null!==this.timer&&(clearTimeout(this.timer),this.timer=null),Icons.getIcon("spinner-circle-light",Icons.sizes.small).then(t=>{e.replaceWith(t)}),new AjaxRequest(TYPO3.settings.ajaxUrls.systeminformation_render).get().then(async e=>{o.html(await e.resolve()),SystemInformationMenu.updateCounter(),$(Identifiers.moduleLinks).on("click",this.openModule)}).finally(()=>{$(Identifiers.toolbarIconSelector,Identifiers.containerSelector).replaceWith(t),this.timer=setTimeout(this.updateMenu,3e5)})},Viewport.Topbar.Toolbar.registerEvent(this.updateMenu)}static updateCounter(){const e=$(Identifiers.containerSelector).find(Identifiers.menuContainerSelector).find(".t3js-systeminformation-container"),t=$(Identifiers.counter),o=e.data("count"),n=e.data("severityclass");t.text(o).toggle(parseInt(o,10)>0),t.removeClass(),t.addClass("t3js-systeminformation-counter toolbar-item-badge badge rounded-pill"),""!==n&&t.addClass(n)}openModule(e){e.preventDefault(),e.stopPropagation();let t={};const o={},n=$(e.currentTarget).data("modulename"),r=$(e.currentTarget).data("moduleparams"),i=Math.floor((new Date).getTime()/1e3);PersistentStorage.isset("systeminformation")&&(t=JSON.parse(PersistentStorage.get("systeminformation"))),o[n]={lastAccess:i},$.extend(!0,t,o);PersistentStorage.set("systeminformation",JSON.stringify(t)).done(()=>{TYPO3.ModuleMenu.App.showModule(n,r),Viewport.Topbar.refresh()})}}export default new SystemInformationMenu;