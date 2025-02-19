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
import*as e from"css-tree";function r(r,i,l){const c=e.parse(r),s=n(l),a=t(i);return e.walk(c,(e=>(a(e),s(e)))),e.generate(c)}function t(e){return r=>{if("Url"!==r.type)return;const t=r;if(t.value.startsWith("data:")||t.value.startsWith("/")||t.value.includes("://"))return;const n=new URL(e.replace(/\?.+/,"")+"/../"+t.value,document.baseURI);t.value=n.pathname+n.search}}function n(r){return""===r?()=>{}:t=>{if("Selector"!==t.type)return;const n=t;if(n.children.isEmpty)return e.walk.skip;const i=e.parse(r+"{}"),l=e.find(i,(e=>"Selector"===e.type));if(null===l)throw new Error(`Failed to parse "${r}" as CSS prefix`);if("PseudoClassSelector"===n.children.first.type&&"root"===n.children.first.name)return n.children.shift(),n.children.prependList(l.children),e.walk.skip;let c=!1;return n.children.forEach(((e,r)=>{"TypeSelector"===e.type&&["html","body"].includes(e.name.toLowerCase())&&(c?n.children.remove(r):(n.children.replace(r,l.children),c=!0))})),c||(n.children.unshift({type:"Combinator",loc:null,name:" "}),n.children.prependList(l.children)),e.walk.skip}}export{n as cssPrefixer,t as cssRelocator,r as prefixAndRebaseCss};