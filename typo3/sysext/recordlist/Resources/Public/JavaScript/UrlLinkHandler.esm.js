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
import LinkBrowser from"TYPO3/CMS/Recordlist/LinkBrowser.esm.js";import RegularEvent from"TYPO3/CMS/Core/Event/RegularEvent.esm.js";class UrlLinkHandler{constructor(){new RegularEvent("submit",(e,r)=>{e.preventDefault();let l=r.querySelector('[name="lurl"]').value;""!==l&&LinkBrowser.finalizeFunction(l)}).delegateTo(document,"#lurlform")}}export default new UrlLinkHandler;