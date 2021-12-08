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
var __importDefault=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};define(["require","exports","TYPO3/CMS/Recordlist/LinkBrowser","TYPO3/CMS/Core/Event/RegularEvent"],(function(e,t,n,i){"use strict";i=__importDefault(i);return new class{constructor(){new i.default("click",(e,t)=>{e.preventDefault();const i=t.closest("span").dataset;n.finalizeFunction(document.body.dataset.identifier+i.uid)}).delegateTo(document,"[data-close]"),new i.default("click",(e,t)=>{e.preventDefault(),n.finalizeFunction(document.body.dataset.currentLink)}).delegateTo(document,"input.t3js-linkCurrent")}}}));