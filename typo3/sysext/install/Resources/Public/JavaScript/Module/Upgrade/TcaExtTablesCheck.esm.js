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
import $ from"jquery";import{AbstractInteractableModule}from"TYPO3/CMS/Install/Module/AbstractInteractableModule";import Modal from"TYPO3/CMS/Backend/Modal";import Notification from"TYPO3/CMS/Backend/Notification";import AjaxRequest from"TYPO3/CMS/Core/Ajax/AjaxRequest";import InfoBox from"TYPO3/CMS/Install/Renderable/InfoBox";import ProgressBar from"TYPO3/CMS/Install/Renderable/ProgressBar";import Severity from"TYPO3/CMS/Install/Renderable/Severity";import Router from"TYPO3/CMS/Install/Router";class TcaExtTablesCheck extends AbstractInteractableModule{constructor(){super(...arguments),this.selectorCheckTrigger=".t3js-tcaExtTablesCheck-check",this.selectorOutputContainer=".t3js-tcaExtTablesCheck-output"}initialize(e){this.currentModal=e,this.check(),e.on("click",this.selectorCheckTrigger,e=>{e.preventDefault(),this.check()})}check(){this.setModalButtonsState(!1);const e=this.getModalBody(),t=$(this.selectorOutputContainer),o=ProgressBar.render(Severity.loading,"Loading...","");t.empty().html(o),new AjaxRequest(Router.getUrl("tcaExtTablesCheck")).get({cache:"no-cache"}).then(async o=>{const r=await o.resolve();if(e.empty().append(r.html),Modal.setButtons(r.buttons),!0===r.success&&Array.isArray(r.status))if(r.status.length>0){const o=InfoBox.render(Severity.warning,"Following extensions change TCA in ext_tables.php","Check ext_tables.php files, look for ExtensionManagementUtility calls and $GLOBALS['TCA'] modifications");e.find(this.selectorOutputContainer).append(o),r.status.forEach(o=>{const r=InfoBox.render(o.severity,o.title,o.message);t.append(r),e.append(r)})}else{const t=InfoBox.render(Severity.ok,"No TCA changes in ext_tables.php files. Good job!","");e.find(this.selectorOutputContainer).append(t)}else Notification.error("Something went wrong",'Please use the module "Check for broken extensions" to find a possible extension causing this issue.')},t=>{Router.handleAjaxError(t,e)})}}export default new TcaExtTablesCheck;