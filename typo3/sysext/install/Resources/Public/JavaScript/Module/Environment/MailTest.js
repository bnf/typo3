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
define(["require","exports","TYPO3/CMS/Install/Module/AbstractInteractableModule","TYPO3/CMS/Backend/Modal","TYPO3/CMS/Backend/Notification","TYPO3/CMS/Core/Ajax/AjaxRequest","TYPO3/CMS/Install/Renderable/InfoBox","TYPO3/CMS/Install/Renderable/ProgressBar","TYPO3/CMS/Install/Renderable/Severity","TYPO3/CMS/Install/Router","bootstrap"],(function(e,t,s,n,a,o,l,r,i,c){"use strict";class u extends s.AbstractInteractableModule{constructor(){super(...arguments),this.selectorOutputContainer=".t3js-mailTest-output",this.selectorMailTestButton=".t3js-mailTest-execute"}initialize(e){this.currentModal=e,this.getData(),e.on("click",this.selectorMailTestButton,e=>{e.preventDefault(),this.send()}),e.on("submit","form",e=>{e.preventDefault(),this.send()})}getData(){const e=this.getModalBody();new o(c.getUrl("mailTestGetData")).get({cache:"no-cache"}).then(async t=>{const s=await t.resolve();!0===s.success?(e.empty().append(s.html),n.setButtons(s.buttons)):a.error("Something went wrong","The request was not processed successfully. Please check the browser's console and TYPO3's log.")},t=>{c.handleAjaxError(t,e)})}send(){this.setModalButtonsState(!1);const e=this.getModuleContent().data("mail-test-token"),t=this.findInModal(this.selectorOutputContainer),s=r.render(i.loading,"Loading...","");t.empty().html(s),new o(c.getUrl()).post({install:{action:"mailTest",token:e,email:this.findInModal(".t3js-mailTest-email").val()}}).then(async e=>{const s=await e.resolve();t.empty(),Array.isArray(s.status)?s.status.forEach(e=>{const s=l.render(e.severity,e.title,e.message);t.html(s)}):a.error("Something went wrong","The request was not processed successfully. Please check the browser's console and TYPO3's log.")},()=>{a.error("Something went wrong","The request was not processed successfully. Please check the browser's console and TYPO3's log.")}).finally(()=>{this.setModalButtonsState(!0)})}}return new u}));