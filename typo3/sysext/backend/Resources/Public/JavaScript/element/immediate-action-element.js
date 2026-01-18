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
import n from"@typo3/backend/utility.js";import{EventDispatcher as s}from"@typo3/backend/event/event-dispatcher.js";class r extends HTMLElement{action;args=[];static get observedAttributes(){return["action","args","args-list"]}static async getDelegate(t){switch(t){case"TYPO3.ModuleMenu.App.refreshMenu":const{default:o}=await import("@typo3/backend/module-menu.js");return o.App.refreshMenu.bind(o.App);case"TYPO3.Backend.Topbar.refresh":const{default:e}=await import("@typo3/backend/viewport.js");return e.Topbar.refresh.bind(e.Topbar);case"TYPO3.WindowManager.localOpen":const{default:a}=await import("@typo3/backend/window-manager.js");return a.localOpen.bind(a);case"TYPO3.Backend.Storage.ModuleStateStorage.update":return(await import("@typo3/backend/storage/module-state-storage.js")).ModuleStateStorage.update;case"TYPO3.Backend.Storage.ModuleStateStorage.updateWithCurrentMount":return(await import("@typo3/backend/storage/module-state-storage.js")).ModuleStateStorage.updateWithCurrentMount;case"TYPO3.Backend.Event.EventDispatcher.dispatchCustomEvent":return s.dispatchCustomEvent;default:throw Error('Unknown action "'+t+'"')}}attributeChangedCallback(t,o,e){if(t==="action")this.action=e;else if(t==="args"){const a=e.replace(/&quot;/g,'"'),i=JSON.parse(a);this.args=i instanceof Array?n.trimItems(i):[]}else if(t==="args-list"){const a=e.split(",");this.args=n.trimItems(a)}}connectedCallback(){if(!this.action)throw new Error("Missing mandatory action attribute");r.getDelegate(this.action).then(t=>t(...this.args))}}window.customElements.define("typo3-immediate-action",r);export{r as ImmediateActionElement};
