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
import s from"@typo3/core/ajax/ajax-request.js";const i={tree_rootline:"/page/tree/rootline",tree_configuration:"/page/tree/configuration",tree_browser_configuration:"/browser/page/tree/configuration",resource_rename:"/resource/rename",resource_gather:"/resource/gather",categories_get:"/dashboards/categories",dashboard_add:"/dashboards",dashboard_delete:"/dashboards/{dashboardIdentifier}",dashboard_edit:"/dashboards/{dashboardIdentifier}",dashboard_update:"/dashboards/{dashboardIdentifier}/widgetPositions",dashboards_get:"/dashboards",presets_get:"/dashboards/presets",widget_add:"/dashboards/{dashboardIdentifier}/widgets",widget_delete:"/dashboards/{dashboardIdentifier}/widgets/{widgetIdentifier}",widget_get:"/dashboards/{dashboardIdentifier}/widgets/{widgetIdentifier}",widget_settings_get:"/dashboards/{dashboardIdentifier}/widgets/{widgetIdentifier}/settings",widget_settings_update:"/dashboards/{dashboardIdentifier}/widgets/{widgetIdentifier}/settings"},o=t=>{const{apiPrefix:d}=top.document.body.dataset;if(d===void 0)throw new Error("Missing data-api-prefix attribute on top <body>");const e=i[t]??t;return e.startsWith(d)?e:e.startsWith("/")?d+e:e},n=(t,d)=>Object.entries(d).reduce((e,[r,a])=>e.replaceAll("{"+r+"}",a),t),g=(t,d={})=>new s(n(o(t),d)).addMiddleware(async(e,r)=>(e.headers.append("Authorization","Bearer "+top.document.body.dataset.apiToken),r(e)));export{g as action};
