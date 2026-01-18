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
import s from"@typo3/backend/utility.js";class a{windows={};open(...n){return this._localOpen.apply(null,n)}globalOpen(...n){return this._localOpen.apply(null,n)}localOpen=(n,e,l="newTYPO3frontendWindow",t="")=>this._localOpen(n,e,l,t);_localOpen(n,e,l="newTYPO3frontendWindow",t=""){if(!n)return null;e===null?e=!window.opener:e===void 0&&(e=!0);const o=this.windows[l]??window.open("",l,t);let r=!1;try{r=o.constructor.name==="Window"}catch{}const p=r&&!o.closed?o.location.href:null;if(s.urlsPointToSameServerSideResource(n,p))return o.location.replace(n),o.location.reload(),o.focus(),o;const i=window.open(n,l,t);return this.windows[l]=i,e&&i.focus(),i}}const d=new a;top.TYPO3.WindowManager||(top.document===window.document?top.TYPO3.WindowManager=d:top.TYPO3.WindowManager=new a);export{d as default};
