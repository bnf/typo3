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
import{html}from"lit";import AjaxRequest from"@typo3/core/ajax/ajax-request.js";import{default as Modal}from"@typo3/backend/modal.js";import{InfoBox}from"@typo3/install/renderable/info-box.js";import Severity from"@typo3/install/renderable/severity.js";import"@typo3/backend/element/spinner-element.js";import RegularEvent from"@typo3/core/event/regular-event.js";import"@typo3/backend/element/progress-bar-element.js";class Router{constructor(){this.rootSelector=".t3js-body",this.contentSelector=".t3js-module-body",this.scaffoldSelector=".t3js-scaffold",this.scaffoldContentOverlaySelector=".t3js-scaffold-content-overlay",this.scaffoldMenuToggleSelector=".t3js-topbar-button-modulemenu"}setContent(e){const t=this.rootContainer.querySelector(this.contentSelector);"string"==typeof e&&(e=document.createRange().createContextualFragment(e)),t.replaceChildren(e)}initialize(){this.rootContainer=document.querySelector(this.rootSelector),this.context=this.rootContainer.dataset.context??"",this.controller=this.rootContainer.dataset.controller??"",this.registerInstallToolRoutes(),new RegularEvent("click",(e=>{e.preventDefault(),this.logout()})).delegateTo(document,".t3js-login-lockInstallTool"),new RegularEvent("click",(e=>{e.preventDefault(),this.login()})).delegateTo(document,".t3js-login-login"),new RegularEvent("keydown",(e=>{"Enter"===e.key&&(e.preventDefault(),this.login())})).delegateTo(document,"#t3-install-form-password"),new RegularEvent("click",((e,t)=>{e.preventDefault();const o=t.dataset.import,n=t.dataset.inline;if(void 0!==n&&1===parseInt(n,10))import(o).then((({default:e})=>{e.initialize(t)}));else{const e=t.closest(".card").querySelector(".card-title").innerHTML,n=t.dataset.modalSize||Modal.sizes.large;Modal.advanced({type:Modal.types.default,title:e,size:n,content:html`<div class="modal-loading"><typo3-backend-spinner size="large"></typo3-backend-spinner></div>`,additionalCssClasses:["install-tool-modal"],callback:e=>{import(o).then((({default:t})=>{t.initialize(e)}))}})}})).delegateTo(document,".card .btn"),"backend"===this.context?this.executeSilentConfigurationUpdate():this.preAccessCheck()}registerInstallToolRoutes(){void 0===TYPO3.settings&&(TYPO3.settings={ajaxUrls:{icons:window.location.origin+window.location.pathname+"?install[controller]=icon&install[action]=getIcon",icons_cache:window.location.origin+window.location.pathname+"?install[controller]=icon&install[action]=getCacheIdentifier"}})}getUrl(e,t,o){const n=new URL(location.href,window.origin);if(n.searchParams.set("install[controller]",t??this.controller),n.searchParams.set("install[context]",this.context),void 0!==e&&n.searchParams.set("install[action]",e),void 0!==o)for(const[e,t]of Object.entries(o))n.searchParams.set(e,t);return n.toString()}executeSilentConfigurationUpdate(){this.updateLoadingInfo("Checking session and executing silent configuration update"),new AjaxRequest(this.getUrl("executeSilentConfigurationUpdate","layout")).get({cache:"no-cache"}).then((async e=>{!0===(await e.resolve()).success?this.executeSilentTemplateFileUpdate():this.executeSilentConfigurationUpdate()}),(e=>{this.handleAjaxError(e)}))}executeSilentTemplateFileUpdate(){this.updateLoadingInfo("Checking session and executing silent template file update"),new AjaxRequest(this.getUrl("executeSilentTemplateFileUpdate","layout")).get({cache:"no-cache"}).then((async e=>{!0===(await e.resolve()).success?this.executeSilentExtensionConfigurationSynchronization():this.executeSilentTemplateFileUpdate()}),(e=>{this.handleAjaxError(e)}))}executeSilentExtensionConfigurationSynchronization(){this.updateLoadingInfo("Executing silent extension configuration synchronization"),new AjaxRequest(this.getUrl("executeSilentExtensionConfigurationSynchronization","layout")).get({cache:"no-cache"}).then((async e=>{!0===(await e.resolve()).success?this.loadMainLayout():this.setContent(InfoBox.create(Severity.error,"Something went wrong"))}),(e=>{this.handleAjaxError(e)}))}loadMainLayout(){this.updateLoadingInfo("Loading main layout"),new AjaxRequest(this.getUrl("mainLayout","layout",{"install[module]":this.controller})).get({cache:"no-cache"}).then((async e=>{const t=await e.resolve();!0===t.success&&"undefined"!==t.html&&t.html.length>0?(this.rootContainer.innerHTML=t.html,"backend"!==this.context&&(this.rootContainer.querySelector('[data-installroute-controller="'+this.controller+'"]').classList.add("modulemenu-action-active"),this.registerScaffoldEvents()),this.loadCards()):this.rootContainer.replaceChildren(InfoBox.create(Severity.error,"Something went wrong"))}),(e=>{this.handleAjaxError(e)}))}async handleAjaxError(e,t){if(403===e.response.status)"backend"===this.context?this.rootContainer.replaceChildren(InfoBox.create(Severity.error,"The Install Tool session expired. Please reload the backend and try again.")):this.checkEnableInstallToolFile();else{const o='<div class="t3js-infobox callout callout-sm callout-danger"><div class="callout-content"><div class="callout-title">Something went wrong</div><div class="callout-body"><p>Please use <b><a href="'+this.getUrl(void 0,"upgrade")+'">Check for broken extensions</a></b> to see if a loaded extension breaks this part of the Install Tool and unload it.</p><p>The box below may additionally reveal further details on what went wrong depending on your debug settings. It may help to temporarily switch to debug mode using <b>Settings > Configuration Presets > Debug settings.</b></p><p>If this error happens at an early state and no full exception back trace is shown, it may also help to manually increase debugging output in <strong>%config-dir%/system/settings.php</strong>:<code>[\'BE\'][\'debug\'] => true</code>, <code>[\'SYS\'][\'devIPmask\'] => \'*\'</code>, <code>[\'SYS\'][\'displayErrors\'] => 1</code>,<code>[\'SYS\'][\'exceptionalErrors\'] => 12290</code></p></div></div></div><div class="panel-group" role="tablist" aria-multiselectable="true"><div class="panel panel-default"><h3 class="panel-heading" role="tab" id="heading-error"><div class="panel-heading-row"><button type="button" data-bs-toggle="collapse" data-bs-parent="#accordion" data-bs-target="#collapse-error" aria-expanded="true" aria-controls="collapse-error" class="panel-button collapsed"><div class="panel-title"><strong>Ajax error</strong></div><span class="caret"></span></button></div></h3><div id="collapse-error" class="panel-collapse collapse" role="tabpanel" aria-labelledby="heading-error"><div class="panel-body">'+await e.response.text()+"</div></div></div></div>";void 0!==t?t.innerHTML=o:this.rootContainer.innerHTML=o}}checkEnableInstallToolFile(){new AjaxRequest(this.getUrl("checkEnableInstallToolFile")).get({cache:"no-cache"}).then((async e=>{!0===(await e.resolve()).success?this.checkLogin():this.showEnableInstallTool()}),(e=>{this.handleAjaxError(e)}))}showEnableInstallTool(){new AjaxRequest(this.getUrl("showEnableInstallToolFile")).get({cache:"no-cache"}).then((async e=>{const t=await e.resolve();!0===t.success&&(this.rootContainer.innerHTML=t.html)}),(e=>{this.handleAjaxError(e)}))}checkLogin(){new AjaxRequest(this.getUrl("checkLogin")).get({cache:"no-cache"}).then((async e=>{!0===(await e.resolve()).success?this.loadMainLayout():this.showLogin()}),(e=>{this.handleAjaxError(e)}))}showLogin(){new AjaxRequest(this.getUrl("showLogin")).get({cache:"no-cache"}).then((async e=>{const t=await e.resolve();!0===t.success&&(this.rootContainer.innerHTML=t.html)}),(e=>{this.handleAjaxError(e)}))}login(){const e=document.querySelector(".t3js-login-output"),t=document.createElement("typo3-backend-progress-bar");e.replaceChildren(t),new AjaxRequest(this.getUrl()).post({install:{action:"login",token:document.querySelector("[data-login-token]").dataset.loginToken,password:document.querySelector(".t3-install-form-input-text").value}}).then((async t=>{const o=await t.resolve();!0===o.success?this.executeSilentConfigurationUpdate():o.status.forEach((t=>{e.replaceChildren(InfoBox.create(t.severity,t.title,t.message))}))}),(e=>{this.handleAjaxError(e)}))}logout(){new AjaxRequest(this.getUrl("logout")).get({cache:"no-cache"}).then((async e=>{!0===(await e.resolve()).success&&this.showEnableInstallTool()}),(e=>{this.handleAjaxError(e)}))}loadCards(){new AjaxRequest(this.getUrl("cards")).get({cache:"no-cache"}).then((async e=>{const t=await e.resolve();!0===t.success&&"undefined"!==t.html&&t.html.length>0?this.setContent(t.html):this.setContent(InfoBox.create(Severity.error,"Something went wrong"))}),(e=>{this.handleAjaxError(e)}))}registerScaffoldEvents(){localStorage.getItem("typo3-install-modulesCollapsed")||localStorage.setItem("typo3-install-modulesCollapsed","false"),this.toggleMenu("true"===localStorage.getItem("typo3-install-modulesCollapsed")),document.querySelector(this.scaffoldMenuToggleSelector).addEventListener("click",(e=>{e.preventDefault(),this.toggleMenu()})),document.querySelector(this.scaffoldContentOverlaySelector).addEventListener("click",(e=>{e.preventDefault(),this.toggleMenu(!0)})),document.querySelectorAll("[data-installroute-controller]").forEach((e=>{e.addEventListener("click",(()=>{window.innerWidth<768&&localStorage.setItem("typo3-install-modulesCollapsed","true")}))}))}toggleMenu(e){const t=document.querySelector(this.scaffoldSelector),o="scaffold-modulemenu-expanded";void 0===e&&(e=t.classList.contains(o)),t.classList.toggle(o,!e),localStorage.setItem("typo3-install-modulesCollapsed",e?"true":"false")}updateLoadingInfo(e){const t=this.rootContainer.querySelector("#t3js-ui-block-detail");void 0!==t&&t instanceof HTMLElement&&(t.innerText=e)}preAccessCheck(){this.updateLoadingInfo("Execute pre access check"),new AjaxRequest(this.getUrl("preAccessCheck","layout")).get({cache:"no-cache"}).then((async e=>{const t=await e.resolve();t.installToolLocked?this.checkEnableInstallToolFile():t.isAuthorized?this.executeSilentConfigurationUpdate():this.showLogin()}),(e=>{this.handleAjaxError(e)}))}}export default new Router;