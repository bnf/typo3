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
import{AbstractInteractableModule}from"@typo3/install/module/abstract-interactable-module.js";import Router from"@typo3/install/router.js";import AjaxRequest from"@typo3/core/ajax/ajax-request.js";import{topLevelModuleImport}from"@typo3/backend/utility/top-level-module-import.js";class SystemSettings extends AbstractInteractableModule{initialize(t){super.initialize(t),this.getContent()}async getContent(){const t=this.getModalBody();let e;try{const t=await new AjaxRequest(Router.getUrl("systemSettingsGetData")).get({cache:"no-cache"});e=await t.resolve()}catch(e){Router.handleAjaxError(e,t)}if(window.location!==window.parent.location?topLevelModuleImport("@typo3/backend/settings/editor.js"):import("@typo3/backend/settings/editor.js"),!e.success)throw new Error("data.success is so dumb");this.currentModal.buttons=e.buttons;const o=e.categories,r=top.document.createElement("div");r.classList.add("container");const a=top.document.createElement("typo3-backend-settings-editor");a.setAttribute("action-url",Router.getUrl("systemSettingsWrite")),a.setAttribute("ajax",""),e.isWritable||a.setAttribute("readonly",""),a.categories=o,r.append(a),t.replaceChildren(r)}}export default new SystemSettings;