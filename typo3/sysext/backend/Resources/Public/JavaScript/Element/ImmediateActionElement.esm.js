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
import Utility from"TYPO3/CMS/Backend/Utility.esm.js";import{EventDispatcher}from"TYPO3/CMS/Backend/Event/EventDispatcher.esm.js";export class ImmediateActionElement extends HTMLElement{constructor(){super(...arguments),this.args=[]}static async getDelegate(t){switch(t){case"TYPO3.ModuleMenu.App.refreshMenu":const{default:e}=await import("TYPO3/CMS/Backend/ModuleMenu.esm.js");return e.App.refreshMenu.bind(e.App);case"TYPO3.Backend.Topbar.refresh":const{default:a}=await import("TYPO3/CMS/Backend/Viewport.esm.js");return a.Topbar.refresh.bind(a.Topbar);case"TYPO3.WindowManager.localOpen":const{default:r}=await import("TYPO3/CMS/Backend/WindowManager.esm.js");return r.localOpen.bind(r);case"TYPO3.Backend.Storage.ModuleStateStorage.update":return(await import("TYPO3/CMS/Backend/Storage/ModuleStateStorage.esm.js")).ModuleStateStorage.update;case"TYPO3.Backend.Storage.ModuleStateStorage.updateWithCurrentMount":return(await import("TYPO3/CMS/Backend/Storage/ModuleStateStorage.esm.js")).ModuleStateStorage.updateWithCurrentMount;case"TYPO3.Backend.Event.EventDispatcher.dispatchCustomEvent":return EventDispatcher.dispatchCustomEvent;default:throw Error('Unknown action "'+t+'"')}}static get observedAttributes(){return["action","args","args-list"]}attributeChangedCallback(t,e,a){if("action"===t)this.action=a;else if("args"===t){const t=a.replace(/&quot;/g,'"'),e=JSON.parse(t);this.args=e instanceof Array?Utility.trimItems(e):[]}else if("args-list"===t){const t=a.split(",");this.args=Utility.trimItems(t)}}connectedCallback(){if(!this.action)throw new Error("Missing mandatory action attribute");ImmediateActionElement.getDelegate(this.action).then(t=>t.apply(null,this.args))}}window.customElements.define("typo3-immediate-action",ImmediateActionElement);