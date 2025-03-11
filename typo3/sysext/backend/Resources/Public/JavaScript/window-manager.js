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
import n from"@typo3/backend/utility.js"
class o{constructor(){this.windows={},this.localOpen=(n,o,windowName="newTYPO3frontendWindow",windowFeatures="")=>this._localOpen(n,o,windowName,windowFeatures)}open(...params){return this._localOpen.apply(null,params)}globalOpen(...params){return this._localOpen.apply(null,params)}_localOpen(o,e,windowName="newTYPO3frontendWindow",windowFeatures=""){if(!o)return null
null===e?e=!window.opener:void 0===e&&(e=!0)
const w=this.windows[windowName]??window.open("",windowName,windowFeatures)
let t=!1
try{t="Window"===w.constructor.name}catch{}const a=t&&!w.closed?w.location.href:null
if(n.urlsPointToSameServerSideResource(o,a))return w.location.replace(o),w.location.reload(),w.focus(),w
const i=window.open(o,windowName,windowFeatures)
return this.windows[windowName]=i,e&&i.focus(),i}}const e=new o
top.TYPO3.WindowManager||(top.document===window.document?top.TYPO3.WindowManager=e:top.TYPO3.WindowManager=new o)
export default e
