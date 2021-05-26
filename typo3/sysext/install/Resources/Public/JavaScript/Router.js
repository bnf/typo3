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
var __decorate=this&&this.__decorate||function(e,t,o,a){var n,s=arguments.length,i=s<3?t:null===a?a=Object.getOwnPropertyDescriptor(t,o):a;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)i=Reflect.decorate(e,t,o,a);else for(var l=e.length-1;l>=0;l--)(n=e[l])&&(i=(s<3?n(i):s>3?n(t,o,i):n(t,o))||i);return s>3&&i&&Object.defineProperty(t,o,i),i},__importDefault=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};define(["require","exports","lit","lit/decorators","jquery","TYPO3/CMS/Core/Ajax/AjaxRequest","./Renderable/InfoBox","./Renderable/ProgressBar","./Renderable/Severity","TYPO3/CMS/Backend/Element/SpinnerElement","./App"],(function(e,t,o,a,n,s,i,l,r){"use strict";var c;n=__importDefault(n),function(e){e[e.Loading=0]="Loading",e[e.Locked=1]="Locked",e[e.Login=2]="Login",e[e.Cards=3]="Cards"}(c||(c={}));let d=class extends o.LitElement{constructor(){super(...arguments),this.active=!1,this.standalone=!1,this.mode=c.Loading,this.selectorBody=".t3js-body",this.selectorMainContent=".t3js-module-body"}connectedCallback(){super.connectedCallback(),this.registerInstallToolRoutes(),this.addEventListener("install-tool:ajax-error",e=>{this.handleAjaxError(e.detail.error)}),this.addEventListener("install-tool:logout",e=>{this.logout()}),!1===this.standalone?this.executeSilentConfigurationUpdate():this.preAccessCheck()}createRenderRoot(){return this}render(){if(this.mode===c.Loading)return o.html`
        <div class="ui-block">
          <typo3-backend-spinner size="large" class="mx-auto"></typo3-backend-spinner>
          <h2>Initializing</h2>
        </div>
      `;if(this.mode===c.Locked)return o.html`
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
      `;if(this.mode===c.Login){const e="TODO",t=!1;return o.html`
        <div class="container">
          <div class="page-header">
            <h1 class="logo-pageheader">
              <img src="./sysext/install/Resources/Public/Images/typo3_orange.svg" width="130" class="logo" /> Site: ${e} <small>Login to TYPO3 Install Tool</small>
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
                  ${t?o.nothing:o.html`
                    <button type="button" class="btn btn-default btn-danger pull-right" @click=${e=>{e.preventDefault(),this.logout()}}>
                      <i class="fa fa-lock"></i> Lock Install Tool again
                    </button>
                  `}
                </form>
              </div>
              <div id="t3-install-box-border-bottom">&nbsp;</div>

              <div class="t3js-login-output"></div>

              ${t?o.html`
                <div class="panel panel-danger">
                  <div class="panel-heading"><h3 class="panel-title">Install Tool is permanently enabled</h3></div>
                  <div class="panel-body">
                    The Install Tool is permanently enabled because our <code>ENABLE_INSTALL_TOOL</code> file contains
                    the text <em>KEEP_FILE</em>.<br />
                    Never use this on production systems!
                  </div>
                </div>
              `:o.nothing}

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
      `}return this.mode===c.Cards?o.html`<typo3-admin-tool-app endpoint="${this.getUrl("cards")}" active></typo3-admin-tool-app>`:o.html`TODO`}registerInstallToolRoutes(){this.standalone&&void 0===TYPO3.settings&&(TYPO3.settings={ajaxUrls:{icons:this.endpoint+"?install[controller]=icon&install[action]=getIcon",icons_cache:this.endpoint+"?install[controller]=icon&install[action]=getCacheIdentifier"}})}getUrl(e,t,o){const a=this.standalone?"":"backend";let n=location.href;return n=n.replace(location.search,""),void 0===t&&(t=document.body.dataset.controller),n=n+"?install[controller]="+t,void 0!==a&&""!==a&&(n=n+"&install[context]="+a),void 0!==e&&(n=n+"&install[action]="+e),void 0!==o&&(n=n+"&"+o),n}executeSilentConfigurationUpdate(){this.updateLoadingInfo("Checking session and executing silent configuration update"),new s(this.getUrl("executeSilentConfigurationUpdate","layout")).get({cache:"no-cache"}).then(async e=>{!0===(await e.resolve()).success?this.executeSilentTemplateFileUpdate():this.executeSilentConfigurationUpdate()},e=>{this.handleAjaxError(e)})}executeSilentTemplateFileUpdate(){this.updateLoadingInfo("Checking session and executing silent template file update"),new s(this.getUrl("executeSilentTemplateFileUpdate","layout")).get({cache:"no-cache"}).then(async e=>{!0===(await e.resolve()).success?this.executeSilentExtensionConfigurationSynchronization():this.executeSilentTemplateFileUpdate()},e=>{this.handleAjaxError(e)})}executeSilentExtensionConfigurationSynchronization(){const e=n.default(this.selectorBody);this.updateLoadingInfo("Executing silent extension configuration synchronization"),new s(this.getUrl("executeSilentExtensionConfigurationSynchronization","layout")).get({cache:"no-cache"}).then(async t=>{if(!0===(await t.resolve()).success)this.mode=c.Cards;else{const t=i.render(r.error,"Something went wrong","");e.empty().append(t)}},e=>{this.handleAjaxError(e)})}async handleAjaxError(e,t){let o;if(403===e.response.status){"backend"===n.default(this.selectorBody).data("context")?(o=i.render(r.error,"The install tool session expired. Please reload the backend and try again."),n.default(this.selectorBody).empty().append(o)):this.checkEnableInstallToolFile()}else{const a=this.getUrl(void 0,"upgrade");o=n.default('<div class="t3js-infobox callout callout-sm callout-danger"><div class="callout-body"><p>Something went wrong. Please use <b><a href="'+a+'">Check for broken extensions</a></b> to see if a loaded extension breaks this part of the install tool and unload it.</p><p>The box below may additionally reveal further details on what went wrong depending on your debug settings. It may help to temporarily switch to debug mode using <b>Settings > Configuration Presets > Debug settings.</b></p><p>If this error happens at an early state and no full exception back trace is shown, it may also help to manually increase debugging output in <code>typo3conf/LocalConfiguration.php</code>:<code>[\'BE\'][\'debug\'] => true</code>, <code>[\'SYS\'][\'devIPmask\'] => \'*\'</code>, <code>[\'SYS\'][\'displayErrors\'] => 1</code>,<code>[\'SYS\'][\'exceptionalErrors\'] => 12290</code></p></div></div><div class="panel-group" role="tablist" aria-multiselectable="true"><div class="panel panel-default panel-flat searchhit"><div class="panel-heading" role="tab" id="heading-error"><h3 class="panel-title"><a role="button" data-bs-toggle="collapse" data-bs-parent="#accordion" href="#collapse-error" aria-expanded="true" aria-controls="collapse-error" class="collapsed"><span class="caret"></span><strong>Ajax error</strong></a></h3></div><div id="collapse-error" class="panel-collapse collapse" role="tabpanel" aria-labelledby="heading-error"><div class="panel-body">'+await e.response.text()+"</div></div></div></div>"),void 0!==t?n.default(t).empty().html(o):n.default(this.selectorBody).empty().html(o)}}checkEnableInstallToolFile(){new s(this.getUrl("checkEnableInstallToolFile")).get({cache:"no-cache"}).then(async e=>{!0===(await e.resolve()).success?this.checkLogin():this.mode=c.Locked},e=>{this.handleAjaxError(e)})}checkLogin(){new s(this.getUrl("checkLogin")).get({cache:"no-cache"}).then(async e=>{!0===(await e.resolve()).success?this.mode=c.Cards:this.mode=c.Login},e=>{this.handleAjaxError(e)})}showLogin(){new s(this.getUrl("showLogin")).get({cache:"no-cache"}).then(async e=>{const t=await e.resolve();!0===t.success&&n.default(this.selectorBody).empty().append(t.html)},e=>{this.handleAjaxError(e)})}login(){const e=n.default(".t3js-login-output"),t=l.render(r.loading,"Loading...","");e.empty().html(t),new s(this.getUrl()).post({install:{action:"login",token:n.default("[data-login-token]").data("login-token"),password:n.default(".t3-install-form-input-text").val()}}).then(async t=>{const o=await t.resolve();!0===o.success?this.executeSilentConfigurationUpdate():o.status.forEach(t=>{const o=i.render(t.severity,t.title,t.message);e.empty().html(o)})},e=>{this.handleAjaxError(e)})}logout(){new s(this.getUrl("logout")).get({cache:"no-cache"}).then(async e=>{!0===(await e.resolve()).success&&(this.mode=c.Loading,this.preAccessCheck())},e=>{this.handleAjaxError(e)})}updateLoadingInfo(e){n.default(this.selectorBody).find("#t3js-ui-block-detail").text(e)}preAccessCheck(){this.updateLoadingInfo("Execute pre access check"),new s(this.getUrl("preAccessCheck","layout")).get({cache:"no-cache"}).then(async e=>{const t=await e.resolve();t.installToolLocked?this.checkEnableInstallToolFile():t.isAuthorized?this.executeSilentConfigurationUpdate():this.mode=c.Login},e=>{this.handleAjaxError(e)})}};__decorate([a.property({type:String})],d.prototype,"endpoint",void 0),__decorate([a.property({type:Boolean})],d.prototype,"active",void 0),__decorate([a.property({type:Boolean})],d.prototype,"standalone",void 0),__decorate([a.state()],d.prototype,"mode",void 0),d=__decorate([a.customElement("typo3-admin-tool-router")],d);return new class{get router(){return document.querySelector("typo3-admin-tool-router")}getUrl(e,t,o){return this.router.getUrl(e,t,o)}async handleAjaxError(e,t){return this.router.handleAjaxError(e,t)}}}));