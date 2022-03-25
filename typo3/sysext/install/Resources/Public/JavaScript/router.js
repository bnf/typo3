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
import $ from"jquery";import{html}from"lit";import AjaxRequest from"@typo3/core/ajax/ajax-request.js";import{default as Modal}from"@typo3/backend/modal.js";import InfoBox from"@typo3/install/renderable/info-box.js";import ProgressBar from"@typo3/install/renderable/progress-bar.js";import Severity from"@typo3/install/renderable/severity.js";import{topLevelModuleImport}from"@typo3/backend/utility/top-level-module-import.js";import"@typo3/backend/element/spinner-element.js";class Router{constructor(){this.selectorBody=".t3js-body",this.selectorMainContent=".t3js-module-body"}initialize(){this.registerInstallToolRoutes(),$(document).on("click",".t3js-login-lockInstallTool",e=>{e.preventDefault(),this.logout()}),$(document).on("click",".t3js-login-login",e=>{e.preventDefault(),this.login()}),$(document).on("keydown","#t3-install-form-password",e=>{"Enter"===e.key&&(e.preventDefault(),$(".t3js-login-login").trigger("click"))}),$(document).on("click",".card .btn",e=>{e.preventDefault();const t=$(e.currentTarget),o=t.data("import"),a=t.data("inline");if(void 0!==a&&1===parseInt(a,10))import(o).then(({default:e})=>{e.initialize(t)});else{const e=t.closest(".card").find(".card-title").html(),a=t.data("modalSize")||Modal.sizes.large;Modal.advanced({type:Modal.types.default,title:e,size:a,content:html`<div class="modal-loading"><typo3-backend-spinner size="default"></typo3-backend-spinner></div>`,additionalCssClasses:["install-tool-modal"],callback:e=>{import(o).then(({default:t})=>{window.location!==window.parent.location?topLevelModuleImport("jquery").then(({default:o})=>{t.initialize(o(e))}):t.initialize($(e))})}})}});"backend"===$(this.selectorBody).data("context")?this.executeSilentConfigurationUpdate():this.preAccessCheck()}registerInstallToolRoutes(){void 0===TYPO3.settings&&(TYPO3.settings={ajaxUrls:{icons:window.location.origin+window.location.pathname+"?install[controller]=icon&install[action]=getIcon",icons_cache:window.location.origin+window.location.pathname+"?install[controller]=icon&install[action]=getCacheIdentifier"}})}getUrl(e,t,o){const a=$(this.selectorBody).data("context");let n=location.href;return n=n.replace(location.search,""),void 0===t&&(t=$(this.selectorBody).data("controller")),n=n+"?install[controller]="+t,void 0!==a&&""!==a&&(n=n+"&install[context]="+a),void 0!==e&&(n=n+"&install[action]="+e),void 0!==o&&(n=n+"&"+o),n}executeSilentConfigurationUpdate(){this.updateLoadingInfo("Checking session and executing silent configuration update"),new AjaxRequest(this.getUrl("executeSilentConfigurationUpdate","layout")).get({cache:"no-cache"}).then(async e=>{!0===(await e.resolve()).success?this.executeSilentTemplateFileUpdate():this.executeSilentConfigurationUpdate()},e=>{this.handleAjaxError(e)})}executeSilentTemplateFileUpdate(){this.updateLoadingInfo("Checking session and executing silent template file update"),new AjaxRequest(this.getUrl("executeSilentTemplateFileUpdate","layout")).get({cache:"no-cache"}).then(async e=>{!0===(await e.resolve()).success?this.executeSilentExtensionConfigurationSynchronization():this.executeSilentTemplateFileUpdate()},e=>{this.handleAjaxError(e)})}executeSilentExtensionConfigurationSynchronization(){const e=$(this.selectorBody);this.updateLoadingInfo("Executing silent extension configuration synchronization"),new AjaxRequest(this.getUrl("executeSilentExtensionConfigurationSynchronization","layout")).get({cache:"no-cache"}).then(async t=>{if(!0===(await t.resolve()).success)this.loadMainLayout();else{const t=InfoBox.render(Severity.error,"Something went wrong","");e.empty().append(t)}},e=>{this.handleAjaxError(e)})}loadMainLayout(){const e=$(this.selectorBody),t=e.data("controller");this.updateLoadingInfo("Loading main layout"),new AjaxRequest(this.getUrl("mainLayout","layout","install[module]="+t)).get({cache:"no-cache"}).then(async o=>{const a=await o.resolve();if(!0===a.success&&"undefined"!==a.html&&a.html.length>0)e.empty().append(a.html),"backend"!==$(this.selectorBody).data("context")&&e.find('.t3js-modulemenu-action[data-controller="'+t+'"]').addClass("modulemenu-action-active"),this.loadCards();else{const t=InfoBox.render(Severity.error,"Something went wrong","");e.empty().append(t)}},e=>{this.handleAjaxError(e)})}async handleAjaxError(e,t){let o;if(403===e.response.status){"backend"===$(this.selectorBody).data("context")?(o=InfoBox.render(Severity.error,"The install tool session expired. Please reload the backend and try again."),$(this.selectorBody).empty().append(o)):this.checkEnableInstallToolFile()}else{const a=this.getUrl(void 0,"upgrade");o=$('<div class="t3js-infobox callout callout-sm callout-danger"><div class="callout-body"><p>Something went wrong. Please use <b><a href="'+a+'">Check for broken extensions</a></b> to see if a loaded extension breaks this part of the install tool and unload it.</p><p>The box below may additionally reveal further details on what went wrong depending on your debug settings. It may help to temporarily switch to debug mode using <b>Settings > Configuration Presets > Debug settings.</b></p><p>If this error happens at an early state and no full exception back trace is shown, it may also help to manually increase debugging output in <code>typo3conf/LocalConfiguration.php</code>:<code>[\'BE\'][\'debug\'] => true</code>, <code>[\'SYS\'][\'devIPmask\'] => \'*\'</code>, <code>[\'SYS\'][\'displayErrors\'] => 1</code>,<code>[\'SYS\'][\'exceptionalErrors\'] => 12290</code></p></div></div><div class="panel-group" role="tablist" aria-multiselectable="true"><div class="panel panel-default panel-flat searchhit"><div class="panel-heading" role="tab" id="heading-error"><h3 class="panel-title"><a role="button" data-bs-toggle="collapse" data-bs-parent="#accordion" href="#collapse-error" aria-expanded="true" aria-controls="collapse-error" class="collapsed"><span class="caret"></span><strong>Ajax error</strong></a></h3></div><div id="collapse-error" class="panel-collapse collapse" role="tabpanel" aria-labelledby="heading-error"><div class="panel-body">'+await e.response.text()+"</div></div></div></div>"),void 0!==t?$(t).empty().html(o):$(this.selectorBody).empty().html(o)}}checkEnableInstallToolFile(){new AjaxRequest(this.getUrl("checkEnableInstallToolFile")).get({cache:"no-cache"}).then(async e=>{!0===(await e.resolve()).success?this.checkLogin():this.showEnableInstallTool()},e=>{this.handleAjaxError(e)})}showEnableInstallTool(){new AjaxRequest(this.getUrl("showEnableInstallToolFile")).get({cache:"no-cache"}).then(async e=>{const t=await e.resolve();!0===t.success&&$(this.selectorBody).empty().append(t.html)},e=>{this.handleAjaxError(e)})}checkLogin(){new AjaxRequest(this.getUrl("checkLogin")).get({cache:"no-cache"}).then(async e=>{!0===(await e.resolve()).success?this.loadMainLayout():this.showLogin()},e=>{this.handleAjaxError(e)})}showLogin(){new AjaxRequest(this.getUrl("showLogin")).get({cache:"no-cache"}).then(async e=>{const t=await e.resolve();!0===t.success&&$(this.selectorBody).empty().append(t.html)},e=>{this.handleAjaxError(e)})}login(){const e=$(".t3js-login-output"),t=ProgressBar.render(Severity.loading,"Loading...","");e.empty().html(t),new AjaxRequest(this.getUrl()).post({install:{action:"login",token:$("[data-login-token]").data("login-token"),password:$(".t3-install-form-input-text").val()}}).then(async t=>{const o=await t.resolve();!0===o.success?this.executeSilentConfigurationUpdate():o.status.forEach(t=>{const o=InfoBox.render(t.severity,t.title,t.message);e.empty().html(o)})},e=>{this.handleAjaxError(e)})}logout(){new AjaxRequest(this.getUrl("logout")).get({cache:"no-cache"}).then(async e=>{!0===(await e.resolve()).success&&this.showEnableInstallTool()},e=>{this.handleAjaxError(e)})}loadCards(){const e=$(this.selectorMainContent);new AjaxRequest(this.getUrl("cards")).get({cache:"no-cache"}).then(async t=>{const o=await t.resolve();if(!0===o.success&&"undefined"!==o.html&&o.html.length>0)e.empty().append(o.html);else{const t=InfoBox.render(Severity.error,"Something went wrong","");e.empty().append(t)}},e=>{this.handleAjaxError(e)})}updateLoadingInfo(e){$(this.selectorBody).find("#t3js-ui-block-detail").text(e)}preAccessCheck(){this.updateLoadingInfo("Execute pre access check"),new AjaxRequest(this.getUrl("preAccessCheck","layout")).get({cache:"no-cache"}).then(async e=>{const t=await e.resolve();t.installToolLocked?this.checkEnableInstallToolFile():t.isAuthorized?this.executeSilentConfigurationUpdate():this.showLogin()},e=>{this.handleAjaxError(e)})}}export default new Router;