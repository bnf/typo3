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
define(["TYPO3/CMS/Backend/Enum/Severity","TYPO3/CMS/Core/Event/RegularEvent","TYPO3/CMS/Core/DocumentService","TYPO3/CMS/Backend/Modal"],(function(e,t,n,a){"use strict";return new class{constructor(){n.ready().then(()=>{new t("click",(t,n)=>{t.preventDefault();let o=n.dataset.redirectUrl;o=o?encodeURIComponent(o):encodeURIComponent(top.list_frame.document.location.pathname+top.list_frame.document.location.search);const s=n.dataset.identifier,i=n.dataset.deleteType,l=n.dataset.deleteUrl+"&data[delete][0][data]="+encodeURIComponent(s)+"&data[delete][0][redirect]="+o;if(n.dataset.check){a.confirm(n.dataset.title,n.dataset.bsContent,e.SeverityEnum.warning,[{text:TYPO3.lang["buttons.confirm.delete_file.no"]||"Cancel",active:!0,btnClass:"btn-default",name:"no"},{text:TYPO3.lang["buttons.confirm."+i+".yes"]||"Yes, delete this file or folder",btnClass:"btn-warning",name:"yes"}]).on("button.clicked",e=>{const t=e.target.name;"no"===t?a.dismiss():"yes"===t&&(a.dismiss(),top.list_frame.location.href=l)})}else top.list_frame.location.href=l}).delegateTo(document,".t3js-filelist-delete")})}}}));