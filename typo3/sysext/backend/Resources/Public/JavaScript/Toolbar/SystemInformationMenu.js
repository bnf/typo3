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
define(["jquery","TYPO3/CMS/Core/Ajax/AjaxRequest","../Icons","../Storage/Persistent","../Viewport"],(function(e,t,o,n,r){"use strict";var s;!function(e){e.containerSelector="#typo3-cms-backend-backend-toolbaritems-systeminformationtoolbaritem",e.toolbarIconSelector=".toolbar-item-icon .t3js-icon",e.menuContainerSelector=".dropdown-menu",e.moduleLinks=".t3js-systeminformation-module",e.counter=".t3js-systeminformation-counter"}(s||(s={}));class a{constructor(){this.timer=null,this.updateMenu=()=>{const n=e(s.toolbarIconSelector,s.containerSelector),r=n.clone(),i=e(s.containerSelector).find(s.menuContainerSelector);null!==this.timer&&(clearTimeout(this.timer),this.timer=null),o.getIcon("spinner-circle-light",o.sizes.small).then(e=>{n.replaceWith(e)}),new t(TYPO3.settings.ajaxUrls.systeminformation_render).get().then(async t=>{i.html(await t.resolve()),a.updateCounter(),e(s.moduleLinks).on("click",this.openModule)}).finally(()=>{e(s.toolbarIconSelector,s.containerSelector).replaceWith(r),this.timer=setTimeout(this.updateMenu,3e5)})},r.Topbar.Toolbar.registerEvent(this.updateMenu)}static updateCounter(){const t=e(s.containerSelector).find(s.menuContainerSelector).find(".t3js-systeminformation-container"),o=e(s.counter),n=t.data("count"),r=t.data("severityclass");o.text(n).toggle(parseInt(n,10)>0),o.removeClass(),o.addClass("t3js-systeminformation-counter toolbar-item-badge badge"),""!==r&&o.addClass(r)}openModule(t){t.preventDefault(),t.stopPropagation();let o={};const s={},a=e(t.currentTarget).data("modulename"),i=e(t.currentTarget).data("moduleparams"),l=Math.floor((new Date).getTime()/1e3);n.isset("systeminformation")&&(o=JSON.parse(n.get("systeminformation"))),s[a]={lastAccess:l},e.extend(!0,o,s);n.set("systeminformation",JSON.stringify(o)).done(()=>{TYPO3.ModuleMenu.App.showModule(a,i),r.Topbar.refresh()})}}return new a}));