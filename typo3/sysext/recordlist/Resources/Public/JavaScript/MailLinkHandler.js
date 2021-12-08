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
var __importDefault=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};define(["require","exports","TYPO3/CMS/Recordlist/LinkBrowser","TYPO3/CMS/Core/Event/RegularEvent"],(function(e,t,r,i){"use strict";i=__importDefault(i);return new class{constructor(){new i.default("submit",(e,t)=>{e.preventDefault();let i=t.querySelector('[name="lemail"]').value;if("mailto:"!==i){for(;"mailto:"===i.substr(0,7);)i=i.substr(7);r.finalizeFunction("mailto:"+i)}}).delegateTo(document,"#lmailform")}}}));