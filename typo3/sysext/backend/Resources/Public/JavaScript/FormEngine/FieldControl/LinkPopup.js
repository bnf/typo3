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
define(["TYPO3/CMS/Core/DocumentService","TYPO3/CMS/Backend/FormEngine","../../Modal"],(function(e,t,n){"use strict";return class{constructor(o){this.controlElement=null,this.handleControlClick=e=>{e.preventDefault();const o=this.controlElement.dataset.itemName,l=this.controlElement.getAttribute("href")+"&P[currentValue]="+encodeURIComponent(document.editform[o].value)+"&P[currentSelectedValues]="+encodeURIComponent(t.getFieldElement(o).val());n.advanced({type:n.types.iframe,content:l,size:n.sizes.large})},e.ready().then(()=>{this.controlElement=document.querySelector(o),this.controlElement.addEventListener("click",this.handleControlClick)})}}}));