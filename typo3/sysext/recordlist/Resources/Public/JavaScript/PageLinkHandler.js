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
define(["./LinkBrowser","TYPO3/CMS/Core/Event/RegularEvent"],(function(e,t){"use strict";return new class{constructor(){this.linkPageByTextfield=()=>{let t=document.getElementById("luid").value;if(!t)return;const n=parseInt(t,10);isNaN(n)||(t="t3://page?uid="+n),e.finalizeFunction(t)},new t("click",(t,n)=>{t.preventDefault(),e.finalizeFunction(n.getAttribute("href"))}).delegateTo(document,"a.t3js-pageLink"),new t("click",(t,n)=>{t.preventDefault(),e.finalizeFunction(document.body.dataset.currentLink)}).delegateTo(document,"input.t3js-linkCurrent"),new t("click",(e,t)=>{e.preventDefault(),this.linkPageByTextfield()}).delegateTo(document,"input.t3js-pageLink")}}}));