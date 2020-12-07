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
define(["jquery","./Severity"],(function(s,r){"use strict";return new class{constructor(){this.template=s('<div class="progress"><div class="t3js-progressbar progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%"> <span></span></div></div>')}render(s,e,a){let t=this.template.clone();return t.addClass("progress-bar-"+r.getCssClass(s)),a&&(t.css("width",a+"%"),t.attr("aria-valuenow",a)),e&&t.find("span").text(e),t}}}));