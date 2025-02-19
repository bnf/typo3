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
import n from"@typo3/backend/utility.js";class o{constructor(){this.windows={},this.localOpen=(n,o,e="newTYPO3frontendWindow",t="")=>this._localOpen(n,o,e,t)}open(...n){return this._localOpen.apply(null,n)}globalOpen(...n){return this._localOpen.apply(null,n)}_localOpen(o,e,t="newTYPO3frontendWindow",l=""){if(!o)return null;null===e?e=!window.opener:void 0===e&&(e=!0);const i=this.windows[t]??window.open("",t,l);let r=!1;try{r="Window"===i.constructor.name}catch{}const c=r&&!i.closed?i.location.href:null;if(n.urlsPointToSameServerSideResource(o,c))return i.location.replace(o),i.location.reload(),i.focus(),i;const a=window.open(o,t,l);return this.windows[t]=a,e&&a.focus(),a}}const e=new o;top.TYPO3.WindowManager||(top.document===window.document?top.TYPO3.WindowManager=e:top.TYPO3.WindowManager=new o);export{e as default};