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
define(["jquery","TYPO3/CMS/Backend/Modal"],(function(t,e){"use strict";return new class{constructor(){t(()=>{t(document).on("click",".t3js-confirm-trigger",c=>{const r=t(c.currentTarget);e.confirm(r.data("title"),r.data("message")).on("confirm.button.ok",()=>{t("#t3js-submit-field").attr("name",r.attr("name")).closest("form").trigger("submit"),e.currentModal.trigger("modal-dismiss")}).on("confirm.button.cancel",()=>{e.currentModal.trigger("modal-dismiss")})}),t(".t3js-impexp-toggledisabled").on("click",()=>{const e=t('table.t3js-impexp-preview tr[data-active="hidden"] input.t3js-exclude-checkbox');if(e.length){const t=e.get(0);e.prop("checked",!t.checked)}})})}}}));