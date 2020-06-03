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
define(["require","exports","TYPO3/CMS/Backend/ModuleMenu","TYPO3/CMS/Backend/Viewport"],(function(e,t,n,r){"use strict";Object.defineProperty(t,"__esModule",{value:!0});class i extends HTMLElement{connectedCallback(){this.getDelegate(this.getAttribute("action"))()}getDelegate(e){switch(e){case"TYPO3.ModuleMenu.App.refreshMenu":return n.App.refreshMenu.bind(n);case"TYPO3.Backend.Topbar.refresh":return r.Topbar.refresh.bind(r.Topbar);default:return null===e?console.error("Missing immediate action attribute"):console.warn("immediate action: "+e+" not found"),()=>{}}}static get tag(){return"typo3-immediate-action"}}t.ImmediateActionElement=i,window.customElements.define(i.tag,i)}));