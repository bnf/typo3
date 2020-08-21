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
define(["jquery","./ElementBrowser"],(function(e,t){"use strict";return new class{constructor(){e(()=>{e("[data-close]").on("click",n=>{n.preventDefault();const r=e(n.currentTarget).parents("span").data();t.insertElement(r.table,r.uid,"db",r.title,"","",r.icon,"",1===parseInt(e(n.currentTarget).data("close"),10))})});const n=document.getElementById("db_list-searchbox-toolbar");n.style.display="block",n.style.position="relative"}}}));