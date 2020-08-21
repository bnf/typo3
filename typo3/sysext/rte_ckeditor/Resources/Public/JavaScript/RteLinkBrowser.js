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
define(["jquery","TYPO3/CMS/Recordlist/LinkBrowser","TYPO3/CMS/Backend/Modal","ckeditor"],(function(t,e,i){"use strict";class s{constructor(){this.plugin=null,this.CKEditor=null,this.ranges=[],this.siteUrl=""}initialize(e){let n=i.currentModal.data("ckeditor");if(void 0!==n)this.CKEditor=n;else{let i;i=void 0!==top.TYPO3.Backend&&void 0!==top.TYPO3.Backend.ContentContainer.get()?top.TYPO3.Backend.ContentContainer.get():window.parent,t.each(i.CKEDITOR.instances,(t,i)=>{i.id===e&&(this.CKEditor=i)})}window.addEventListener("beforeunload",()=>{this.CKEditor.getSelection().selectRanges(this.ranges)}),this.ranges=this.CKEditor.getSelection().getRanges(),t.extend(s,t("body").data()),t(".t3js-class-selector").on("change",()=>{t("option:selected",this).data("linkTitle")&&t(".t3js-linkTitle").val(t("option:selected",this).data("linkTitle"))}),t(".t3js-removeCurrentLink").on("click",t=>{t.preventDefault(),this.CKEditor.execCommand("unlink"),i.dismiss()})}finalizeFunction(s){const n=this.CKEditor.document.createElement("a"),l=e.getLinkAttributeValues();let a=l.params?l.params:"";l.target&&n.setAttribute("target",l.target),l.class&&n.setAttribute("class",l.class),l.title&&n.setAttribute("title",l.title),delete l.title,delete l.class,delete l.target,delete l.params,t.each(l,(t,e)=>{n.setAttribute(t,e)});const r=s.match(/^([a-z0-9]+:\/\/[^:\/?#]+(?:\/?[^?#]*)?)(\??[^#]*)(#?.*)$/);if(r&&r.length>0){s=r[1]+r[2];const t=r[2].length>0?"&":"?";a.length>0&&("&"===a[0]&&(a=a.substr(1)),a.length>0&&(s+=t+a)),s+=r[3]}n.setAttribute("href",s);const o=this.CKEditor.getSelection();o.selectRanges(this.ranges),o&&""===o.getSelectedText()&&o.selectElement(o.getStartElement()),o&&o.getSelectedText()?n.setText(o.getSelectedText()):n.setText(n.getAttribute("href")),this.CKEditor.insertElement(n),i.dismiss()}}let n=new s;return n}));