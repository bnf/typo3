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
define(["./ElementBrowser","TYPO3/CMS/Core/Event/RegularEvent"],(function(e,t){"use strict";return new class{constructor(){new t("click",(t,n)=>{t.preventDefault();const s=n.closest("span").dataset;e.insertElement(s.table,s.uid,s.title,"",1===parseInt(n.dataset.close||"0",10))}).delegateTo(document,"[data-close]")}}}));