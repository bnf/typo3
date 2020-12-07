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
define(["jquery","./DocumentHeader","TYPO3/CMS/Backend/Input/Clearable"],(function(e,t){"use strict";return new class{constructor(){e(()=>{this.initialize()})}initialize(){const i=e("#db_list-searchbox-toolbar");let l;if(e(".t3js-toggle-search-toolbox").on("click",()=>{i.toggle(),t.reposition(),i.is(":visible")&&e("#search_field").focus()}),null!==(l=document.getElementById("search_field"))){const e=""!==l.value;l.clearable({onClear:t=>{e&&t.closest("form").trigger("submit")}})}}}}));