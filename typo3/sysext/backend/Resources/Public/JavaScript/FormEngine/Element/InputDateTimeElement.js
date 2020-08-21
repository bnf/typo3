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
define(["require","TYPO3/CMS/Core/DocumentService","TYPO3/CMS/Backend/FormEngine","TYPO3/CMS/Core/Event/RegularEvent"],(function(e,t,n,i){"use strict";return class{constructor(n){this.element=null,t.ready().then(()=>{this.element=document.getElementById(n),this.registerEventHandler(),new Promise((function(t,n){e(["../../DateTimePicker"],(function(e){t("object"!=typeof e||"default"in e?{default:e}:Object.defineProperty(e,"default",{value:e,enumerable:!1}))}),n)})).then(({default:e})=>{e.initialize(this.element)})})}registerEventHandler(){new i("formengine.dp.change",e=>{n.Validation.validate(),n.Validation.markFieldAsChanged(e.detail.element),document.querySelectorAll(".module-docheader-bar .btn").forEach(e=>{e.classList.remove("disabled"),e.disabled=!1})}).bindTo(document)}}}));