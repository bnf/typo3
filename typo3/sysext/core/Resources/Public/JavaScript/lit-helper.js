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
define(["require","exports","lit-html","lit-html/directives/unsafe-html","lit-html/directives/until","TYPO3/CMS/Backend/Icons","TYPO3/CMS/Backend/Element/SpinnerElement"],(function(e,t,n,i,r,o){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.spread=t.icon=t.lll=t.renderHTML=void 0,t.renderHTML=e=>{const t=document.createElement("div");return n.render(e,t),t.innerHTML},t.lll=e=>window.TYPO3&&window.TYPO3.lang&&"string"==typeof window.TYPO3.lang[e]?window.TYPO3.lang[e]:"",t.icon=(e,t="small")=>{const s=o.getIcon(e,t).then(e=>n.html`${i.unsafeHTML(e)}`);return n.html`${r.until(s,n.html`<typo3-backend-spinner size="${t}"></typo3-backend-spinner>`)}`};const s=new WeakMap;t.spread=n.directive(e=>t=>{const i=s.get(t);if(i!==e){if(s.set(t,e),e)for(const r in e){const o=e[r];if(o===n.noChange)continue;const s=r[0],l=t.committer.element;if("@"!==s)if("."!==s){if("?"!==s)i&&i[r]===o||(null!=o?l.setAttribute(r,String(o)):l.removeAttribute(r));else if(!i||i[r]!==o){const e=r.slice(1);o?l.setAttribute(e,""):l.removeAttribute(e)}}else i&&i[r]===o||(l[r.slice(1)]=o);else{const e=i&&i[r];if(!e||e!==o){const t=r.slice(1);e&&l.removeEventListener(t,e),l.addEventListener(t,o)}}}if(i)for(const n in i)if(!e||!(n in e)){const e=n[0],r=t.committer.element;if("@"===e){r.removeEventListener(n.slice(1),i[n]);continue}if("."===e){r[n.slice(1)]=void 0;continue}if("?"===e){r.removeAttribute(n.slice(1));continue}r.removeAttribute(n)}}})}));