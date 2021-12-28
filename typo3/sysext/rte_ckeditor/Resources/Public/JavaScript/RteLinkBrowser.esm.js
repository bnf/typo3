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
import $ from"jquery";import LinkBrowser from"TYPO3/CMS/Recordlist/LinkBrowser.esm.js";import Modal from"TYPO3/CMS/Backend/Modal.esm.js";class RteLinkBrowser{constructor(){this.plugin=null,this.CKEditor=null,this.ranges=[],this.siteUrl=""}initialize(t){let e=Modal.currentModal.data("ckeditor");if(void 0!==e)this.CKEditor=e;else{let e;e=void 0!==top.TYPO3.Backend&&void 0!==top.TYPO3.Backend.ContentContainer.get()?top.TYPO3.Backend.ContentContainer.get():window.parent,$.each(e.CKEDITOR.instances,(e,i)=>{i.id===t&&(this.CKEditor=i)})}window.addEventListener("beforeunload",()=>{this.CKEditor.getSelection().selectRanges(this.ranges)}),this.ranges=this.CKEditor.getSelection().getRanges(),$.extend(RteLinkBrowser,$("body").data()),$(".t3js-class-selector").on("change",()=>{$("option:selected",this).data("linkTitle")&&$(".t3js-linkTitle").val($("option:selected",this).data("linkTitle"))}),$(".t3js-removeCurrentLink").on("click",t=>{t.preventDefault(),this.CKEditor.execCommand("unlink"),Modal.dismiss()})}finalizeFunction(t){const e=this.CKEditor.document.createElement("a"),i=LinkBrowser.getLinkAttributeValues();let n=i.params?i.params:"";i.target&&e.setAttribute("target",i.target),i.class&&e.setAttribute("class",i.class),i.title&&e.setAttribute("title",i.title),delete i.title,delete i.class,delete i.target,delete i.params,$.each(i,(t,i)=>{e.setAttribute(t,i)});const s=t.match(/^([a-z0-9]+:\/\/[^:\/?#]+(?:\/?[^?#]*)?)(\??[^#]*)(#?.*)$/);if(s&&s.length>0){t=s[1]+s[2];const e=s[2].length>0?"&":"?";n.length>0&&("&"===n[0]&&(n=n.substr(1)),n.length>0&&(t+=e+n)),t+=s[3]}e.setAttribute("href",t);const r=this.CKEditor.getSelection();r.selectRanges(this.ranges),r&&""===r.getSelectedText()&&r.selectElement(r.getStartElement()),r&&r.getSelectedText()?e.setText(r.getSelectedText()):e.setText(e.getAttribute("href")),this.CKEditor.insertElement(e),Modal.dismiss()}}let rteLinkBrowser=new RteLinkBrowser;export default rteLinkBrowser;LinkBrowser.finalizeFunction=t=>{rteLinkBrowser.finalizeFunction(t)};