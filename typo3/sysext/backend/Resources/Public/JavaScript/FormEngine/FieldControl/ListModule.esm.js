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
import DocumentService from"TYPO3/CMS/Core/DocumentService.esm.js";import FormEngine from"TYPO3/CMS/Backend/FormEngine.esm.js";class ListModule{constructor(e){this.controlElement=null,this.registerClickHandler=e=>{e.preventDefault(),FormEngine.preventFollowLinkIfNotSaved(this.controlElement.getAttribute("href"))},DocumentService.ready().then(()=>{this.controlElement=document.querySelector(e),this.controlElement.addEventListener("click",this.registerClickHandler)})}}export default ListModule;