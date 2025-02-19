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
import e from"@typo3/backend/link-browser.js";import t from"@typo3/core/event/regular-event.js";var o=new class{constructor(){new t("click",((t,o)=>{t.preventDefault();const n=o.closest("span").dataset;e.finalizeFunction(document.body.dataset.linkbrowserIdentifier+n.uid)})).delegateTo(document,"[data-close]")}};export{o as default};