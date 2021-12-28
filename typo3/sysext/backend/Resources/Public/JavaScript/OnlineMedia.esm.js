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
import $ from"jquery";import{MessageUtility}from"TYPO3/CMS/Backend/Utility/MessageUtility.esm.js";import{KeyTypesEnum}from"TYPO3/CMS/Backend/Enum/KeyTypes.esm.js";import NProgress from"nprogress";import AjaxRequest from"TYPO3/CMS/Core/Ajax/AjaxRequest.esm.js";import SecurityUtility from"TYPO3/CMS/Core/SecurityUtility.esm.js";import Modal from"TYPO3/CMS/Backend/Modal.esm.js";import Severity from"TYPO3/CMS/Backend/Severity.esm.js";class OnlineMedia{constructor(){this.securityUtility=new SecurityUtility,$(()=>{this.registerEvents()})}registerEvents(){const e=this;$(document).on("click",".t3js-online-media-add-btn",t=>{e.triggerModal($(t.currentTarget))})}addOnlineMedia(e,t){const i=e.data("target-folder"),r=e.data("online-media-allowed"),o=e.data("file-irre-object");NProgress.start(),new AjaxRequest(TYPO3.settings.ajaxUrls.online_media_create).post({url:t,targetFolder:i,allowed:r}).then(async e=>{const t=await e.resolve();if(t.file){const e={actionName:"typo3:foreignRelation:insert",objectGroup:o,table:"sys_file",uid:t.file};MessageUtility.send(e)}else{const e=Modal.confirm("ERROR",t.error,Severity.error,[{text:TYPO3.lang["button.ok"]||"OK",btnClass:"btn-"+Severity.getCssClass(Severity.error),name:"ok",active:!0}]).on("confirm.button.ok",()=>{e.modal("hide")})}NProgress.done()})}triggerModal(e){const t=e.data("btn-submit")||"Add",i=e.data("placeholder")||"Paste media url here...",r=$.map(e.data("online-media-allowed").split(","),e=>'<span class="label label-success">'+this.securityUtility.encodeHtml(e.toUpperCase(),!1)+"</span>"),o=e.data("online-media-allowed-help-text")||"Allow to embed from sources:",a=$("<div>").attr("class","form-control-wrap").append([$("<input>").attr("type","text").attr("class","form-control online-media-url").attr("placeholder",i),$("<div>").attr("class","help-block").html(this.securityUtility.encodeHtml(o,!1)+"<br>"+r.join(" "))]),n=Modal.show(e.attr("title"),a,Severity.notice,[{text:t,btnClass:"btn btn-primary",name:"ok",trigger:()=>{const t=n.find("input.online-media-url").val();t&&(n.modal("hide"),this.addOnlineMedia(e,t))}}]);n.on("shown.bs.modal",e=>{$(e.currentTarget).find("input.online-media-url").first().focus().on("keydown",e=>{e.keyCode===KeyTypesEnum.ENTER&&n.find('button[name="ok"]').trigger("click")})})}}export default new OnlineMedia;