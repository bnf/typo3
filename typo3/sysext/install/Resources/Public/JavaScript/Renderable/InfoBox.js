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
var __importDefault=this&&this.__importDefault||function(t){return t&&t.__esModule?t:{default:t}};define(["require","exports","jquery","TYPO3/CMS/Install/Renderable/Severity"],(function(t,e,l,s){"use strict";l=__importDefault(l);return new class{constructor(){this.template=l.default('<div class="t3js-infobox callout callout-sm"><h4 class="callout-title"></h4><div class="callout-body"></div></div>')}render(t,e,l){let a=this.template.clone();return a.addClass("callout-"+s.getCssClass(t)),e&&a.find("h4").text(e),l?a.find(".callout-body").text(l):a.find(".callout-body").remove(),a}}}));