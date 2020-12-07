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
define(["TYPO3/CMS/Core/DocumentService"],(function(e){"use strict";return class{constructor(t){this.controlElement=null,this.registerClickHandler=e=>{e.preventDefault();const t=this.controlElement.dataset.itemName,n=JSON.parse(this.controlElement.dataset.selectedIndices),r=document.forms.namedItem("editform").querySelector('[name="'+t+'[]"]');r.selectedIndex=-1;for(let e of n)r.options[e].selected=!0},e.ready().then(()=>{this.controlElement=document.querySelector(t),null!==this.controlElement&&this.controlElement.addEventListener("click",this.registerClickHandler)})}}}));