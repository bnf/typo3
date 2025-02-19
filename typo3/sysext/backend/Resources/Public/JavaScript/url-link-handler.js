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
import e from"@typo3/backend/link-browser.js";import r from"@typo3/core/event/regular-event.js";var t=new class{constructor(){new r("submit",((r,t)=>{r.preventDefault();const o=t.querySelector('[name="lurl"]').value.trim();""!==o&&e.finalizeFunction(o)})).delegateTo(document,"#lurlform")}};export{t as default};