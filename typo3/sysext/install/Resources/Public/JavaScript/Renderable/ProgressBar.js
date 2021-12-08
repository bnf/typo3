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
var __importDefault=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};define(["require","exports","jquery","TYPO3/CMS/Install/Renderable/Severity"],(function(e,r,s,a){"use strict";s=__importDefault(s);return new class{constructor(){this.template=s.default('<div class="progress"><div class="t3js-progressbar progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%"> <span></span></div></div>')}render(e,r,s){let t=this.template.clone();return t.addClass("progress-bar-"+a.getCssClass(e)),s&&(t.css("width",s+"%"),t.attr("aria-valuenow",s)),r&&t.find("span").text(r),t}}}));