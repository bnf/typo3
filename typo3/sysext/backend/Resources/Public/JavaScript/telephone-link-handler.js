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
import e from"@typo3/backend/link-browser.js";import t from"@typo3/core/event/regular-event.js";export default new class{constructor(){new t("submit",((t,o)=>{t.preventDefault();let r=o.querySelector('[name="ltelephone"]').value;"tel:"!==r&&(r.startsWith("tel:")&&(r=r.substr(4)),e.finalizeFunction("tel:"+r))})).delegateTo(document,"#ltelephoneform")}};