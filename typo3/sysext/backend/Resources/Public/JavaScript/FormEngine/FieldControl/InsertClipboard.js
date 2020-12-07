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
define(["TYPO3/CMS/Core/DocumentService","TYPO3/CMS/Backend/FormEngine"],(function(e,t){"use strict";return class{constructor(n){this.controlElement=null,this.registerClickHandler=e=>{e.preventDefault();const n=this.controlElement.dataset.element,r=JSON.parse(this.controlElement.dataset.clipboardItems);for(let e of r)t.setSelectOptionFromExternalSource(n,e.value,e.title,e.title)},e.ready().then(()=>{this.controlElement=document.querySelector(n),this.controlElement.addEventListener("click",this.registerClickHandler)})}}}));