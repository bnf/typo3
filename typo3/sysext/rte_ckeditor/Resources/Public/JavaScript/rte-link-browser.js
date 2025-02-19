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
import t from"@typo3/backend/link-browser.js";import e from"@typo3/backend/modal.js";import i from"@typo3/core/event/regular-event.js";import{LINK_ALLOWED_ATTRIBUTES as n,addLinkPrefix as o}from"@typo3/rte-ckeditor/plugin/typo3-link.js";const s=new class{constructor(){this.editor=null,this.selectionStartPosition=null,this.selectionEndPosition=null}initialize(){this.editor=e.currentModal.userData.editor,this.selectionStartPosition=e.currentModal.userData.selectionStartPosition,this.selectionEndPosition=e.currentModal.userData.selectionEndPosition;const t=document.querySelector(".t3js-removeCurrentLink");null!==t&&new i("click",(t=>{t.preventDefault(),this.restoreSelection(),this.editor.execute("unlink"),e.dismiss()})).bindTo(t)}finalizeFunction(i){const n=t.getLinkAttributeValues(),o=n.params?n.params:"";delete n.params;const s=this.convertAttributes(n,"");this.restoreSelection(),this.editor.execute("link",this.sanitizeLink(i,o),s),e.dismiss()}restoreSelection(){this.editor.model.change((t=>{const e=[t.createRange(this.selectionStartPosition,this.selectionEndPosition)];t.setSelection(e)}))}convertAttributes(t,e){const i={attrs:{}};for(const[e,s]of Object.entries(t))n.includes(e)&&(i.attrs[o(e)]=s);return"string"==typeof e&&""!==e&&(i.linkText=e),i}sanitizeLink(t,e){const i=t.match(/^([a-z0-9]+:\/\/[^:/?#]+(?:\/?[^?#]*)?)(\??[^#]*)(#?.*)$/);if(i&&i.length>0){t=i[1]+i[2];const n=i[2].length>0?"&":"?";e.length>0&&(e.startsWith("&")&&(e=e.substr(1)),e.length>0&&(t+=n+e)),t+=i[3]}return t}};t.finalizeFunction=t=>{s.finalizeFunction(t)};export{s as default};