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
define(["TYPO3/CMS/Backend/InfoWindow","TYPO3/CMS/Core/Event/RegularEvent","TYPO3/CMS/Backend/Toolbar/ShortcutMenu","TYPO3/CMS/Core/DocumentService"],(function(t,e,s,n){"use strict";class a{constructor(){this.delegates={},this.createDelegates(),n.ready().then(()=>this.registerEvents())}static resolveArguments(t){if(t.dataset.dispatchArgs){const e=t.dataset.dispatchArgs.replace(/&quot;/g,'"'),s=JSON.parse(e);return s instanceof Array?a.trimItems(s):null}if(t.dataset.dispatchArgsList){const e=t.dataset.dispatchArgsList.split(",");return a.trimItems(e)}return null}static trimItems(t){return t.map(t=>t instanceof String?t.trim():t)}static enrichItems(t,e,s){return t.map(t=>t instanceof Object&&t.$event?t.$target?s:t.$event?e:void 0:t)}createDelegates(){this.delegates={"TYPO3.InfoWindow.showItem":t.showItem.bind(null),"TYPO3.ShortcutMenu.createShortcut":s.createShortcut.bind(s)}}registerEvents(){new e("click",this.handleClickEvent.bind(this)).delegateTo(document,"[data-dispatch-action]")}handleClickEvent(t,e){t.preventDefault(),this.delegateTo(e)}delegateTo(t){const e=t.dataset.dispatchAction,s=a.resolveArguments(t);this.delegates[e]&&this.delegates[e].apply(null,s||[])}}return new a}));