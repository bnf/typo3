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
import t from"@typo3/backend/info-window.js";import e from"@typo3/core/event/regular-event.js";import s from"@typo3/backend/toolbar/shortcut-menu.js";import r from"@typo3/backend/window-manager.js";import a from"@typo3/backend/module-menu.js";import o from"@typo3/core/document-service.js";import n from"@typo3/backend/utility.js";class i{constructor(){this.delegates={},this.createDelegates(),o.ready().then((()=>this.registerEvents()))}static resolveArguments(t){if(t.dataset.dispatchArgs){const e=t.dataset.dispatchArgs.replace(/&quot;/g,'"'),s=JSON.parse(e);return s instanceof Array?n.trimItems(s):null}if(t.dataset.dispatchArgsList){const e=t.dataset.dispatchArgsList.split(",");return n.trimItems(e)}return null}createDelegates(){this.delegates={"TYPO3.InfoWindow.showItem":t.showItem.bind(null),"TYPO3.ShortcutMenu.createShortcut":s.createShortcut.bind(s),"TYPO3.WindowManager.localOpen":r.localOpen.bind(r),"TYPO3.ModuleMenu.showModule":a.App.showModule.bind(a.App)}}registerEvents(){new e("click",this.handleClickEvent.bind(this)).delegateTo(document,"[data-dispatch-action]")}handleClickEvent(t,e){t.preventDefault(),this.delegateTo(t,e)}delegateTo(t,e){if(e.hasAttribute("data-dispatch-disabled"))return;const s=e.dataset.dispatchAction;let r=i.resolveArguments(e);r instanceof Array&&(r=r.map((s=>{switch(s){case"{$target}":return e;case"{$event}":return t;default:return s}}))),this.delegates[s]&&this.delegates[s].apply(null,r||[])}}var d=new i;export{d as default};