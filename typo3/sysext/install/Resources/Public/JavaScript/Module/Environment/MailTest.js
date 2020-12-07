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
define(["../AbstractInteractableModule","TYPO3/CMS/Backend/Modal","TYPO3/CMS/Backend/Notification","TYPO3/CMS/Core/Ajax/AjaxRequest","../../Renderable/InfoBox","../../Renderable/ProgressBar","../../Renderable/Severity","../../Router","bootstrap"],(function(e,t,s,o,n,a,r,l){"use strict";class i extends e.AbstractInteractableModule{constructor(){super(...arguments),this.selectorOutputContainer=".t3js-mailTest-output",this.selectorMailTestButton=".t3js-mailTest-execute"}initialize(e){this.currentModal=e,this.getData(),e.on("click",this.selectorMailTestButton,e=>{e.preventDefault(),this.send()}),e.on("submit","form",e=>{e.preventDefault(),this.send()})}getData(){const e=this.getModalBody();new o(l.getUrl("mailTestGetData")).get({cache:"no-cache"}).then(async o=>{const n=await o.resolve();!0===n.success?(e.empty().append(n.html),t.setButtons(n.buttons)):s.error("Something went wrong","The request was not processed successfully. Please check the browser's console and TYPO3's log.")},t=>{l.handleAjaxError(t,e)})}send(){this.setModalButtonsState(!1);const e=this.getModuleContent().data("mail-test-token"),t=this.findInModal(this.selectorOutputContainer),i=a.render(r.loading,"Loading...","");t.empty().html(i),new o(l.getUrl()).post({install:{action:"mailTest",token:e,email:this.findInModal(".t3js-mailTest-email").val()}}).then(async e=>{const o=await e.resolve();t.empty(),Array.isArray(o.status)?o.status.forEach(e=>{const s=n.render(e.severity,e.title,e.message);t.html(s)}):s.error("Something went wrong","The request was not processed successfully. Please check the browser's console and TYPO3's log.")},()=>{s.error("Something went wrong","The request was not processed successfully. Please check the browser's console and TYPO3's log.")}).finally(()=>{this.setModalButtonsState(!0)})}}return new i}));