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
define(["jquery"],(function(t){"use strict";var a;!function(t){t.CUSTOM="custom"}(a||(a={}));return class{constructor(a){t(()=>{this.registerEventHandler(a)})}registerEventHandler(e){t(document).on("change",'.t3js-l10n-state-container input[type="radio"][name="'+e+'"]',e=>{const n=t(e.currentTarget),r=n.closest(".t3js-formengine-field-item").find("[data-formengine-input-name]");if(0===r.length)return;const l=r.data("last-l10n-state")||!1,s=n.val();l&&s===l||(s===a.CUSTOM?(l&&n.attr("data-original-language-value",r.val()),r.removeAttr("disabled")):(l===a.CUSTOM&&n.closest(".t3js-l10n-state-container").find(".t3js-l10n-state-custom").attr("data-original-language-value",r.val()),r.attr("disabled","disabled")),r.val(n.attr("data-original-language-value")).trigger("change"),r.data("last-l10n-state",n.val()))})}}}));