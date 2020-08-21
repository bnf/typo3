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
define(["TYPO3/CMS/Backend/Enum/Severity","jquery","TYPO3/CMS/Backend/Modal"],(function(e,a,t){"use strict";return new class{constructor(){this.initialize()}initialize(){a(".t3js-submit-file-rename").on("click",this.checkForDuplicate)}checkForDuplicate(n){n.preventDefault();const i=a("#"+a(n.currentTarget).attr("form")),r=i.find('input[name="data[rename][0][target]"]'),l=i.find('input[name="data[rename][0][conflictMode]"]'),c=TYPO3.settings.ajaxUrls.file_exists;a.ajax({cache:!1,data:{fileName:r.val(),fileTarget:i.find('input[name="data[rename][0][destination]"]').val()},success:a=>{const n=void 0!==a.uid,c=r.data("original"),s=r.val();if(n&&c!==s){const a=TYPO3.lang["file_rename.exists.description"].replace("{0}",c).replace(/\{1\}/g,s);t.confirm(TYPO3.lang["file_rename.exists.title"],a,e.SeverityEnum.warning,[{active:!0,btnClass:"btn-default",name:"cancel",text:TYPO3.lang["file_rename.actions.cancel"]},{btnClass:"btn-primary",name:"rename",text:TYPO3.lang["file_rename.actions.rename"]},{btnClass:"btn-default",name:"replace",text:TYPO3.lang["file_rename.actions.override"]}]).on("button.clicked",e=>{"cancel"!==e.target.name&&(l.val(e.target.name),i.trigger("submit")),t.dismiss()})}else i.trigger("submit")},url:c})}}}));