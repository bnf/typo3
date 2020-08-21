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
define(["jquery","TYPO3/CMS/Core/Ajax/AjaxRequest","../Icons","../Notification","../Viewport"],(function(e,t,c,o,r){"use strict";var n;!function(e){e.containerSelector="#typo3-cms-backend-backend-toolbaritems-clearcachetoolbaritem",e.menuItemSelector="a.toolbar-cache-flush-action",e.toolbarIconSelector=".toolbar-item-icon .t3js-icon"}(n||(n={}));return new class{constructor(){this.initializeEvents=()=>{e(n.containerSelector).on("click",n.menuItemSelector,t=>{t.preventDefault();const c=e(t.currentTarget).attr("href");c&&this.clearCache(c)})},r.Topbar.Toolbar.registerEvent(this.initializeEvents)}clearCache(r){e(n.containerSelector).removeClass("open");const a=e(n.toolbarIconSelector,n.containerSelector),s=a.clone();c.getIcon("spinner-circle-light",c.sizes.small).then(e=>{a.replaceWith(e)}),new t(r).post({}).then(async e=>{const t=await e.resolve();!0===t.success?o.success(t.title,t.message):!1===t.success&&o.error(t.title,t.message)},()=>{o.error(TYPO3.lang["flushCaches.error"],TYPO3.lang["flushCaches.error.description"])}).finally(()=>{e(n.toolbarIconSelector,n.containerSelector).replaceWith(s)})}}}));