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
import{Popover as e}from"bootstrap";export default new class{constructor(){this.DEFAULT_SELECTOR='[data-bs-toggle="popover"]',this.initialize()}initialize(t){t=t||this.DEFAULT_SELECTOR,document.querySelectorAll(t).forEach((t=>{this.applyTitleIfAvailable(t),new e(t)}))}popover(t){this.toIterable(t).forEach((t=>{this.applyTitleIfAvailable(t),new e(t)}))}setOptions(t,o){const n=(o=o||{}).title||t.dataset.title||t.dataset.bsTitle||"",l=o.content||t.dataset.bsContent||"";t.dataset.bsTitle=n,t.dataset.bsOriginalTitle=n,t.dataset.bsContent=l,t.dataset.bsPlacement="auto",delete o.title,delete o.content;const s=e.getInstance(t);if(null!==s){s.setContent({".popover-header":n,".popover-body":l});for(const[e,t]of Object.entries(o))s._config[e]=t}else console.warn("Failed to get popover instance for element.")}show(t){const o=e.getInstance(t);null!==o?o.show():console.warn("Failed to get popover instance for element.")}hide(t){const o=e.getInstance(t);null!==o?o.hide():console.warn("Failed to get popover instance for element.")}destroy(t){const o=e.getInstance(t);null!==o?o.dispose():console.warn("Failed to get popover instance for element.")}toggle(t){const o=e.getInstance(t);null!==o?o.toggle():console.warn("Failed to get popover instance for element.")}toIterable(e){let t;if(e instanceof HTMLElement)t=[e];else{if(!(e instanceof NodeList))throw`Cannot consume element of type ${e.constructor.name}, expected NodeListOf<HTMLElement> or HTMLElement`;t=e}return t}applyTitleIfAvailable(e){const t=e.title||e.dataset.title||"";t&&(e.dataset.bsTitle=t)}};