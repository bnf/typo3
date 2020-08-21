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
define(["lit-html","lit-html/directives/unsafe-html","lit-html/directives/until","TYPO3/CMS/Backend/Icons","TYPO3/CMS/Backend/Element/SpinnerElement"],(function(n,e,t,i){"use strict";return{renderHTML:e=>{const t=document.createElement("div");return n.render(e,t),t.innerHTML},lll:n=>window.TYPO3&&window.TYPO3.lang&&"string"==typeof window.TYPO3.lang[n]?window.TYPO3.lang[n]:"",icon:(l,r="small")=>{const c=i.getIcon(l,r).then(t=>n.html`${e.unsafeHTML(t)}`);return n.html`${t.until(c,n.html`<typo3-backend-spinner size="${r}"></typo3-backend-spinner>`)}`}}}));