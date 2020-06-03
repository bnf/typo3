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
define(["require","exports","TYPO3/CMS/Backend/Element/ImmediateActionElement","TYPO3/CMS/Backend/ModuleMenu","TYPO3/CMS/Backend/Viewport"],(function(e,t,a,n,c){"use strict";function o(e){return new Promise(t=>{!function a(){const n=document.querySelector(e);n?t(n):window.requestAnimationFrame(a)}()})}Object.defineProperty(t,"__esModule",{value:!0}),describe("TYPO3/CMS/Backend/Element/ImmediateActionElement:",()=>{it("dispatches action when created via createElement",()=>{const e={callback:()=>{}};spyOn(e,"callback").and.callThrough(),c.Topbar.refresh=e.callback;const t=document.createElement("typo3-immediate-action");t.setAttribute("action","TYPO3.Backend.Topbar.refresh"),expect(e.callback).not.toHaveBeenCalled(),document.body.appendChild(t).remove(),o(a.tag).then(()=>{expect(e.callback).toHaveBeenCalled()})}),it("dispatches action when created from string",()=>{const e={callback:()=>{}};spyOn(e,"callback").and.callThrough(),n.App.refreshMenu=e.callback;const t=document.createRange().createContextualFragment('<typo3-immediate-action action="TYPO3.ModuleMenu.App.refreshMenu"></typo3-immediate-action>').querySelector("typo3-immediate-action");expect(e.callback).not.toHaveBeenCalled(),document.body.appendChild(t).remove(),o(a.tag).then(()=>{expect(e.callback).toHaveBeenCalled()})}),it("dispatches action when created via innerHTML",()=>{const e=()=>{};n.App.refreshMenu=e,document.body.innerHTML+='<typo3-immediate-action action="TYPO3.ModuleMenu.App.refreshMenu"></typo3-immediate-action>',o(a.tag).then(t=>{expect(e).toHaveBeenCalled(),t.remove()})})})}));