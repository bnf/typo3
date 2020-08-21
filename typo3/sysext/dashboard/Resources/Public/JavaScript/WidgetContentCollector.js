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
define(["TYPO3/CMS/Core/Ajax/AjaxRequest"],(function(e){"use strict";return new class{constructor(){this.selector=".dashboard-item",this.initialize()}initialize(){document.querySelectorAll(this.selector).forEach(t=>{const n=t.querySelector(".widget-waiting"),s=t.querySelector(".widget-content"),i=t.querySelector(".widget-error");new e(TYPO3.settings.ajaxUrls.dashboard_get_widget_content).withQueryArguments({widget:t.dataset.widgetKey}).get().then(async e=>{const i=await e.resolve();let a;null!==s&&(s.innerHTML=i.content,s.classList.remove("hide")),null!==n&&n.classList.add("hide");const r={bubbles:!0};a=Object.keys(i.eventdata).length>0?new CustomEvent("widgetContentRendered",Object.assign(Object.assign({},r),{detail:i.eventdata})):new Event("widgetContentRendered",r),t.dispatchEvent(a)}).catch(e=>{null!==i&&i.classList.remove("hide"),null!==n&&n.classList.add("hide"),console.warn(`Error while retrieving widget [${t.dataset.widgetKey}] content: ${e.message}`)})})}}}));