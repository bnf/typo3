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
define(["TYPO3/CMS/Backend/ModuleMenu","TYPO3/CMS/Backend/Viewport","TYPO3/CMS/Backend/WindowManager","TYPO3/CMS/Backend/Utility"],(function(e,t,n,a){"use strict";class r extends HTMLElement{constructor(){super(...arguments),this.args=[]}static getDelegate(a){switch(a){case"TYPO3.ModuleMenu.App.refreshMenu":return e.App.refreshMenu.bind(e);case"TYPO3.Backend.Topbar.refresh":return t.Topbar.refresh.bind(t.Topbar);case"TYPO3.WindowManager.localOpen":return n.localOpen.bind(n);default:throw Error('Unknown action "'+a+'"')}}static get observedAttributes(){return["action","args","args-list"]}attributeChangedCallback(e,t,n){if("action"===e)this.action=n;else if("args"===e){const e=n.replace(/&quot;/g,'"'),t=JSON.parse(e);this.args=t instanceof Array?a.trimItems(t):[]}else if("args-list"===e){const e=n.split(",");this.args=a.trimItems(e)}}connectedCallback(){if(!this.action)throw new Error("Missing mandatory action attribute");r.getDelegate(this.action).apply(null,this.args)}}return window.customElements.define("typo3-immediate-action",r),{ImmediateActionElement:r}}));