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
import DocumentService from"TYPO3/CMS/Core/DocumentService";import RegularEvent from"TYPO3/CMS/Core/Event/RegularEvent";var States;!function(e){e.CUSTOM="custom"}(States||(States={}));class LocalizationStateSelector{constructor(e){DocumentService.ready().then(()=>{this.registerEventHandler(e)})}registerEventHandler(e){new RegularEvent("change",e=>{var t;const a=e.target,n=null===(t=a.closest(".t3js-formengine-field-item"))||void 0===t?void 0:t.querySelector("[data-formengine-input-name]");if(!n)return;const r=n.dataset.lastL10nState||!1,o=a.value;r&&o===r||(o===States.CUSTOM?(r&&(a.dataset.originalLanguageValue=n.value),n.disabled=!1):(r===States.CUSTOM&&(a.closest(".t3js-l10n-state-container").querySelector(".t3js-l10n-state-custom").dataset.originalLanguageValue=n.value),n.disabled=!0),n.value=a.dataset.originalLanguageValue,n.dispatchEvent(new Event("change")),n.dataset.lastL10nState=a.value)}).delegateTo(document,'.t3js-l10n-state-container input[type="radio"][name="'+e+'"]')}}export default LocalizationStateSelector;