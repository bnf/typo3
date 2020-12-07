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
define(["./Modifier/Resizable","./Modifier/Tabbable","TYPO3/CMS/Core/DocumentService"],(function(e,t,n){"use strict";return class{constructor(i){this.element=null,n.ready().then(()=>{this.element=document.getElementById(i),e.Resizable.enable(this.element),t.Tabbable.enable(this.element)})}}}));