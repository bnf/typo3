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
import Utility from"TYPO3/CMS/Backend/Utility";export class ImmediateActionElement extends HTMLElement{constructor(){super(...arguments),this.args=[]}static async getDelegate(t){switch(t){case"TYPO3.ModuleMenu.App.refreshMenu":const e=await import("TYPO3/CMS/Backend/ModuleMenu");return e.default.App.refreshMenu.bind(e.default.App);case"TYPO3.Backend.Topbar.refresh":const a=await import("TYPO3/CMS/Backend/Viewport");return a.default.Topbar.refresh.bind(a.default.Topbar);case"TYPO3.WindowManager.localOpen":const r=await import("TYPO3/CMS/Backend/WindowManager");return r.default.localOpen.bind(r.default);case"TYPO3.Backend.Storage.ModuleStateStorage.update":return(await import("TYPO3/CMS/Backend/Storage/ModuleStateStorage")).ModuleStateStorage.update;case"TYPO3.Backend.Storage.ModuleStateStorage.updateWithCurrentMount":return(await import("TYPO3/CMS/Backend/Storage/ModuleStateStorage")).ModuleStateStorage.updateWithCurrentMount;default:throw Error('Unknown action "'+t+'"')}}static get observedAttributes(){return["action","args","args-list"]}attributeChangedCallback(t,e,a){if("action"===t)this.action=a;else if("args"===t){const t=a.replace(/&quot;/g,'"'),e=JSON.parse(t);this.args=e instanceof Array?Utility.trimItems(e):[]}else if("args-list"===t){const t=a.split(",");this.args=Utility.trimItems(t)}}connectedCallback(){if(!this.action)throw new Error("Missing mandatory action attribute");ImmediateActionElement.getDelegate(this.action).then(t=>t.apply(null,this.args))}}window.customElements.define("typo3-immediate-action",ImmediateActionElement);