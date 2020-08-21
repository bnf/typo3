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
define(["jquery"],(function(e){"use strict";return new class{constructor(){this.initialize=(t,s)=>{let n=e(t),c=n.prev(".input-group-icon");s=s||{},n.on("change",t=>{let s=e(t.target);c.html(n.find(":selected").data("icon"));let i=s.closest(".t3js-formengine-field-item").find(".t3js-forms-select-single-icons");i.find(".item.active").removeClass("active"),i.find('[data-select-index="'+s.prop("selectedIndex")+'"]').closest(".item").addClass("active")}),"function"==typeof s.onChange&&n.on("change",s.onChange),"function"==typeof s.onFocus&&n.on("focus",s.onFocus),n.closest(".form-control-wrap").find(".t3js-forms-select-single-icons a").on("click",t=>{let s=e(t.target),c=s.closest("[data-select-index]");return s.closest(".t3js-forms-select-single-icons").find(".item.active").removeClass("active"),n.prop("selectedIndex",c.data("selectIndex")).trigger("change"),c.closest(".item").addClass("active"),!1})}}}}));