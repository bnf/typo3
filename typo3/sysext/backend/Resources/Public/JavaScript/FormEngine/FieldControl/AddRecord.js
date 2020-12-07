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
define(["TYPO3/CMS/Core/DocumentService","TYPO3/CMS/Backend/FormEngine"],(function(e,t){"use strict";return class{constructor(n){this.controlElement=null,this.registerClickHandler=e=>{e.preventDefault(),t.preventFollowLinkIfNotSaved(this.controlElement.getAttribute("href"))},e.ready().then(()=>{this.controlElement=document.querySelector(n),this.controlElement.addEventListener("click",this.registerClickHandler)})}}}));