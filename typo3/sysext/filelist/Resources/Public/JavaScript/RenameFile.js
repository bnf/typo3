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
define(["TYPO3/CMS/Backend/Enum/Severity","TYPO3/CMS/Core/Ajax/AjaxRequest","TYPO3/CMS/Backend/Modal","TYPO3/CMS/Core/DocumentService"],(function(e,t,a,n){"use strict";return new class{constructor(){n.ready().then(()=>{this.initialize()})}initialize(){const e=document.querySelector(".t3js-submit-file-rename");null!==e&&e.addEventListener("click",this.checkForDuplicate)}checkForDuplicate(n){n.preventDefault();const i=n.currentTarget.form,r=i.querySelector('input[name="data[rename][0][target]"]'),c=i.querySelector('input[name="data[rename][0][destination]"]'),l=i.querySelector('input[name="data[rename][0][conflictMode]"]');new t(TYPO3.settings.ajaxUrls.file_exists).withQueryArguments({fileName:r.value,fileTarget:c.value}).get({cache:"no-cache"}).then(async t=>{const n=void 0!==(await t.resolve()).uid,c=r.dataset.original,s=r.value;if(n&&c!==s){const t=TYPO3.lang["file_rename.exists.description"].replace("{0}",c).replace(/\{1\}/g,s);a.confirm(TYPO3.lang["file_rename.exists.title"],t,e.SeverityEnum.warning,[{active:!0,btnClass:"btn-default",name:"cancel",text:TYPO3.lang["file_rename.actions.cancel"]},{btnClass:"btn-primary",name:"rename",text:TYPO3.lang["file_rename.actions.rename"]},{btnClass:"btn-default",name:"replace",text:TYPO3.lang["file_rename.actions.override"]}]).on("button.clicked",e=>{"cancel"!==e.target.name&&(l.value=e.target.name,i.submit()),a.dismiss()})}else i.submit()})}}}));