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
define(["require","exports","TYPO3/CMS/Backend/ModuleMenu","TYPO3/CMS/Backend/Viewport"],(function(e,a,t,n){"use strict";Object.defineProperty(a,"__esModule",{value:!0});const c=document.createElement("div");let i;document.body.appendChild(c),describe("TYPO3/CMS/Backend/Element/ImmediateActionElement:",()=>{beforeEach(()=>{i=document.createElement("div"),c.appendChild(i)}),afterEach(()=>{c.innerHTML="",i=null}),it("dispatches action when created via createElement",async()=>{const e={callback:()=>{}};spyOn(e,"callback").and.callThrough(),n.Topbar.refresh=e.callback;const a=document.createElement("typo3-immediate-action");a.setAttribute("action","TYPO3.Backend.Topbar.refresh"),expect(e.callback).not.toHaveBeenCalled(),i.appendChild(a),await new Promise(window.requestAnimationFrame),expect(e.callback).toHaveBeenCalled()}),it("dispatches action when created from string",async()=>{const e={callback:()=>{}};spyOn(e,"callback").and.callThrough(),t.App.refreshMenu=e.callback;const a=document.createRange().createContextualFragment('<typo3-immediate-action action="TYPO3.ModuleMenu.App.refreshMenu"></typo3-immediate-action>').querySelector("typo3-immediate-action");expect(e.callback).not.toHaveBeenCalled(),i.appendChild(a),await new Promise(window.requestAnimationFrame),expect(e.callback).toHaveBeenCalled()}),it("dispatches action when created via innerHTML",async()=>{const e={callback:()=>{}};spyOn(e,"callback").and.callThrough(),t.App.refreshMenu=e.callback,i.innerHTML+='<typo3-immediate-action action="TYPO3.ModuleMenu.App.refreshMenu"></typo3-immediate-action>',await new Promise(window.requestAnimationFrame),expect(e.callback).toHaveBeenCalled()})})}));