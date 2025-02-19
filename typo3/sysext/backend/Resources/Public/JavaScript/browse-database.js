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
import e from"@typo3/backend/element-browser.js";import t from"@typo3/core/event/regular-event.js";export default new class{constructor(){new t("click",((t,o)=>{t.preventDefault();const s=o.closest("span").dataset;e.insertElement(s.table,s.uid,s.title,"",1===parseInt(o.dataset.close||"0",10))})).delegateTo(document,"[data-close]")}};