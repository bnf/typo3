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
import $ from"jquery";import AjaxRequest from"@typo3/core/ajax/ajax-request.js";import PasswordStrength from"@typo3/install/module/password-strength.js";import InfoBox from"@typo3/install/renderable/info-box.js";import ProgressBar from"@typo3/install/renderable/progress-bar.js";import Severity from"@typo3/install/renderable/severity.js";class Installer{constructor(){this.selectorBody=".t3js-body",this.selectorModuleContent=".t3js-module-content",this.selectorMainContent=".t3js-installer-content",this.selectorProgressBar=".t3js-installer-progress",this.selectorDatabaseConnectOutput=".t3js-installer-databaseConnect-output",this.selectorDatabaseSelectOutput=".t3js-installer-databaseSelect-output",this.selectorDatabaseDataOutput=".t3js-installer-databaseData-output",this.initializeEvents(),$(()=>{this.initialize()})}initializeEvents(){$(document).on("click",".t3js-installer-environmentFolders-retry",e=>{e.preventDefault(),this.showEnvironmentAndFolders()}),$(document).on("click",".t3js-installer-environmentFolders-execute",e=>{e.preventDefault(),this.executeEnvironmentAndFolders()}),$(document).on("click",".t3js-installer-databaseConnect-execute",e=>{e.preventDefault(),this.executeDatabaseConnect()}),$(document).on("click",".t3js-installer-databaseSelect-execute",e=>{e.preventDefault(),this.executeDatabaseSelect()}),$(document).on("click",".t3js-installer-databaseData-execute",e=>{e.preventDefault(),this.executeDatabaseData()}),$(document).on("click",".t3js-installer-defaultConfiguration-execute",e=>{e.preventDefault(),this.executeDefaultConfiguration()}),$(document).on("click",".t3-install-form-password-toggle",e=>{e.preventDefault();const t=$(e.currentTarget),a=$(t.data("toggleTarget")),s=t.find(t.data("toggleIcon"));"password"===a.attr("type")?(s.removeClass("fa-lock").addClass("fa-eye"),a.attr("type","text")):(a.attr("type","password"),s.removeClass("fa-eye").addClass("fa-lock"))}),$(document).on("keyup",".t3-install-form-password-strength",()=>{PasswordStrength.initialize(".t3-install-form-password-strength")}),$(document).on("change","#t3js-connect-database-driver",e=>{let t=$(e.currentTarget).val();$(".t3-install-driver-data").hide(),$(".t3-install-driver-data input").attr("disabled","disabled"),$("#"+t+" input").attr("disabled",null),$("#"+t).show()})}initialize(){this.setProgress(0),this.getMainLayout()}getUrl(e){let t=location.href;return t=t.replace(location.search,""),void 0!==e&&(t=t+"?install[action]="+e),t}setProgress(e){let t=$(this.selectorProgressBar),a=0;0!==e&&(a=e/5*100,t.find(".progress-bar").empty().text(e+" / 5 - "+a+"% Complete")),t.find(".progress-bar").css("width",a+"%").attr("aria-valuenow",a)}getMainLayout(){new AjaxRequest(this.getUrl("mainLayout")).get({cache:"no-cache"}).then(async e=>{const t=await e.resolve();$(this.selectorBody).empty().append(t.html),this.checkInstallerAvailable()})}checkInstallerAvailable(){new AjaxRequest(this.getUrl("checkInstallerAvailable")).get({cache:"no-cache"}).then(async e=>{(await e.resolve()).success?this.checkEnvironmentAndFolders():this.showInstallerNotAvailable()})}showInstallerNotAvailable(){let e=$(this.selectorMainContent);new AjaxRequest(this.getUrl("showInstallerNotAvailable")).get({cache:"no-cache"}).then(async t=>{const a=await t.resolve();!0===a.success&&e.empty().append(a.html)})}checkEnvironmentAndFolders(){this.setProgress(1),new AjaxRequest(this.getUrl("checkEnvironmentAndFolders")).get({cache:"no-cache"}).then(async e=>{!0===(await e.resolve()).success?this.checkTrustedHostsPattern():this.showEnvironmentAndFolders()})}showEnvironmentAndFolders(){let e=$(this.selectorMainContent);new AjaxRequest(this.getUrl("showEnvironmentAndFolders")).get({cache:"no-cache"}).then(async t=>{const a=await t.resolve();if(!0===a.success){e.empty().html(a.html);let t=$(".t3js-installer-environment-details"),s=!1;Array.isArray(a.environmentStatusErrors)&&a.environmentStatusErrors.forEach(e=>{s=!0;let a=InfoBox.render(e.severity,e.title,e.message);t.append(a)}),Array.isArray(a.environmentStatusWarnings)&&a.environmentStatusWarnings.forEach(e=>{s=!0;let a=InfoBox.render(e.severity,e.title,e.message);t.append(a)}),Array.isArray(a.structureErrors)&&a.structureErrors.forEach(e=>{s=!0;let a=InfoBox.render(e.severity,e.title,e.message);t.append(a)}),s?(t.show(),$(".t3js-installer-environmentFolders-bad").show()):$(".t3js-installer-environmentFolders-good").show()}})}executeEnvironmentAndFolders(){new AjaxRequest(this.getUrl("executeEnvironmentAndFolders")).get({cache:"no-cache"}).then(async e=>{!0===(await e.resolve()).success&&this.checkTrustedHostsPattern()})}checkTrustedHostsPattern(){new AjaxRequest(this.getUrl("checkTrustedHostsPattern")).get({cache:"no-cache"}).then(async e=>{!0===(await e.resolve()).success?this.executeSilentConfigurationUpdate():this.executeAdjustTrustedHostsPattern()})}executeAdjustTrustedHostsPattern(){new AjaxRequest(this.getUrl("executeAdjustTrustedHostsPattern")).get({cache:"no-cache"}).then(()=>{this.executeSilentConfigurationUpdate()})}executeSilentConfigurationUpdate(){new AjaxRequest(this.getUrl("executeSilentConfigurationUpdate")).get({cache:"no-cache"}).then(async e=>{!0===(await e.resolve()).success?this.executeSilentTemplateFileUpdate():this.executeSilentConfigurationUpdate()})}executeSilentTemplateFileUpdate(){new AjaxRequest(this.getUrl("executeSilentTemplateFileUpdate")).get({cache:"no-cache"}).then(async e=>{!0===(await e.resolve()).success?this.checkDatabaseConnect():this.executeSilentTemplateFileUpdate()})}checkDatabaseConnect(){this.setProgress(2),new AjaxRequest(this.getUrl("checkDatabaseConnect")).get({cache:"no-cache"}).then(async e=>{!0===(await e.resolve()).success?this.checkDatabaseSelect():this.showDatabaseConnect()})}showDatabaseConnect(){let e=$(this.selectorMainContent);new AjaxRequest(this.getUrl("showDatabaseConnect")).get({cache:"no-cache"}).then(async t=>{const a=await t.resolve();!0===a.success&&(e.empty().html(a.html),$("#t3js-connect-database-driver").trigger("change"))})}executeDatabaseConnect(){let e=$(this.selectorDatabaseConnectOutput),t={"install[action]":"executeDatabaseConnect","install[token]":$(this.selectorModuleContent).data("installer-database-connect-execute-token")};$($(this.selectorBody+" form").serializeArray()).each((e,a)=>{t[a.name]=a.value}),new AjaxRequest(this.getUrl()).post(t).then(async t=>{const a=await t.resolve();!0===a.success?this.checkDatabaseSelect():Array.isArray(a.status)&&(e.empty(),a.status.forEach(t=>{let a=InfoBox.render(t.severity,t.title,t.message);e.append(a)}))})}checkDatabaseSelect(){this.setProgress(3),new AjaxRequest(this.getUrl("checkDatabaseSelect")).get({cache:"no-cache"}).then(async e=>{!0===(await e.resolve()).success?this.checkDatabaseData():this.showDatabaseSelect()})}showDatabaseSelect(){let e=$(this.selectorMainContent);new AjaxRequest(this.getUrl("showDatabaseSelect")).get({cache:"no-cache"}).then(async t=>{const a=await t.resolve();!0===a.success&&e.empty().html(a.html)})}executeDatabaseSelect(){let e=$(this.selectorDatabaseSelectOutput),t={"install[action]":"executeDatabaseSelect","install[token]":$(this.selectorModuleContent).data("installer-database-select-execute-token")};$($(this.selectorBody+" form").serializeArray()).each((e,a)=>{t[a.name]=a.value}),new AjaxRequest(this.getUrl()).post(t).then(async t=>{const a=await t.resolve();!0===a.success?this.checkDatabaseRequirements():Array.isArray(a.status)&&a.status.forEach(t=>{let a=InfoBox.render(t.severity,t.title,t.message);e.empty().append(a)})})}checkDatabaseRequirements(){let e=$(this.selectorDatabaseSelectOutput),t={"install[action]":"checkDatabaseRequirements","install[token]":$(this.selectorModuleContent).data("installer-database-check-requirements-execute-token")};$($(this.selectorBody+" form").serializeArray()).each((e,a)=>{t[a.name]=a.value}),new AjaxRequest(this.getUrl()).post(t).then(async t=>{const a=await t.resolve();!0===a.success?this.checkDatabaseData():Array.isArray(a.status)&&(e.empty(),a.status.forEach(t=>{let a=InfoBox.render(t.severity,t.title,t.message);e.append(a)}))})}checkDatabaseData(){this.setProgress(4),new AjaxRequest(this.getUrl("checkDatabaseData")).get({cache:"no-cache"}).then(async e=>{!0===(await e.resolve()).success?this.showDefaultConfiguration():this.showDatabaseData()})}showDatabaseData(){let e=$(this.selectorMainContent);new AjaxRequest(this.getUrl("showDatabaseData")).get({cache:"no-cache"}).then(async t=>{const a=await t.resolve();!0===a.success&&e.empty().html(a.html)})}executeDatabaseData(){let e=$(this.selectorDatabaseDataOutput),t={"install[action]":"executeDatabaseData","install[token]":$(this.selectorModuleContent).data("installer-database-data-execute-token")};$($(this.selectorBody+" form").serializeArray()).each((e,a)=>{t[a.name]=a.value});let a=ProgressBar.render(Severity.loading,"Loading...","");e.empty().html(a),new AjaxRequest(this.getUrl()).post(t).then(async t=>{const a=await t.resolve();!0===a.success?this.showDefaultConfiguration():Array.isArray(a.status)&&a.status.forEach(t=>{let a=InfoBox.render(t.severity,t.title,t.message);e.empty().append(a)})})}showDefaultConfiguration(){let e=$(this.selectorMainContent);this.setProgress(5),new AjaxRequest(this.getUrl("showDefaultConfiguration")).get({cache:"no-cache"}).then(async t=>{const a=await t.resolve();!0===a.success&&e.empty().html(a.html)})}executeDefaultConfiguration(){let e={"install[action]":"executeDefaultConfiguration","install[token]":$(this.selectorModuleContent).data("installer-default-configuration-execute-token")};$($(this.selectorBody+" form").serializeArray()).each((t,a)=>{e[a.name]=a.value}),new AjaxRequest(this.getUrl()).post(e).then(async e=>{const t=await e.resolve();top.location.href=t.redirect})}}export default new Installer;