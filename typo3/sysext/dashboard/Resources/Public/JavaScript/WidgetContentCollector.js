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
import AjaxRequest from"@typo3/core/Ajax/AjaxRequest.js";import RegularEvent from"@typo3/core/Event/RegularEvent.js";class WidgetContentCollector{constructor(){this.selector=".dashboard-item",this.initialize()}initialize(){this.registerEvents();document.querySelectorAll(this.selector).forEach(e=>{let t;t=new Event("widgetRefresh",{bubbles:!0}),e.dispatchEvent(t)})}registerEvents(){new RegularEvent("widgetRefresh",(e,t)=>{e.preventDefault(),this.getContentForWidget(t)}).delegateTo(document,this.selector)}getContentForWidget(e){const t=e.querySelector(".widget-waiting"),s=e.querySelector(".widget-content"),n=e.querySelector(".widget-error");t.classList.remove("hide"),s.classList.add("hide"),n.classList.add("hide");new AjaxRequest(TYPO3.settings.ajaxUrls.dashboard_get_widget_content).withQueryArguments({widget:e.dataset.widgetKey}).get().then(async n=>{const i=await n.resolve();let r;null!==s&&(s.innerHTML=i.content,s.classList.remove("hide")),null!==t&&t.classList.add("hide");const o={bubbles:!0};r=Object.keys(i.eventdata).length>0?new CustomEvent("widgetContentRendered",Object.assign(Object.assign({},o),{detail:i.eventdata})):new Event("widgetContentRendered",o),e.dispatchEvent(r)}).catch(s=>{null!==n&&n.classList.remove("hide"),null!==t&&t.classList.add("hide"),console.warn(`Error while retrieving widget [${e.dataset.widgetKey}] content: ${s.message}`)})}}export default new WidgetContentCollector;