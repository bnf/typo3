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
import{MultiRecordSelectionSelectors as t}from"@typo3/backend/multi-record-selection.js"
export class MultiRecordSelectionAction{static getEntityIdentifiers(e){const o=[]
return e.checkboxes.forEach((i=>{const c=i.closest(t.elementSelector)
null!==c&&c.dataset[e.configuration.idField]&&o.push(c.dataset[e.configuration.idField])})),o}}