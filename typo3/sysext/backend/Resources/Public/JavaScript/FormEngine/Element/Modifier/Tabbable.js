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
define(["require"],(function(e){"use strict";return{Tabbable:class{static enable(t){t.classList.contains("t3js-enable-tab")&&new Promise((function(t,n){e(["taboverride"],(function(e){t("object"==typeof e?Object.defineProperty(e,"default",{value:e,enumerable:!1}):{default:e})}),n)})).then(({default:e})=>{e.set(t)})}}}}));