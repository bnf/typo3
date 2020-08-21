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
define(["jquery","../AbstractInteractableModule","TYPO3/CMS/Backend/Modal","TYPO3/CMS/Backend/Notification","TYPO3/CMS/Core/Ajax/AjaxRequest","../../Renderable/InfoBox","../../Renderable/ProgressBar","../../Renderable/Severity","../../Router","bootstrap"],(function(e,t,s,r,n,a,o,c,i){"use strict";class l extends t.AbstractInteractableModule{constructor(){super(...arguments),this.selectorGridderBadge=".t3js-environmentCheck-badge",this.selectorExecuteTrigger=".t3js-environmentCheck-execute",this.selectorOutputContainer=".t3js-environmentCheck-output"}initialize(e){this.currentModal=e,this.runTests(),e.on("click",this.selectorExecuteTrigger,e=>{e.preventDefault(),this.runTests()})}runTests(){this.setModalButtonsState(!1);const t=this.getModalBody(),l=e(this.selectorGridderBadge);l.text("").hide();const d=o.render(c.loading,"Loading...","");t.find(this.selectorOutputContainer).empty().append(d),new n(i.getUrl("environmentCheckGetStatus")).get({cache:"no-cache"}).then(async n=>{const o=await n.resolve();t.empty().append(o.html),s.setButtons(o.buttons);let c=0,i=0;!0===o.success&&"object"==typeof o.status?(e.each(o.status,(e,s)=>{Array.isArray(s)&&s.length>0&&s.forEach(e=>{1===e.severity&&c++,2===e.severity&&i++;const s=a.render(e.severity,e.title,e.message);t.find(this.selectorOutputContainer).append(s)})}),i>0?l.removeClass("label-warning").addClass("label-danger").text(i).show():c>0&&l.removeClass("label-error").addClass("label-warning").text(c).show()):r.error("Something went wrong","The request was not processed successfully. Please check the browser's console and TYPO3's log.")},e=>{i.handleAjaxError(e,t)})}}return new l}));