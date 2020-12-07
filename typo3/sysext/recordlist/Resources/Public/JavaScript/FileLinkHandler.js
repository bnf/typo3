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
define(["jquery","./LinkBrowser","TYPO3/CMS/Backend/LegacyTree"],(function(n,t,i){"use strict";return new class{constructor(){this.currentLink="",this.linkFile=i=>{i.preventDefault(),t.finalizeFunction(n(i.currentTarget).attr("href"))},this.linkCurrent=n=>{n.preventDefault(),t.finalizeFunction(this.currentLink)},i.noop(),n(()=>{this.currentLink=n("body").data("currentLink"),n("a.t3js-fileLink").on("click",this.linkFile),n("input.t3js-linkCurrent").on("click",this.linkCurrent)})}}}));