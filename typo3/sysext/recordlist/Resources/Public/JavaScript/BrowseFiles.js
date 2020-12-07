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
define(["TYPO3/CMS/Backend/Utility/MessageUtility","./ElementBrowser","nprogress","TYPO3/CMS/Core/Event/RegularEvent"],(function(e,t,n,i){"use strict";var s=TYPO3.Icons;class r{constructor(){this.importSelection=a=>{a.preventDefault();const l=a.target,o=document.querySelectorAll(".t3js-multi-record-selection-check");if(!o.length)return;const c=[];o.forEach(e=>{e.checked&&e.name&&e.dataset.fileName&&e.dataset.fileUid&&c.unshift({uid:e.dataset.fileUid,fileName:e.dataset.fileName})}),s.getIcon("spinner-circle",s.sizes.small,null,null,s.markupIdentifiers.inline).then(e=>{l.classList.add("disabled"),l.innerHTML=e}),n.configure({parent:".element-browser-main-content",showSpinner:!1}),n.start();const d=1/c.length;r.handleNext(c),new i("message",i=>{if(!e.MessageUtility.verifyOrigin(i.origin))throw"Denied message sent by "+i.origin;"typo3:foreignRelation:inserted"===i.data.actionName&&(c.length>0?(n.inc(d),r.handleNext(c)):(n.done(),t.focusOpenerAndClose()))}).bindTo(window)},new i("click",(e,t)=>{e.preventDefault(),r.insertElement(t.dataset.fileName,Number(t.dataset.fileUid),1===parseInt(t.dataset.close||"0",10))}).delegateTo(document,"[data-close]"),new i("multiRecordSelection:action:import",this.importSelection).bindTo(document)}static insertElement(e,n,i){return t.insertElement("sys_file",String(n),e,String(n),i)}static handleNext(e){if(e.length>0){const t=e.pop();r.insertElement(t.fileName,Number(t.uid))}}}return new r}));