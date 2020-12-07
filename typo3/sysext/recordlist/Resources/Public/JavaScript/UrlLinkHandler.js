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
define(["./LinkBrowser","TYPO3/CMS/Core/Event/RegularEvent"],(function(e,n){"use strict";return new class{constructor(){new n("submit",(n,t)=>{n.preventDefault();let r=t.querySelector('[name="lurl"]').value;""!==r&&e.finalizeFunction(r)}).delegateTo(document,"#lurlform")}}}));