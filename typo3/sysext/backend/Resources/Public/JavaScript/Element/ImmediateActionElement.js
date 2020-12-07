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
define(["require","TYPO3/CMS/Backend/Utility"],(function(e,t){"use strict";class a extends HTMLElement{constructor(){super(...arguments),this.args=[]}static async getDelegate(t){switch(t){case"TYPO3.ModuleMenu.App.refreshMenu":const a=await new Promise((function(t,a){e(["TYPO3/CMS/Backend/ModuleMenu"],(function(e){t("object"!=typeof e||"default"in e?{default:e}:Object.defineProperty(e,"default",{value:e,enumerable:!1}))}),a)}));return a.default.App.refreshMenu.bind(a.default.App);case"TYPO3.Backend.Topbar.refresh":const n=await new Promise((function(t,a){e(["TYPO3/CMS/Backend/Viewport"],(function(e){t("object"!=typeof e||"default"in e?{default:e}:Object.defineProperty(e,"default",{value:e,enumerable:!1}))}),a)}));return n.default.Topbar.refresh.bind(n.default.Topbar);case"TYPO3.WindowManager.localOpen":const r=await new Promise((function(t,a){e(["TYPO3/CMS/Backend/WindowManager"],(function(e){t("object"!=typeof e||"default"in e?{default:e}:Object.defineProperty(e,"default",{value:e,enumerable:!1}))}),a)}));return r.default.localOpen.bind(r);case"TYPO3.Backend.Storage.ModuleStateStorage.update":return(await new Promise((function(t,a){e(["TYPO3/CMS/Backend/Storage/ModuleStateStorage"],(function(e){t("object"!=typeof e||"default"in e?{default:e}:Object.defineProperty(e,"default",{value:e,enumerable:!1}))}),a)}))).ModuleStateStorage.update;case"TYPO3.Backend.Storage.ModuleStateStorage.updateWithCurrentMount":return(await new Promise((function(t,a){e(["TYPO3/CMS/Backend/Storage/ModuleStateStorage"],(function(e){t("object"!=typeof e||"default"in e?{default:e}:Object.defineProperty(e,"default",{value:e,enumerable:!1}))}),a)}))).ModuleStateStorage.updateWithCurrentMount;default:throw Error('Unknown action "'+t+'"')}}static get observedAttributes(){return["action","args","args-list"]}attributeChangedCallback(e,a,n){if("action"===e)this.action=n;else if("args"===e){const e=n.replace(/&quot;/g,'"'),a=JSON.parse(e);this.args=a instanceof Array?t.trimItems(a):[]}else if("args-list"===e){const e=n.split(",");this.args=t.trimItems(e)}}connectedCallback(){if(!this.action)throw new Error("Missing mandatory action attribute");a.getDelegate(this.action).then(e=>e.apply(null,this.args))}}return window.customElements.define("typo3-immediate-action",a),{ImmediateActionElement:a}}));