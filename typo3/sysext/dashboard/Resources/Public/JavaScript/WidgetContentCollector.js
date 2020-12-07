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
define(["TYPO3/CMS/Core/Ajax/AjaxRequest","TYPO3/CMS/Core/Event/RegularEvent"],(function(e,t){"use strict";return new class{constructor(){this.selector=".dashboard-item",this.initialize()}initialize(){this.registerEvents();document.querySelectorAll(this.selector).forEach(e=>{let t;t=new Event("widgetRefresh",{bubbles:!0}),e.dispatchEvent(t)})}registerEvents(){new t("widgetRefresh",(e,t)=>{e.preventDefault(),this.getContentForWidget(t)}).delegateTo(document,this.selector)}getContentForWidget(t){const s=t.querySelector(".widget-waiting"),n=t.querySelector(".widget-content"),i=t.querySelector(".widget-error");s.classList.remove("hide"),n.classList.add("hide"),i.classList.add("hide");new e(TYPO3.settings.ajaxUrls.dashboard_get_widget_content).withQueryArguments({widget:t.dataset.widgetKey}).get().then(async e=>{const i=await e.resolve();let r;null!==n&&(n.innerHTML=i.content,n.classList.remove("hide")),null!==s&&s.classList.add("hide");const d={bubbles:!0};r=Object.keys(i.eventdata).length>0?new CustomEvent("widgetContentRendered",Object.assign(Object.assign({},d),{detail:i.eventdata})):new Event("widgetContentRendered",d),t.dispatchEvent(r)}).catch(e=>{null!==i&&i.classList.remove("hide"),null!==s&&s.classList.add("hide"),console.warn(`Error while retrieving widget [${t.dataset.widgetKey}] content: ${e.message}`)})}}}));