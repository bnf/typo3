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
import e from"@typo3/core/event/regular-event.js"
import r from"@typo3/core/document-service.js"
export default new class{constructor(){this.searchField=document.querySelector("#tx_Beuser_username"),this.activeSearch=!!this.searchField&&""!==this.searchField.value,r.ready().then((()=>{this.searchField&&new e("search",(()=>{""===this.searchField.value&&this.activeSearch&&this.searchField.closest("form").submit()})).bindTo(this.searchField)}))}}
