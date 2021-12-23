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
import{KeyTypesEnum}from"TYPO3/CMS/Backend/Enum/KeyTypes.esm.js";import $ from"jquery.esm.js";import PersistentStorage from"TYPO3/CMS/Backend/Storage/Persistent.esm.js";import"TYPO3/CMS/Backend/Element/IconElement.esm.js";import"TYPO3/CMS/Backend/NewContentElementWizardButton.esm.js";var IdentifierEnum;!function(e){e.pageTitle=".t3js-title-inlineedit",e.hiddenElements=".t3js-hidden-record"}(IdentifierEnum||(IdentifierEnum={}));class PageActions{constructor(){this.pageId=0,this.pageOverlayId=0,this.$pageTitle=null,this.$showHiddenElementsCheckbox=null,$(()=>{this.initializeElements(),this.initializeEvents(),this.initializePageTitleRenaming()})}setPageId(e){this.pageId=e}setLanguageOverlayId(e){this.pageOverlayId=e}initializePageTitleRenaming(){if(!$.isReady)return void $(()=>{this.initializePageTitleRenaming()});if(this.pageId<=0)return;const e=$('<button type="button" class="btn btn-link" aria-label="'+TYPO3.lang.editPageTitle+'" data-action="edit"><typo3-backend-icon identifier="actions-open" size="small"></typo3-backend-icon></button>');e.on("click",()=>{this.editPageTitle()}),this.$pageTitle.on("dblclick",()=>{this.editPageTitle()}).append(e)}initializeElements(){this.$pageTitle=$(IdentifierEnum.pageTitle+":first"),this.$showHiddenElementsCheckbox=$("#checkTt_content_showHidden")}initializeEvents(){this.$showHiddenElementsCheckbox.on("change",this.toggleContentElementVisibility)}toggleContentElementVisibility(e){const t=$(e.currentTarget),i=$(IdentifierEnum.hiddenElements),n=$('<span class="form-check-spinner"><typo3-backend-icon identifier="spinner-circle" size="auto"></typo3-backend-icon></span>');t.hide().after(n),t.prop("checked")?i.slideDown():i.slideUp(),PersistentStorage.set("moduleData.web_layout.tt_content_showHidden",t.prop("checked")?"1":"0").done(()=>{n.remove(),t.show()})}editPageTitle(){const e=$('<form class="t3js-title-edit-form"><div class="form-group"><div class="input-group input-group-lg"><input class="form-control t3js-title-edit-input"><button class="btn btn-default" type="button" data-action="submit"><typo3-backend-icon identifier="actions-save" size="small"></typo3-backend-icon></button> <button class="btn btn-default" type="button" data-action="cancel"><typo3-backend-icon identifier="actions-close" size="small"></typo3-backend-icon></button> </div></div></form>'),t=e.find("input");e.find('[data-action="cancel"]').on("click",()=>{e.replaceWith(this.$pageTitle),this.initializePageTitleRenaming()}),e.find('[data-action="submit"]').on("click",()=>{const i=t.val().trim();""!==i&&this.$pageTitle.text()!==i?this.saveChanges(t):e.find('[data-action="cancel"]').trigger("click")}),t.parents("form").on("submit",e=>(e.preventDefault(),!1));const i=this.$pageTitle;i.children().last().remove(),i.replaceWith(e),t.val(i.text()).focus(),t.on("keydown",t=>{switch(t.which){case KeyTypesEnum.ENTER:e.find('[data-action="submit"]').trigger("click");break;case KeyTypesEnum.ESCAPE:e.find('[data-action="cancel"]').trigger("click")}})}saveChanges(e){const t=e.parents("form.t3js-title-edit-form");t.find("button").addClass("disabled"),e.attr("disabled","disabled");let i,n={};i=this.pageOverlayId>0?this.pageOverlayId:this.pageId,n.data={},n.data.pages={},n.data.pages[i]={title:e.val()},import("TYPO3/CMS/Backend/AjaxDataHandler.esm.js").then(({default:i})=>{i.process(n).then(()=>{t.find("[data-action=cancel]").trigger("click"),this.$pageTitle.text(e.val()),this.initializePageTitleRenaming(),top.document.dispatchEvent(new CustomEvent("typo3:pagetree:refresh"))}).catch(()=>{t.find("[data-action=cancel]").trigger("click")})})}}export default new PageActions;