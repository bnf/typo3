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
define(["./LinkBrowser","TYPO3/CMS/Core/Event/RegularEvent"],(function(e,t){"use strict";return new class{constructor(){new t("click",(t,n)=>{t.preventDefault();const c=n.closest("span").dataset;e.finalizeFunction(document.body.dataset.identifier+c.uid)}).delegateTo(document,"[data-close]"),new t("click",(t,n)=>{t.preventDefault(),e.finalizeFunction(document.body.dataset.currentLink)}).delegateTo(document,"input.t3js-linkCurrent")}}}));