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
import e from"@typo3/backend/utility.js"
import{EventDispatcher as t}from"@typo3/backend/event/event-dispatcher.js"
export class ImmediateActionElement extends HTMLElement{constructor(){super(...arguments),this.args=[]}static get observedAttributes(){return["action","args","args-list"]}static async getDelegate(e){switch(e){case"TYPO3.ModuleMenu.App.refreshMenu":const{default:moduleMenuApp}=await import("@typo3/backend/module-menu.js")
return moduleMenuApp.App.refreshMenu.bind(moduleMenuApp.App)
case"TYPO3.Backend.Topbar.refresh":const{default:viewportObject}=await import("@typo3/backend/viewport.js")
return viewportObject.Topbar.refresh.bind(viewportObject.Topbar)
case"TYPO3.WindowManager.localOpen":const{default:windowManager}=await import("@typo3/backend/window-manager.js")
return windowManager.localOpen.bind(windowManager)
case"TYPO3.Backend.Storage.ModuleStateStorage.update":return(await import("@typo3/backend/storage/module-state-storage.js")).ModuleStateStorage.update
case"TYPO3.Backend.Storage.ModuleStateStorage.updateWithCurrentMount":return(await import("@typo3/backend/storage/module-state-storage.js")).ModuleStateStorage.updateWithCurrentMount
case"TYPO3.Backend.Event.EventDispatcher.dispatchCustomEvent":return t.dispatchCustomEvent
default:throw Error('Unknown action "'+e+'"')}}attributeChangedCallback(t,a,r){if("action"===t)this.action=r
else if("args"===t){const n=r.replace(/&quot;/g,'"'),o=JSON.parse(n)
this.args=o instanceof Array?e.trimItems(o):[]}else if("args-list"===t){o=r.split(",")
this.args=e.trimItems(o)}}connectedCallback(){if(!this.action)throw new Error("Missing mandatory action attribute")
ImmediateActionElement.getDelegate(this.action).then((e=>e(...this.args)))}}window.customElements.define("typo3-immediate-action",ImmediateActionElement)
