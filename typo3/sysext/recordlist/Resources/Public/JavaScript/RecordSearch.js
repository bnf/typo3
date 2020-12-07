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
define(["TYPO3/CMS/Core/DocumentService","TYPO3/CMS/Core/Event/RegularEvent"],(function(e,r){"use strict";var c;!function(e){e.searchFieldSelector="#search_field"}(c||(c={}));return new class{constructor(){this.searchField=document.querySelector(c.searchFieldSelector),this.activeSearch=!!this.searchField&&""!==this.searchField.value,e.ready().then(()=>{this.searchField&&new r("search",()=>{""===this.searchField.value&&this.activeSearch&&this.searchField.closest("form").submit()}).bindTo(this.searchField)})}}}));