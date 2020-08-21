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
define(["jquery","TYPO3/CMS/Core/Ajax/AjaxRequest"],(function(e,s){"use strict";return class{constructor(){this.expandedUploadFormClass="transformed"}initializeEvents(){e(document).on("click",".t3js-upload",t=>{const a=e(t.currentTarget),o=e(".extension-upload-form");t.preventDefault(),a.hasClass(this.expandedUploadFormClass)?(o.stop().slideUp(),a.removeClass(this.expandedUploadFormClass)):(a.addClass(this.expandedUploadFormClass),o.stop().slideDown(),new s(a.attr("href")).get().then(async e=>{o.find(".t3js-upload-form-target").html(await e.resolve())}))})}}}));