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
define((function(){"use strict";class t{static update(e,r,i,n){if("number"==typeof r)r=r.toString(10);else if("string"!=typeof r)throw new SyntaxError("identifier must be of type string");if("number"==typeof n)n=n.toString(10);else if("string"!=typeof n&&null!=n)throw new SyntaxError("mount must be of type string");const o=t.assignProperties({mount:n,identifier:r,selected:i},t.fetch(e));t.commit(e,o)}static updateWithCurrentMount(e,r,i){t.update(e,r,i,t.current(e).mount)}static current(e){return t.fetch(e)||t.createCurrentState()}static purge(){Object.keys(sessionStorage).filter(e=>e.startsWith(t.prefix)).forEach(t=>sessionStorage.removeItem(t))}static fetch(e){const r=sessionStorage.getItem(t.prefix+e);return null===r?null:JSON.parse(r)}static commit(e,r){sessionStorage.setItem(t.prefix+e,JSON.stringify(r))}static assignProperties(e,r){let i=Object.assign(t.createCurrentState(),r);return e.mount&&(i.mount=e.mount),e.identifier&&(i.identifier=e.identifier),e.selected&&(i.selection=i.identifier),i}static createCurrentState(){return{mount:null,identifier:"",selection:null}}}if(t.prefix="t3-module-state-",window.ModuleStateStorage=t,!top.fsMod||!top.fsMod.isProxy){const e=e=>new Proxy({},{get(r,i){const n=i.toString(),o=t.current(n);return"identifier"===e?o.identifier:"selection"===e?o.selection:void 0},set(t,e,r,i){throw new Error("Writing to fsMod is not possible anymore, use ModuleStateStorage instead.")}}),r={isProxy:!0,recentIds:{},navFrameHighlightedID:{},currentBank:"0"};top.fsMod=new Proxy(r,{get(r,i){const n=i.toString();return"isProxy"===n||(console.warn("Reading from fsMod is deprecated, use ModuleStateStorage instead."),"recentIds"===n?e("identifier"):"navFrameHighlightedID"===n?e("selection"):"currentBank"===n?t.current("web").mount:void 0)},set(t,e,r,i){throw new Error("Writing to fsMod is not possible anymore, use ModuleStateStorage instead.")}})}return{ModuleStateStorage:t}}));