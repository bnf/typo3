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
define(["require","TYPO3/CMS/Backend/Utility"],(function(e,t){"use strict";class n extends HTMLElement{constructor(){super(...arguments),this.args=[]}static async getDelegate(t){switch(t){case"TYPO3.ModuleMenu.App.refreshMenu":const n=await new Promise((function(t,n){e(["TYPO3/CMS/Backend/ModuleMenu"],(function(e){t("object"!=typeof e||"default"in e?{default:e}:Object.defineProperty(e,"default",{value:e,enumerable:!1}))}),n)}));return n.default.App.refreshMenu.bind(n);case"TYPO3.Backend.Topbar.refresh":const a=await new Promise((function(t,n){e(["TYPO3/CMS/Backend/Viewport"],(function(e){t("object"!=typeof e||"default"in e?{default:e}:Object.defineProperty(e,"default",{value:e,enumerable:!1}))}),n)}));return a.default.Topbar.refresh.bind(a.default.Topbar);case"TYPO3.WindowManager.localOpen":const i=await new Promise((function(t,n){e(["TYPO3/CMS/Backend/WindowManager"],(function(e){t("object"!=typeof e||"default"in e?{default:e}:Object.defineProperty(e,"default",{value:e,enumerable:!1}))}),n)}));return i.default.localOpen.bind(i);default:throw Error('Unknown action "'+t+'"')}}static get observedAttributes(){return["action","args","args-list"]}attributeChangedCallback(e,n,a){if("action"===e)this.action=a;else if("args"===e){const e=a.replace(/&quot;/g,'"'),n=JSON.parse(e);this.args=n instanceof Array?t.trimItems(n):[]}else if("args-list"===e){const e=a.split(",");this.args=t.trimItems(e)}}connectedCallback(){if(!this.action)throw new Error("Missing mandatory action attribute");n.getDelegate(this.action).then(e=>e.apply(null,this.args))}}return window.customElements.define("typo3-immediate-action",n),{ImmediateActionElement:n}}));