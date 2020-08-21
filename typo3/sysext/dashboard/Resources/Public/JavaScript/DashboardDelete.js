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
define(["TYPO3/CMS/Backend/Modal","TYPO3/CMS/Backend/Enum/Severity","TYPO3/CMS/Core/Event/RegularEvent"],(function(t,e,n){"use strict";return new class{constructor(){this.selector=".js-dashboard-delete",this.initialize()}initialize(){new n("click",(function(n){n.preventDefault(),t.confirm(this.dataset.modalTitle,this.dataset.modalQuestion,e.SeverityEnum.warning,[{text:this.dataset.modalCancel,active:!0,btnClass:"btn-default",name:"cancel"},{text:this.dataset.modalOk,btnClass:"btn-warning",name:"delete"}]).on("button.clicked",e=>{"delete"===e.target.getAttribute("name")&&(window.location.href=this.getAttribute("href")),t.dismiss()})})).delegateTo(document,this.selector)}}}));