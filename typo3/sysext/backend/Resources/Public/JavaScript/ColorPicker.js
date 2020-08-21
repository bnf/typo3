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
define(["jquery","TYPO3/CMS/Core/Contrib/jquery.minicolors"],(function(t){"use strict";return new class{constructor(){this.selector=".t3js-color-picker"}initialize(){t(this.selector).minicolors({format:"hex",position:"bottom left",theme:"bootstrap"}),t(document).on("change",".t3js-colorpicker-value-trigger",e=>{const o=t(e.target);""!==o.val()&&(o.closest(".t3js-formengine-field-item").find(".t3js-color-picker").val(o.val()).trigger("paste"),o.val(""))}),t(document).on("blur",".t3js-color-picker",e=>{const o=t(e.target);o.closest(".t3js-formengine-field-item").find('input[type="hidden"]').val(o.val()),""===o.val()&&o.trigger("paste")})}}}));