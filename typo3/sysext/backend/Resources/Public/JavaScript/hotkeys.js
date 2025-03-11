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
import e from"@typo3/backend/hotkeys/hotkey-storage.js"
import t from"@typo3/core/event/regular-event.js"
export var ModifierKeys
!function(e){e.META="meta",e.CTRL="control",e.SHIFT="shift",e.ALT="alt"}(ModifierKeys||(ModifierKeys={}))
class o{constructor(){this.normalizedCtrlModifierKey=navigator.platform.toLowerCase().startsWith("mac")?ModifierKeys.META:ModifierKeys.CTRL,this.defaultOptions={scope:"all",allowOnEditables:!1,allowRepeat:!1,bindElement:void 0},this.scopedHotkeyMap=e.getScopedHotkeyMap(),this.setScope("all"),this.registerEventHandler()}setScope(t){e.activeScope=t}getScope(){return e.activeScope}register(e,t,options={}){if(0===e.filter((e=>!Object.values(ModifierKeys).includes(e))).length)throw new Error('Attempted to register hotkey "'+e.join("+")+'" without a non-modifier key.')
e=e.map((e=>e.toLowerCase()))
const o={...this.defaultOptions,...options}
this.scopedHotkeyMap.has(o.scope)||this.scopedHotkeyMap.set(o.scope,new Map)
let i=this.composeAriaKeyShortcut(e)
const r=this.scopedHotkeyMap.get(o.scope),s=this.createHotkeyStructFromTrigger(e),n=JSON.stringify(s)
if(r.has(n)){const a=r.get(n)
a.options.bindElement?.removeAttribute("aria-keyshortcuts"),r.delete(n)}if(r.set(n,{struct:s,handler:t,options:o}),o.bindElement instanceof Element){const c=o.bindElement.getAttribute("aria-keyshortcuts")
null===c||c.includes(i)||(i=c+" "+i),o.bindElement.setAttribute("aria-keyshortcuts",i)}}registerEventHandler(){new t("keydown",(e=>{const t=this.findHotkeySetup(e)
if(null!==t&&(!e.repeat||t.options.allowRepeat)){if(!t.options.allowOnEditables){const o=e.target
if(o.isContentEditable||["INPUT","TEXTAREA","SELECT"].includes(o.tagName)&&!e.target.readOnly)return}t.handler(e)}})).bindTo(document)}findHotkeySetup(t){const o=[...new Set(["all",e.activeScope])],i=this.createHotkeyStructFromEvent(t),r=JSON.stringify(i)
for(const s of o){const n=this.scopedHotkeyMap.get(s)
if(n.has(r))return n.get(r)}return null}createHotkeyStructFromTrigger(e){const t=e.filter((e=>!Object.values(ModifierKeys).includes(e)))
if(t.length>1)throw new Error('Cannot register hotkey with more than one non-modifier key, "'+t.join("+")+'" given.')
return{modifiers:{meta:e.includes(ModifierKeys.META),ctrl:e.includes(ModifierKeys.CTRL),shift:e.includes(ModifierKeys.SHIFT),alt:e.includes(ModifierKeys.ALT)},key:t[0].toLowerCase()}}createHotkeyStructFromEvent(e){return{modifiers:{meta:e.metaKey,ctrl:e.ctrlKey,shift:e.shiftKey,alt:e.altKey},key:e.key?.toLowerCase()}}composeAriaKeyShortcut(e){const t=[]
for(let o of e)o="+"===o?"plus":o.replace(/[\u00A0-\u9999<>&]/g,(e=>"&#"+e.charCodeAt(0)+";")),t.push(o)
return t.sort(((e,t)=>{const o=Object.values(ModifierKeys).includes(e),i=Object.values(ModifierKeys).includes(t)
return o&&!i?-1:!o&&i?1:o&&i?-1:0})),t.join("+")}}let i
TYPO3.Hotkeys?i=TYPO3.Hotkeys:(i=new o,TYPO3.Hotkeys=i)
export default i
