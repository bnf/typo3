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
import e from"@typo3/backend/link-browser.js"
import n from"@typo3/backend/modal.js"
import t from"@typo3/core/ajax/ajax-request.js"
export default(function(){const r={onFieldChangeItems:null,setOnFieldChangeItems:function(e){r.onFieldChangeItems=e},checkReference:function(){const t='form[name="'+e.parameters.formName+'"] [data-formengine-input-name="'+e.parameters.itemName+'"]',o=r.getParent()
if(o&&o.document&&o.document.querySelector(t))return o.document.querySelector(t)
n.dismiss()}}
return e.finalizeFunction=function(o){const a=r.checkReference()
if(a){const i=e.getLinkAttributeValues()
i.url=o,new t(TYPO3.settings.ajaxUrls.link_browser_encodetypolink).withQueryArguments(i).get().then((async e=>{const t=await e.resolve()
t.typoLink&&(a.value=t.typoLink,a.dispatchEvent(new Event("change",{bubbles:!0,cancelable:!0})),r.onFieldChangeItems instanceof Array&&r.getParent().TYPO3.FormEngine.processOnFieldChange(r.onFieldChangeItems),n.dismiss())}))}},r.getParent=function(){let e
return void 0!==window.parent&&void 0!==window.parent.document.list_frame&&null!==window.parent.document.list_frame.parent.document.querySelector(".t3js-modal-iframe")?e=window.parent.document.list_frame:void 0!==window.parent&&void 0!==window.parent.frames.list_frame&&null!==window.parent.frames.list_frame.parent.document.querySelector(".t3js-modal-iframe")?e=window.parent.frames.list_frame:void 0!==window.frames&&void 0!==window.frames.frameElement&&null!==window.frames.frameElement&&window.frames.frameElement.classList.contains("t3js-modal-iframe")?e=window.frames.frameElement.contentWindow.parent:window.opener&&(e=window.opener),e},r}())
