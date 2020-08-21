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
define(["TYPO3/CMS/Backend/Element/ImmediateActionElement","TYPO3/CMS/Backend/ModuleMenu","TYPO3/CMS/Backend/Viewport"],(function(e,a,t){"use strict";describe("TYPO3/CMS/Backend/Element/ImmediateActionElement:",()=>{let c;beforeEach(()=>{c=document.createElement("div"),document.body.appendChild(c)}),afterEach(()=>{c.remove(),c=null}),it("dispatches action when created via constructor",()=>{const a=t.Topbar.refresh,n={callback:()=>{}};spyOn(n,"callback").and.callThrough(),t.Topbar.refresh=n.callback;const l=new e.ImmediateActionElement;l.setAttribute("action","TYPO3.Backend.Topbar.refresh"),expect(n.callback).not.toHaveBeenCalled(),c.appendChild(l),expect(n.callback).toHaveBeenCalled(),t.Topbar.refresh=a}),it("dispatches action when created via createElement",()=>{const e=t.Topbar.refresh,a={callback:()=>{}};spyOn(a,"callback").and.callThrough(),t.Topbar.refresh=a.callback;const n=document.createElement("typo3-immediate-action");n.setAttribute("action","TYPO3.Backend.Topbar.refresh"),expect(a.callback).not.toHaveBeenCalled(),c.appendChild(n),expect(a.callback).toHaveBeenCalled(),t.Topbar.refresh=e}),it("dispatches action when created from string",()=>{const e=a.App.refreshMenu,t={callback:()=>{}};spyOn(t,"callback").and.callThrough(),a.App.refreshMenu=t.callback;const n=document.createRange().createContextualFragment('<typo3-immediate-action action="TYPO3.ModuleMenu.App.refreshMenu"></typo3-immediate-action>').querySelector("typo3-immediate-action");expect(t.callback).not.toHaveBeenCalled(),c.appendChild(n),expect(t.callback).toHaveBeenCalled(),a.App.refreshMenu=e}),it("dispatches action when created via innerHTML",()=>{const e=a.App.refreshMenu,t={callback:()=>{}};spyOn(t,"callback").and.callThrough(),a.App.refreshMenu=t.callback,c.innerHTML='<typo3-immediate-action action="TYPO3.ModuleMenu.App.refreshMenu"></typo3-immediate-action>',expect(t.callback).toHaveBeenCalled(),a.App.refreshMenu=e})})}));