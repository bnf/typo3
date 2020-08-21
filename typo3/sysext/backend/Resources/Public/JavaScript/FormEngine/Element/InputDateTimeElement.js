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
define(["require","jquery","TYPO3/CMS/Backend/FormEngine"],(function(e,n,t){"use strict";return class{constructor(t){n(()=>{this.registerEventHandler(),new Promise((function(n,t){e(["../../DateTimePicker"],(function(e){n("object"==typeof e?Object.defineProperty(e,"default",{value:e,enumerable:!1}):{default:e})}),t)})).then(({default:e})=>{e.initialize("#"+t)})})}registerEventHandler(){n(document).on("formengine.dp.change",(e,i)=>{t.Validation.validate(),t.Validation.markFieldAsChanged(i),n(".module-docheader-bar .btn").removeClass("disabled").prop("disabled",!1)})}}}));