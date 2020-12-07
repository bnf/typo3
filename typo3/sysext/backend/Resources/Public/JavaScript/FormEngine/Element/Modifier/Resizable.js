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
define(["require"],(function(e){"use strict";return{Resizable:class{static enable(t){new Promise((function(t,n){e(["autosize"],(function(e){t("object"!=typeof e||"default"in e?{default:e}:Object.defineProperty(e,"default",{value:e,enumerable:!1}))}),n)})).then(({default:e})=>{e(t)})}}}}));