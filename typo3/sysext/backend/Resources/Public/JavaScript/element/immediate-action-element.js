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
import t from"@typo3/backend/utility.js";import{EventDispatcher as e}from"@typo3/backend/event/event-dispatcher.js";class a extends HTMLElement{constructor(){super(...arguments),this.args=[]}static get observedAttributes(){return["action","args","args-list"]}static async getDelegate(t){switch(t){case"TYPO3.ModuleMenu.App.refreshMenu":const{default:a}=await import("@typo3/backend/module-menu.js");return a.App.refreshMenu.bind(a.App);case"TYPO3.Backend.Topbar.refresh":const{default:r}=await import("@typo3/backend/viewport.js");return r.Topbar.refresh.bind(r.Topbar);case"TYPO3.WindowManager.localOpen":const{default:o}=await import("@typo3/backend/window-manager.js");return o.localOpen.bind(o);case"TYPO3.Backend.Storage.ModuleStateStorage.update":return(await import("@typo3/backend/storage/module-state-storage.js")).ModuleStateStorage.update;case"TYPO3.Backend.Storage.ModuleStateStorage.updateWithCurrentMount":return(await import("@typo3/backend/storage/module-state-storage.js")).ModuleStateStorage.updateWithCurrentMount;case"TYPO3.Backend.Event.EventDispatcher.dispatchCustomEvent":return e.dispatchCustomEvent;default:throw Error('Unknown action "'+t+'"')}}attributeChangedCallback(e,a,r){if("action"===e)this.action=r;else if("args"===e){const e=r.replace(/&quot;/g,'"'),a=JSON.parse(e);this.args=a instanceof Array?t.trimItems(a):[]}else if("args-list"===e){const e=r.split(",");this.args=t.trimItems(e)}}connectedCallback(){if(!this.action)throw new Error("Missing mandatory action attribute");a.getDelegate(this.action).then((t=>t(...this.args)))}}window.customElements.define("typo3-immediate-action",a);export{a as ImmediateActionElement};