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
import ElementBrowser from"@typo3/Recordlist/ElementBrowser.js";import RegularEvent from"@typo3/core/Event/RegularEvent.js";class BrowseDatabase{constructor(){new RegularEvent("click",(e,t)=>{e.preventDefault();const a=t.closest("span").dataset;ElementBrowser.insertElement(a.table,a.uid,a.title,"",1===parseInt(t.dataset.close||"0",10))}).delegateTo(document,"[data-close]")}}export default new BrowseDatabase;