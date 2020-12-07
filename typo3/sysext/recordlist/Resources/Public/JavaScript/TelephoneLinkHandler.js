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
define(["./LinkBrowser","TYPO3/CMS/Core/Event/RegularEvent"],(function(e,t){"use strict";return new class{constructor(){new t("submit",(t,n)=>{t.preventDefault();let l=n.querySelector('[name="ltelephone"]').value;"tel:"!==l&&(l.startsWith("tel:")&&(l=l.substr(4)),e.finalizeFunction("tel:"+l))}).delegateTo(document,"#ltelephoneform")}}}));