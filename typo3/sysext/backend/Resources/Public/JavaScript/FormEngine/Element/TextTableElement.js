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
define(["require","exports","TYPO3/CMS/Backend/FormEngine/Element/Modifier/Resizable","TYPO3/CMS/Backend/FormEngine/Element/Modifier/Tabbable","TYPO3/CMS/Core/DocumentService"],(function(e,n,t,i,l){"use strict";return class{constructor(e){this.element=null,l.ready().then(()=>{this.element=document.getElementById(e),t.Resizable.enable(this.element),i.Tabbable.enable(this.element)})}}}));