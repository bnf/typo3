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
define(["TYPO3/CMS/Backend/Enum/Severity","jquery","TYPO3/CMS/Backend/Modal"],(function(e,t,n){"use strict";return new class{constructor(){t(()=>{t(document).on("click",".t3js-filelist-delete",a=>{a.preventDefault();const o=t(a.currentTarget);let i=o.data("redirectUrl");i=i?encodeURIComponent(i):encodeURIComponent(top.list_frame.document.location.pathname+top.list_frame.document.location.search);const c=o.data("identifier"),l=o.data("deleteType"),d=o.data("deleteUrl")+"&data[delete][0][data]="+encodeURIComponent(c)+"&data[delete][0][redirect]="+i;if(o.data("check")){n.confirm(o.data("title"),o.data("content"),e.SeverityEnum.warning,[{text:TYPO3.lang["buttons.confirm.delete_file.no"]||"Cancel",active:!0,btnClass:"btn-default",name:"no"},{text:TYPO3.lang["buttons.confirm."+l+".yes"]||"Yes, delete this file or folder",btnClass:"btn-warning",name:"yes"}]).on("button.clicked",e=>{const t=e.target.name;"no"===t?n.dismiss():"yes"===t&&(n.dismiss(),top.list_frame.location.href=d)})}else top.list_frame.location.href=d})})}}}));