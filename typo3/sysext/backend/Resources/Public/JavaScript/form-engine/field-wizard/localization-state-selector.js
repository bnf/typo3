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
import e from"@typo3/core/document-service.js"
import t from"@typo3/core/event/regular-event.js"
var a
!function(e){e.CUSTOM="custom"}(a||(a={}))
export default class{constructor(t){e.ready().then((()=>{this.registerEventHandler(t)}))}registerEventHandler(e){new t("change",(e=>{const t=e.target,n=t.closest(".t3js-formengine-field-item")?.querySelector("[data-formengine-input-name]")
if(!n)return
const r=n.dataset.lastL10nState||!1,s=t.value
r&&s===r||(s===a.CUSTOM?(r&&(t.dataset.originalLanguageValue=n.value),n.disabled=!1):(r===a.CUSTOM&&(t.closest(".t3js-l10n-state-container").querySelector(".t3js-l10n-state-custom").dataset.originalLanguageValue=n.value),n.disabled=!0),n.value=t.dataset.originalLanguageValue,n.dispatchEvent(new Event("change")),n.dataset.lastL10nState=t.value)})).delegateTo(document,'.t3js-l10n-state-container input[type="radio"][name="'+e+'"]')}}