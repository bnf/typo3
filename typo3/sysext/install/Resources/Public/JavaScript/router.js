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
var AdminToolRoute,__decorate=function(e,t,o,n){var a,s=arguments.length,l=s<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,o):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)l=Reflect.decorate(e,t,o,n);else for(var i=e.length-1;i>=0;i--)(a=e[i])&&(l=(s<3?a(l):s>3?a(t,o,l):a(t,o))||l);return s>3&&l&&Object.defineProperty(t,o,l),l};import{html,LitElement,nothing}from"lit";import{customElement,property,state}from"lit/decorators.js";import $ from"jquery";import AjaxRequest from"@typo3/core/ajax/ajax-request.js";import InfoBox from"@typo3/install/renderable/info-box.js";import ProgressBar from"@typo3/install/renderable/progress-bar.js";import Severity from"@typo3/install/renderable/severity.js";import"@typo3/backend/element/spinner-element.js";import"@typo3/install/app.js";!function(e){e[e.Loading=0]="Loading",e[e.Locked=1]="Locked",e[e.Login=2]="Login",e[e.Cards=3]="Cards"}(AdminToolRoute||(AdminToolRoute={}));let Router=class extends LitElement{constructor(){super(...arguments),this.active=!1,this.standalone=!1,this.mode=AdminToolRoute.Loading,this.selectorBody=".t3js-body",this.selectorMainContent=".t3js-module-body",this.rootSelector=".t3js-body",this.contentSelector=".t3js-module-body",this.scaffoldSelector=".t3js-scaffold",this.scaffoldContentOverlaySelector=".t3js-scaffold-content-overlay",this.scaffoldMenuToggleSelector=".t3js-topbar-button-modulemenu",this.scaffoldMenuActionSelector=".t3js-modulemenu-action"}connectedCallback(){super.connectedCallback(),this.rootContainer=document.querySelector(this.rootSelector),this.registerInstallToolRoutes(),this.addEventListener("install-tool:ajax-error",(e=>{this.handleAjaxError(e.detail.error)})),this.addEventListener("install-tool:logout",(e=>{this.logout()})),!1===this.standalone?this.executeSilentConfigurationUpdate():this.preAccessCheck()}createRenderRoot(){return this}render(){if(this.mode===AdminToolRoute.Loading)return html`
        <div class="ui-block">
          <typo3-backend-spinner size="large" class="mx-auto"></typo3-backend-spinner>
          <h2>Initializing</h2>
        </div>
      `;if(this.mode===AdminToolRoute.Locked)return html`
        <div class="container">
          <div class="row justify-content-center">
            <div class="col-md-6">
              <div class="page-header">
                <img src="./sysext/install/Resources/Public/Images/typo3_orange.svg" width="130" class="logo" />
              </div>

              <div class="panel panel-warning">
                <div class="panel-heading">
                  <h2 class="panel-title">The Install Tool is locked</h2>
                </div>
                <div class="panel-body">
                  <p>
                    To enable the Install Tool, the file <code>ENABLE_INSTALL_TOOL</code>
                    must be created in the directory <code>typo3conf/</code>.
                    The file must be writable by the web server user.
                    The filename is case-sensitive but the file itself can be empty.
                  </p>
                  <p>
                    <strong>Security note:</strong>
                    When you are finished with the Install Tool, you should rename or delete this file.
                    It will automatically be deleted if you log out of the Install Tool or if the file is older than one hour.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;if(this.mode===AdminToolRoute.Login){const e=!1;return html`
        <div class="container">
          <div class="page-header">
            <h1 class="logo-pageheader">
              <img src="./sysext/install/Resources/Public/Images/typo3_orange.svg" width="130" class="logo" /> Site: ${"TODO"} <small>Login to TYPO3 Install Tool</small>
            </h1>
          </div>
          <div class="row justify-content-center">
            <div class="col-md-6">
              <div id="t3-install-box-body">
                <form method="post" class="form-inline" id="t3-install-form-login" data-login-token="{loginToken}" @submit=${e=>{e.preventDefault(),this.login()}}>
                  <div class="form-group">
                    <label for="t3-install-form-password">Password</label>
                    <input id="t3-install-form-password" type="password" name="install[password]" class="t3-install-form-input-text form-control" autofocus="autofocus" />
                  </div>
                  <button type="button" class="btn btn-default btn-success t3js-login-login">
                    Login
                  </button>
                  ${e?nothing:html`
                    <button type="button" class="btn btn-default btn-danger pull-right" @click=${e=>{e.preventDefault(),this.logout()}}>
                      <i class="fa fa-lock"></i> Lock Install Tool again
                    </button>
                  `}
                </form>
              </div>
              <div id="t3-install-box-border-bottom">&nbsp;</div>

              <div class="t3js-login-output"></div>

              ${e?html`
                <div class="panel panel-danger">
                  <div class="panel-heading"><h3 class="panel-title">Install Tool is permanently enabled</h3></div>
                  <div class="panel-body">
                    The Install Tool is permanently enabled because our <code>ENABLE_INSTALL_TOOL</code> file contains
                    the text <em>KEEP_FILE</em>.<br />
                    Never use this on production systems!
                  </div>
                </div>
              `:nothing}

              <div class="panel panel-info">
                <div class="panel-heading"><h3 class="panel-title">Information</h3></div>
                <div class="panel-body">
                  By default the Install Tool password is the one specified during the installation.
                </div>
              </div>
              <div class="panel panel-warning">
                <div class="panel-heading"><h3 class="panel-title">Important</h3></div>
                <div class="panel-body">
                  If you don't know the current password, you can set a new one by setting the value of
                  <code>$GLOBALS['TYPO3_CONF_VARS']['BE']['installToolPassword']</code> in <code>typo3conf/LocalConfiguration.php</code> to
                  the hash value of the password you desire, which will be shown if you enter the desired password
                  in this form and submit it.
                  <br /><br />
                  This password gives an attacker full control over your instance if cracked. It should be strong
                  (include lower and upper case characters, special characters and numbers) and at least eight characters long.
                </div>
              </div>
            </div>
          </div>
        </div>
      `}return this.mode===AdminToolRoute.Cards?html`<typo3-admin-tool-app endpoint="${this.getUrl("cards")}" active></typo3-admin-tool-app>`:html`TODO`}registerInstallToolRoutes(){this.standalone&&void 0===TYPO3.settings&&(TYPO3.settings={ajaxUrls:{icons:this.endpoint+"?install[controller]=icon&install[action]=getIcon",icons_cache:this.endpoint+"?install[controller]=icon&install[action]=getCacheIdentifier"}})}getUrl(e,t,o){const n=this.standalone?"":"backend";let a=location.href;return a=a.replace(location.search,""),void 0===t&&(t=document.body.dataset.controller),a=a+"?install[controller]="+t,a=a+"&install[context]="+n,void 0!==e&&(a=a+"&install[action]="+e),void 0!==o&&(a=a+"&"+o),a}executeSilentConfigurationUpdate(){this.updateLoadingInfo("Checking session and executing silent configuration update"),new AjaxRequest(this.getUrl("executeSilentConfigurationUpdate","layout")).get({cache:"no-cache"}).then((async e=>{!0===(await e.resolve()).success?this.executeSilentTemplateFileUpdate():this.executeSilentConfigurationUpdate()}),(e=>{this.handleAjaxError(e)}))}executeSilentTemplateFileUpdate(){this.updateLoadingInfo("Checking session and executing silent template file update"),new AjaxRequest(this.getUrl("executeSilentTemplateFileUpdate","layout")).get({cache:"no-cache"}).then((async e=>{!0===(await e.resolve()).success?this.executeSilentExtensionConfigurationSynchronization():this.executeSilentTemplateFileUpdate()}),(e=>{this.handleAjaxError(e)}))}executeSilentExtensionConfigurationSynchronization(){this.updateLoadingInfo("Executing silent extension configuration synchronization"),new AjaxRequest(this.getUrl("executeSilentExtensionConfigurationSynchronization","layout")).get({cache:"no-cache"}).then((async e=>{!0===(await e.resolve()).success?this.mode=AdminToolRoute.Cards:this.rootContainer.innerHTML=InfoBox.render(Severity.error,"Something went wrong","").html()}),(e=>{this.handleAjaxError(e)}))}async handleAjaxError(e,t){if(403===e.response.status)this.standalone?this.checkEnableInstallToolFile():this.rootContainer.innerHTML=InfoBox.render(Severity.error,"The install tool session expired. Please reload the backend and try again.").html();else{const o='<div class="t3js-infobox callout callout-sm callout-danger"><h4 class="callout-title">Something went wrong</h4><div class="callout-body"><p>Please use <b><a href="'+this.getUrl(void 0,"upgrade")+'">Check for broken extensions</a></b> to see if a loaded extension breaks this part of the install tool and unload it.</p><p>The box below may additionally reveal further details on what went wrong depending on your debug settings. It may help to temporarily switch to debug mode using <b>Settings > Configuration Presets > Debug settings.</b></p><p>If this error happens at an early state and no full exception back trace is shown, it may also help to manually increase debugging output in <strong>%config-dir%/system/settings.php</strong>:<code>[\'BE\'][\'debug\'] => true</code>, <code>[\'SYS\'][\'devIPmask\'] => \'*\'</code>, <code>[\'SYS\'][\'displayErrors\'] => 1</code>,<code>[\'SYS\'][\'exceptionalErrors\'] => 12290</code></p></div></div><div class="panel-group" role="tablist" aria-multiselectable="true"><div class="panel panel-default searchhit"><div class="panel-heading" role="tab" id="heading-error"><h3 class="panel-title"><a role="button" data-bs-toggle="collapse" data-bs-parent="#accordion" href="#collapse-error" aria-expanded="true" aria-controls="collapse-error" class="collapsed"><span class="caret"></span><strong>Ajax error</strong></a></h3></div><div id="collapse-error" class="panel-collapse collapse" role="tabpanel" aria-labelledby="heading-error"><div class="panel-body">'+await e.response.text()+"</div></div></div></div>";void 0!==t?$(t).empty().html(o):this.rootContainer.innerHTML=o}}checkEnableInstallToolFile(){new AjaxRequest(this.getUrl("checkEnableInstallToolFile")).get({cache:"no-cache"}).then((async e=>{!0===(await e.resolve()).success?this.checkLogin():this.mode=AdminToolRoute.Locked}),(e=>{this.handleAjaxError(e)}))}checkLogin(){new AjaxRequest(this.getUrl("checkLogin")).get({cache:"no-cache"}).then((async e=>{!0===(await e.resolve()).success?this.mode=AdminToolRoute.Cards:this.mode=AdminToolRoute.Login}),(e=>{this.handleAjaxError(e)}))}showLogin(){new AjaxRequest(this.getUrl("showLogin")).get({cache:"no-cache"}).then((async e=>{const t=await e.resolve();!0===t.success&&(this.rootContainer.innerHTML=t.html)}),(e=>{this.handleAjaxError(e)}))}login(){const e=$(".t3js-login-output"),t=ProgressBar.render(Severity.loading,"Loading...","");e.empty().html(t),new AjaxRequest(this.getUrl()).post({install:{action:"login",token:$("[data-login-token]").data("login-token"),password:$(".t3-install-form-input-text").val()}}).then((async t=>{const o=await t.resolve();!0===o.success?this.executeSilentConfigurationUpdate():o.status.forEach((t=>{const o=InfoBox.render(t.severity,t.title,t.message);e.empty().html(o)}))}),(e=>{this.handleAjaxError(e)}))}logout(){new AjaxRequest(this.getUrl("logout")).get({cache:"no-cache"}).then((async e=>{!0===(await e.resolve()).success&&(this.mode=AdminToolRoute.Loading,this.preAccessCheck())}),(e=>{this.handleAjaxError(e)}))}registerScaffoldEvents(){localStorage.getItem("typo3-install-modulesCollapsed")||localStorage.setItem("typo3-install-modulesCollapsed","false"),this.toggleMenu("true"===localStorage.getItem("typo3-install-modulesCollapsed")),document.querySelector(this.scaffoldMenuToggleSelector).addEventListener("click",(e=>{e.preventDefault(),this.toggleMenu()})),document.querySelector(this.scaffoldContentOverlaySelector).addEventListener("click",(e=>{e.preventDefault(),this.toggleMenu(!0)})),document.querySelectorAll(this.scaffoldMenuActionSelector).forEach((e=>{e.addEventListener("click",(e=>{window.innerWidth<768&&localStorage.setItem("typo3-install-modulesCollapsed","true")}))}))}toggleMenu(e){const t=document.querySelector(this.scaffoldSelector),o="scaffold-modulemenu-expanded";void 0===e&&(e=t.classList.contains(o)),t.classList.toggle(o,!e),localStorage.setItem("typo3-install-modulesCollapsed",e?"true":"false")}updateLoadingInfo(e){const t=this.rootContainer.querySelector("#t3js-ui-block-detail");void 0!==t&&t instanceof HTMLElement&&(t.innerText=e)}preAccessCheck(){this.updateLoadingInfo("Execute pre access check"),new AjaxRequest(this.getUrl("preAccessCheck","layout")).get({cache:"no-cache"}).then((async e=>{const t=await e.resolve();t.installToolLocked?this.checkEnableInstallToolFile():t.isAuthorized?this.executeSilentConfigurationUpdate():this.mode=AdminToolRoute.Login}),(e=>{this.handleAjaxError(e)}))}};__decorate([property({type:String})],Router.prototype,"endpoint",void 0),__decorate([property({type:Boolean})],Router.prototype,"active",void 0),__decorate([property({type:Boolean})],Router.prototype,"standalone",void 0),__decorate([state()],Router.prototype,"mode",void 0),Router=__decorate([customElement("typo3-admin-tool-router")],Router);class RouterProxy{get router(){return document.querySelector("typo3-admin-tool-router")}getUrl(e,t,o){return this.router.getUrl(e,t,o)}async handleAjaxError(e,t){return this.router.handleAjaxError(e,t)}}export default new RouterProxy;