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
define(["jquery","./Severity"],(function(e,s){"use strict";return new class{constructor(){this.template=e('<div class="t3js-message typo3-message alert"><h4></h4><p class="messageText"></p></div>')}render(e,t,a){let r=this.template.clone();return r.addClass("alert-"+s.getCssClass(e)),t&&r.find("h4").text(t),a?r.find(".messageText").text(a):r.find(".messageText").remove(),r}}}));