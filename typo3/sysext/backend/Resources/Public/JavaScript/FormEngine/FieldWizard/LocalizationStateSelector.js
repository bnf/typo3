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
define(["TYPO3/CMS/Core/DocumentService","TYPO3/CMS/Core/Event/RegularEvent"],(function(e,t){"use strict";var a;!function(e){e.CUSTOM="custom"}(a||(a={}));return class{constructor(t){e.ready().then(()=>{this.registerEventHandler(t)})}registerEventHandler(e){new t("change",e=>{var t;const n=e.target,r=null===(t=n.closest(".t3js-formengine-field-item"))||void 0===t?void 0:t.querySelector("[data-formengine-input-name]");if(!r)return;const s=r.dataset.lastL10nState||!1,l=n.value;s&&l===s||(l===a.CUSTOM?(s&&(n.dataset.originalLanguageValue=r.value),r.disabled=!1):(s===a.CUSTOM&&(n.closest(".t3js-l10n-state-container").querySelector(".t3js-l10n-state-custom").dataset.originalLanguageValue=r.value),r.disabled=!0),r.value=n.dataset.originalLanguageValue,r.dispatchEvent(new Event("change")),r.dataset.lastL10nState=n.value)}).delegateTo(document,'.t3js-l10n-state-container input[type="radio"][name="'+e+'"]')}}}));