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
define(["jquery","./LinkBrowser"],(function(t,i){"use strict";return new class{constructor(){this.currentLink="",this.identifier="",this.linkRecord=n=>{n.preventDefault();const e=t(n.currentTarget).parents("span").data();i.finalizeFunction(this.identifier+e.uid)},this.linkCurrent=t=>{t.preventDefault(),i.finalizeFunction(this.currentLink)},t(()=>{const i=t("body");this.currentLink=i.data("currentLink"),this.identifier=i.data("identifier");const n=document.getElementById("db_list-searchbox-toolbar");n.style.display="block",n.style.position="relative",t("[data-close]").on("click",this.linkRecord),t("input.t3js-linkCurrent").on("click",this.linkCurrent)})}}}));