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
define(["../Enum/Severity","../Modal","TYPO3/CMS/Backend/NewContentElementWizard"],(function(e,n,d){"use strict";return class{static wizard(t,a){const o=n.advanced({callback:e=>{e.find(".t3js-modal-body").addClass("t3-new-content-element-wizard-window")},content:t,severity:e.SeverityEnum.notice,size:n.sizes.medium,title:a,type:n.types.ajax}).on("modal-loaded",()=>{o.on("shown.bs.modal",()=>{new d(o).focusSearchField()})}).on("shown.bs.modal",()=>{o.on("modal-loaded",()=>{new d(o).focusSearchField()})})}}}));