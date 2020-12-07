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
define(["jquery","TYPO3/CMS/Backend/Modal","TYPO3/CMS/Backend/Enum/Severity","TYPO3/CMS/Core/Event/RegularEvent"],(function(e,t,i,s){"use strict";return new class{constructor(){this.selector=".js-dashboard-addWidget",this.initialize()}initialize(){new s("click",(function(s){s.preventDefault();const a={type:t.types.default,title:this.dataset.modalTitle,size:t.sizes.medium,severity:i.SeverityEnum.notice,content:e(document.getElementById("widgetSelector").innerHTML),additionalCssClasses:["dashboard-modal"],callback:e=>{e.on("click","a.dashboard-modal-item-block",t=>{e.trigger("modal-dismiss")})}};t.advanced(a)})).delegateTo(document,this.selector),document.querySelectorAll(this.selector).forEach(e=>{e.classList.remove("hide")})}}}));