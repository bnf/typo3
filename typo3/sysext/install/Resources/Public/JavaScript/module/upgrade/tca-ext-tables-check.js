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
import{AbstractInteractableModule as e}from"@typo3/install/module/abstract-interactable-module.js";import t from"@typo3/backend/modal.js";import o from"@typo3/backend/notification.js";import a from"@typo3/core/ajax/ajax-request.js";import{InfoBox as n}from"@typo3/install/renderable/info-box.js";import s from"@typo3/install/renderable/severity.js";import r from"@typo3/install/router.js";import i from"@typo3/core/event/regular-event.js";var l;!function(e){e.checkTrigger=".t3js-tcaExtTablesCheck-check",e.outputContainer=".t3js-tcaExtTablesCheck-output"}(l||(l={}));var c=new class extends e{initialize(e){super.initialize(e),this.loadModuleFrameAgnostic("@typo3/install/renderable/info-box.js").then((()=>{this.check()})),new i("click",(e=>{e.preventDefault(),this.check()})).delegateTo(e,l.checkTrigger)}check(){this.setModalButtonsState(!1);const e=document.querySelector(l.outputContainer);null!==e&&this.renderProgressBar(e,{},"append");const i=this.getModalBody();new a(r.getUrl("tcaExtTablesCheck")).get({cache:"no-cache"}).then((async e=>{const a=await e.resolve();i.innerHTML=a.html,t.setButtons(a.buttons),!0===a.success&&Array.isArray(a.status)?a.status.length>0?(i.querySelector(l.outputContainer).append(n.create(s.warning,"Following extensions change TCA in ext_tables.php","Check ext_tables.php files, look for ExtensionManagementUtility calls and $GLOBALS['TCA'] modifications")),a.status.forEach((e=>{i.querySelector(l.outputContainer).append(n.create(e.severity,e.title,e.message))}))):i.querySelector(l.outputContainer).append(n.create(s.ok,"No TCA changes in ext_tables.php files. Good job!")):o.error("Something went wrong",'Please use the module "Check for broken extensions" to find a possible extension causing this issue.')}),(e=>{r.handleAjaxError(e,i)})).finally((()=>{this.setModalButtonsState(!0)}))}};export{c as default};