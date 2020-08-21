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
define(["jquery","../AbstractInteractableModule","TYPO3/CMS/Backend/Modal","TYPO3/CMS/Backend/Notification","TYPO3/CMS/Core/Ajax/AjaxRequest","../../Renderable/InfoBox","../../Renderable/ProgressBar","../../Renderable/Severity","../../Router"],(function(e,t,s,n,a,o,r,i,c){"use strict";class l extends t.AbstractInteractableModule{constructor(){super(...arguments),this.selectorCheckTrigger=".t3js-tcaExtTablesCheck-check",this.selectorOutputContainer=".t3js-tcaExtTablesCheck-output"}initialize(e){this.currentModal=e,this.check(),e.on("click",this.selectorCheckTrigger,e=>{e.preventDefault(),this.check()})}check(){this.setModalButtonsState(!1);const t=this.getModalBody(),l=e(this.selectorOutputContainer),h=r.render(i.loading,"Loading...","");l.empty().html(h),new a(c.getUrl("tcaExtTablesCheck")).get({cache:"no-cache"}).then(async e=>{const a=await e.resolve();if(t.empty().append(a.html),s.setButtons(a.buttons),!0===a.success&&Array.isArray(a.status))if(a.status.length>0){const e=o.render(i.warning,"Following extensions change TCA in ext_tables.php","Check ext_tables.php files, look for ExtensionManagementUtility calls and $GLOBALS['TCA'] modifications");t.find(this.selectorOutputContainer).append(e),a.status.forEach(e=>{const s=o.render(e.severity,e.title,e.message);l.append(s),t.append(s)})}else{const e=o.render(i.ok,"No TCA changes in ext_tables.php files. Good job!","");t.find(this.selectorOutputContainer).append(e)}else n.error("Something went wrong",'Please use the module "Check for broken extensions" to find a possible extension causing this issue.')},e=>{c.handleAjaxError(e,t)})}}return new l}));