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
define(["require","jquery","TYPO3/CMS/Backend/FormEngine"],(function(e,i,n){"use strict";return class{constructor(n){i(()=>{this.registerEventHandler(),e(["../../DateTimePicker"],e=>{e.initialize("#"+n)})})}registerEventHandler(){i(document).on("formengine.dp.change",(e,r)=>{n.Validation.validate(),n.Validation.markFieldAsChanged(r),i(".module-docheader-bar .btn").removeClass("disabled").prop("disabled",!1)})}}}));