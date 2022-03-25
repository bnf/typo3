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
import $ from"jquery";import Modal from"@typo3/backend/modal.js";class ImportExport{constructor(){$(()=>{$(document).on("click",".t3js-confirm-trigger",t=>{const e=$(t.currentTarget),o=Modal.confirm(e.data("title"),e.data("message"));o.addEventListener("confirm.button.ok",()=>{$("#t3js-submit-field").attr("name",e.attr("name")).closest("form").trigger("submit"),o.hideModal()}),o.addEventListener("confirm.button.cancel",()=>{o.hideModal()})}),$(".t3js-impexp-toggledisabled").on("click",()=>{const t=$('table.t3js-impexp-preview tr[data-active="hidden"] input.t3js-exclude-checkbox');if(t.length){const e=t.get(0);t.prop("checked",!e.checked)}})})}}export default new ImportExport;