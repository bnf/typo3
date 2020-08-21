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
define(["TYPO3/CMS/Backend/ModuleMenu","TYPO3/CMS/Backend/Viewport"],(function(e,t){"use strict";class n extends HTMLElement{static getDelegate(n){switch(n){case"TYPO3.ModuleMenu.App.refreshMenu":return e.App.refreshMenu.bind(e);case"TYPO3.Backend.Topbar.refresh":return t.Topbar.refresh.bind(t.Topbar);default:throw Error('Unknown action "'+n+'"')}}static get observedAttributes(){return["action"]}attributeChangedCallback(e,t,n){"action"===e&&(this.action=n)}connectedCallback(){if(!this.action)throw new Error("Missing mandatory action attribute");n.getDelegate(this.action).apply(null,[])}}return window.customElements.define("typo3-immediate-action",n),{ImmediateActionElement:n}}));