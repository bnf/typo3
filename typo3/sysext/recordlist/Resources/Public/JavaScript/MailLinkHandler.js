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
define(["./LinkBrowser","TYPO3/CMS/Core/Event/RegularEvent"],(function(e,t){"use strict";return new class{constructor(){new t("submit",(t,n)=>{t.preventDefault();let r=n.querySelector('[name="lemail"]').value;if("mailto:"!==r){for(;"mailto:"===r.substr(0,7);)r=r.substr(7);e.finalizeFunction("mailto:"+r)}}).delegateTo(document,"#lmailform")}}}));