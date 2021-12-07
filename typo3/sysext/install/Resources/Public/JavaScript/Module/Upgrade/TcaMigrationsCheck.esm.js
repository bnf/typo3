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
import $ from"jquery";import{AbstractInteractableModule}from"../AbstractInteractableModule";import Modal from"TYPO3/CMS/Backend/Modal";import AjaxRequest from"TYPO3/CMS/Core/Ajax/AjaxRequest";import FlashMessage from"../../Renderable/FlashMessage";import InfoBox from"../../Renderable/InfoBox";import ProgressBar from"../../Renderable/ProgressBar";import Severity from"../../Renderable/Severity";import Router from"../../Router";class TcaMigrationsCheck extends AbstractInteractableModule{constructor(){super(...arguments),this.selectorCheckTrigger=".t3js-tcaMigrationsCheck-check",this.selectorOutputContainer=".t3js-tcaMigrationsCheck-output"}initialize(e){this.currentModal=e,this.check(),e.on("click",this.selectorCheckTrigger,e=>{e.preventDefault(),this.check()})}check(){this.setModalButtonsState(!1);const e=$(this.selectorOutputContainer),t=this.getModalBody(),r=ProgressBar.render(Severity.loading,"Loading...","");e.empty().html(r),new AjaxRequest(Router.getUrl("tcaMigrationsCheck")).get({cache:"no-cache"}).then(async e=>{const r=await e.resolve();if(t.empty().append(r.html),Modal.setButtons(r.buttons),!0===r.success&&Array.isArray(r.status))if(r.status.length>0){const e=InfoBox.render(Severity.warning,"TCA migrations need to be applied","Check the following list and apply needed changes.");t.find(this.selectorOutputContainer).empty(),t.find(this.selectorOutputContainer).append(e),r.status.forEach(e=>{const r=InfoBox.render(e.severity,e.title,e.message);t.find(this.selectorOutputContainer).append(r)})}else{const e=InfoBox.render(Severity.ok,"No TCA migrations need to be applied","Your TCA looks good.");t.find(this.selectorOutputContainer).append(e)}else{const e=FlashMessage.render(Severity.error,"Something went wrong",'Use "Check for broken extensions"');t.find(this.selectorOutputContainer).append(e)}},e=>{Router.handleAjaxError(e,t)})}}export default new TcaMigrationsCheck;