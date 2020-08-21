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
define((function(){"use strict";class n{constructor(){this.windows={},this.open=(...n)=>this.localOpen.apply(this,n),this.globalOpen=(...n)=>this.localOpen.apply(this,n)}localOpen(n,o,t="newTYPO3frontendWindow",i=""){if(!n)return null;null===o?o=!window.opener:void 0===o&&(o=!0);const e=this.windows[t];if((e instanceof Window&&!e.closed?e.location.href:null)===n)return e.location.reload(),e;const s=window.open(n,t,i);return this.windows[t]=s,o&&s.focus(),s}}const o=new n;return top.TYPO3.WindowManager||(top.document===window.document?top.TYPO3.WindowManager=o:top.TYPO3.WindowManager=new n),o}));