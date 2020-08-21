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
define(["jquery","./LinkBrowser"],(function(n,t){"use strict";return new class{constructor(){this.currentLink="",this.linkPage=i=>{i.preventDefault(),t.finalizeFunction(n(i.currentTarget).attr("href"))},this.linkPageByTextfield=i=>{i.preventDefault();let e=n("#luid").val();if(!e)return;const r=parseInt(e,10);isNaN(r)||(e="t3://page?uid="+r),t.finalizeFunction(e)},this.linkCurrent=n=>{n.preventDefault(),t.finalizeFunction(this.currentLink)},n(()=>{this.currentLink=n("body").data("currentLink"),n("a.t3js-pageLink").on("click",this.linkPage),n("input.t3js-linkCurrent").on("click",this.linkCurrent),n("input.t3js-pageLink").on("click",this.linkPageByTextfield)})}}}));