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
define(["require","exports","lit-html"],(function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.spread=t.lll=t.renderHTML=t.renderNodes=void 0,t.renderNodes=e=>{const t=document.createElement("div");return n.render(e,t),t.childNodes},t.renderHTML=e=>{const t=document.createElement("div");return n.render(e,t),t.innerHTML},t.lll=e=>window.TYPO3&&window.TYPO3.lang&&"string"==typeof window.TYPO3.lang[e]?window.TYPO3.lang[e]:"";const i=new WeakMap;t.spread=n.directive(e=>t=>{const r=i.get(t);if(r!==e){if(i.set(t,e),e)for(const i in e){const o=e[i];if(o===n.noChange)continue;const s=i[0],c=t.committer.element;if("@"!==s)if("."!==s){if("?"!==s)r&&r[i]===o||(null!=o?c.setAttribute(i,String(o)):c.removeAttribute(i));else if(!r||r[i]!==o){const e=i.slice(1);o?c.setAttribute(e,""):c.removeAttribute(e)}}else r&&r[i]===o||(c[i.slice(1)]=o);else{const e=r&&r[i];if(!e||e!==o){const t=i.slice(1);e&&c.removeEventListener(t,e),c.addEventListener(t,o)}}}if(r)for(const n in r)if(!e||!(n in e)){const e=n[0],i=t.committer.element;if("@"===e){i.removeEventListener(n.slice(1),r[n]);continue}if("."===e){i[n.slice(1)]=void 0;continue}if("?"===e){i.removeAttribute(n.slice(1));continue}i.removeAttribute(n)}}})}));