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
var __importDefault=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};define(["require","exports","TYPO3/CMS/Recordlist/ElementBrowser","TYPO3/CMS/Core/Event/RegularEvent"],(function(e,t,r,s){"use strict";s=__importDefault(s);return new class{constructor(){new s.default("click",(e,t)=>{e.preventDefault();const s=t.closest("span").dataset;r.insertElement(s.table,s.uid,s.title,"",1===parseInt(t.dataset.close||"0",10))}).delegateTo(document,"[data-close]")}}}));