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
define(["jquery","./ElementBrowser","TYPO3/CMS/Backend/Modal","TYPO3/CMS/Backend/Severity"],(function(e,r,t,n){"use strict";return new class{constructor(){e(()=>{e("[data-folder-id]").on("click",t=>{t.preventDefault();const n=e(t.currentTarget),a=n.data("folderId"),c=1===parseInt(n.data("close"),10);r.insertElement("",a,"folder",a,a,"","","",c)}),e(".t3js-folderIdError").on("click",r=>{r.preventDefault(),t.confirm("",e(r.currentTarget).data("message"),n.error,[],[])})})}}}));