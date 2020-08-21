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
define(["jquery","TYPO3/CMS/Backend/Notification"],(function(t,e){"use strict";return new class{constructor(){this.initializeEvents()}toggleActionButton(e){let i=!0;t("."+e).each((e,n)=>{t(n).prop("checked")&&(i=!1)}),"check"===e?t("#updateLinkList").prop("disabled",i):t("#refreshLinkList").prop("disabled",i)}initializeEvents(){t(".refresh").on("click",()=>{this.toggleActionButton("refresh")}),t(".check").on("click",()=>{this.toggleActionButton("check")}),t(".t3js-update-button").on("click",i=>{const n=t(i.currentTarget),c=n.attr("name");let s="Event triggered";"refreshLinkList"!==c&&"updateLinkList"!==c||(s=n.data("notification-message")),e.success(s)})}}}));