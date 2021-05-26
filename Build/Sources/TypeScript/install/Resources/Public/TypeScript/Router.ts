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

import {html, LitElement, nothing, TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators';
import $ from 'jquery';
import AjaxRequest = require('TYPO3/CMS/Core/Ajax/AjaxRequest');
import {AjaxResponse} from 'TYPO3/CMS/Core/Ajax/AjaxResponse';
import {AbstractInteractableModule} from './Module/AbstractInteractableModule';
import {AbstractInlineModule} from './Module/AbstractInlineModule';
import Icons = require('TYPO3/CMS/Backend/Icons');
import Modal = require('TYPO3/CMS/Backend/Modal');
import InfoBox = require('./Renderable/InfoBox');
import ProgressBar = require('./Renderable/ProgressBar');
import Severity = require('./Renderable/Severity');
//import './Module';
import 'TYPO3/CMS/Backend/Element/SpinnerElement';
import './App';

enum AdminToolRoute {
  Loading,
  Locked,
  Login,
  Cards
}

@customElement('typo3-admin-tool-router')
class Router extends LitElement {

  @property({type: String}) endpoint: string;
  @property({type: Boolean}) active: boolean = false;
  @property({type: Boolean}) standalone: boolean = false;

  @state() mode: AdminToolRoute = AdminToolRoute.Loading;

  private selectorBody: string = '.t3js-body';
  private selectorMainContent: string = '.t3js-module-body';

  public connectedCallback(): void {

    super.connectedCallback();

    this.registerInstallToolRoutes();

    this.addEventListener('install-tool:ajax-error', (e: CustomEvent) => {
      this.handleAjaxError(e.detail.error);
    });

    this.addEventListener('install-tool:logout', (e: CustomEvent) => {
      this.logout();
    });

    if (this.standalone === false) {
      this.executeSilentConfigurationUpdate();
    } else {
      this.preAccessCheck();
    }
  }

  public createRenderRoot(): HTMLElement | ShadowRoot {
    // @todo Switch to Shadow DOM once Bootstrap CSS style can be applied correctly
    // const renderRoot = this.attachShadow({mode: 'open'});
    return this;
  }

  public render(): TemplateResult {
    if (this.mode === AdminToolRoute.Loading) {
      return html`
        <div class="ui-block">
          <typo3-backend-spinner size="large" class="mx-auto"></typo3-backend-spinner>
          <h2>Initializing</h2>
        </div>
      `;
    }

    if (this.mode === AdminToolRoute.Locked) {
      return html`
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
      `;
    }

    if (this.mode === AdminToolRoute.Login) {
      const siteName = 'TODO';
      // @todo
      const installToolEnableFilePermanent: boolean = false;
      return html`
        <div class="container">
          <div class="page-header">
            <h1 class="logo-pageheader">
              <img src="./sysext/install/Resources/Public/Images/typo3_orange.svg" width="130" class="logo" /> Site: ${siteName} <small>Login to TYPO3 Install Tool</small>
            </h1>
          </div>
          <div class="row justify-content-center">
            <div class="col-md-6">
              <div id="t3-install-box-body">
                <form method="post" class="form-inline" id="t3-install-form-login" data-login-token="{loginToken}" @submit=${(e: Event) => { e.preventDefault(); this.login(); }}>
                  <div class="form-group">
                    <label for="t3-install-form-password">Password</label>
                    <input id="t3-install-form-password" type="password" name="install[password]" class="t3-install-form-input-text form-control" autofocus="autofocus" />
                  </div>
                  <button type="button" class="btn btn-default btn-success t3js-login-login">
                    Login
                  </button>
                  ${installToolEnableFilePermanent ? nothing : html`
                    <button type="button" class="btn btn-default btn-danger pull-right" @click=${(e: Event) => { e.preventDefault(); this.logout(); }}>
                      <i class="fa fa-lock"></i> Lock Install Tool again
                    </button>
                  `}
                </form>
              </div>
              <div id="t3-install-box-border-bottom">&nbsp;</div>

              <div class="t3js-login-output"></div>

              ${!installToolEnableFilePermanent ? nothing : html`
                <div class="panel panel-danger">
                  <div class="panel-heading"><h3 class="panel-title">Install Tool is permanently enabled</h3></div>
                  <div class="panel-body">
                    The Install Tool is permanently enabled because our <code>ENABLE_INSTALL_TOOL</code> file contains
                    the text <em>KEEP_FILE</em>.<br />
                    Never use this on production systems!
                  </div>
                </div>
              `}

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
      `;
    }

    if (this.mode === AdminToolRoute.Cards) {
      return html`<typo3-admin-tool-app endpoint="${this.getUrl('cards')}" active></typo3-admin-tool-app>`;
    }

    return html`Foo`;
  }

  public registerInstallToolRoutes(): void {
    if (this.standalone && typeof TYPO3.settings === 'undefined') {
      TYPO3.settings = {
        ajaxUrls: {
          icons: this.endpoint + '?install[controller]=icon&install[action]=getIcon',
          icons_cache: this.endpoint + '?install[controller]=icon&install[action]=getCacheIdentifier',
          //icons: window.location.origin + window.location.pathname + '?install[controller]=icon&install[action]=getIcon',
          //icons_cache: window.location.origin + window.location.pathname + '?install[controller]=icon&install[action]=getCacheIdentifier',
        },
      };
    }
  }

  public getUrl(action?: string, controller?: string, query?: string): string {
    const context = $(this.selectorBody).data('context');
    let url = location.href;
    url = url.replace(location.search, '');
    if (controller === undefined) {
      controller = $(this.selectorBody).data('controller');
    }
    url = url + '?install[controller]=' + controller;
    if (context !== undefined && context !== '') {
      url = url + '&install[context]=' + context;
    }
    if (action !== undefined) {
      url = url + '&install[action]=' + action;
    }
    if (query !== undefined) {
      url = url + '&' + query;
    }
    return url;
  }

  public executeSilentConfigurationUpdate(): void {
    this.updateLoadingInfo('Checking session and executing silent configuration update');
    (new AjaxRequest(this.getUrl('executeSilentConfigurationUpdate', 'layout')))
      .get({cache: 'no-cache'})
      .then(
        async (response: AjaxResponse): Promise<any> => {
          const data = await response.resolve();
          if (data.success === true) {
            this.executeSilentTemplateFileUpdate();
          } else {
            this.executeSilentConfigurationUpdate();
          }
        },
        (error: AjaxResponse): void => {
          this.handleAjaxError(error)
        }
      );
  }

  public executeSilentTemplateFileUpdate(): void {
    this.updateLoadingInfo('Checking session and executing silent template file update');
    (new AjaxRequest(this.getUrl('executeSilentTemplateFileUpdate', 'layout')))
      .get({cache: 'no-cache'})
      .then(
        async (response: AjaxResponse): Promise<any> => {
          const data = await response.resolve();
          if (data.success === true) {
            this.executeSilentExtensionConfigurationSynchronization();
          } else {
            this.executeSilentTemplateFileUpdate();
          }
        },
        (error: AjaxResponse): void => {
          this.handleAjaxError(error)
        }
      );
  }

  /**
   * Extensions which come with new default settings in ext_conf_template.txt extension
   * configuration files get their new defaults written to LocalConfiguration.
   */
  public executeSilentExtensionConfigurationSynchronization(): void {
    const $outputContainer = $(this.selectorBody);
    this.updateLoadingInfo('Executing silent extension configuration synchronization');
    (new AjaxRequest(this.getUrl('executeSilentExtensionConfigurationSynchronization', 'layout')))
      .get({cache: 'no-cache'})
      .then(
        async (response: AjaxResponse): Promise<any> => {
          const data = await response.resolve();
          if (data.success === true) {
            this.mode = AdminToolRoute.Cards;
            //this.loadMainLayout();
          } else {
            const message = InfoBox.render(Severity.error, 'Something went wrong', '');
            $outputContainer.empty().append(message);
          }
        },
        (error: AjaxResponse): void => {
          this.handleAjaxError(error)
        }
      );
  }

  public loadMainLayout(): void {
    const $outputContainer = $(this.selectorBody);
    const controller = $outputContainer.data('controller');
    this.updateLoadingInfo('Loading main layout');
    (new AjaxRequest(this.getUrl('mainLayout', 'layout', 'install[module]=' + controller)))
      .get({cache: 'no-cache'})
      .then(
        async (response: AjaxResponse): Promise<any> => {
          const data = await response.resolve();
          if (data.success === true && data.html !== 'undefined' && data.html.length > 0) {
            $outputContainer.empty().append(data.html);
            // Mark main module as active in standalone
            if ($(this.selectorBody).data('context') !== 'backend') {
              $outputContainer.find('.t3js-modulemenu-action[data-controller="' + controller + '"]').addClass('modulemenu-action-active');
            }
            //this.loadCards();
            this.mode = AdminToolRoute.Cards;
          } else {
            const message = InfoBox.render(Severity.error, 'Something went wrong', '');
            $outputContainer.empty().append(message);
          }
        },
        (error: AjaxResponse): void => {
          this.handleAjaxError(error)
        }
      );
  }

  public async handleAjaxError(error: AjaxResponse, $outputContainer?: JQuery): Promise<any> {
    let $message: any;
    if (error.response.status === 403) {
      // Install tool session expired - depending on context render error message or login
      const $context = $(this.selectorBody).data('context');
      if ($context === 'backend') {
        $message = InfoBox.render(Severity.error, 'The install tool session expired. Please reload the backend and try again.');
        $(this.selectorBody).empty().append($message);
      } else {
        this.checkEnableInstallToolFile();
      }
    } else {
      // @todo Recovery tests should be started here
      const url = this.getUrl(undefined, 'upgrade');
      $message = $(
        '<div class="t3js-infobox callout callout-sm callout-danger">'
        + '<div class="callout-body">'
        + '<p>Something went wrong. Please use <b><a href="' + url + '">Check for broken'
        + ' extensions</a></b> to see if a loaded extension breaks this part of the install tool'
        + ' and unload it.</p>'
        + '<p>The box below may additionally reveal further details on what went wrong depending on your debug settings.'
        + ' It may help to temporarily switch to debug mode using <b>Settings > Configuration Presets > Debug settings.</b></p>'
        + '<p>If this error happens at an early state and no full exception back trace is shown, it may also help'
        + ' to manually increase debugging output in <code>typo3conf/LocalConfiguration.php</code>:'
        + '<code>[\'BE\'][\'debug\'] => true</code>, <code>[\'SYS\'][\'devIPmask\'] => \'*\'</code>, '
        + '<code>[\'SYS\'][\'displayErrors\'] => 1</code>,'
        + '<code>[\'SYS\'][\'exceptionalErrors\'] => 12290</code></p>'
        + '</div>'
        + '</div>'
        + '<div class="panel-group" role="tablist" aria-multiselectable="true">'
        + '<div class="panel panel-default panel-flat searchhit">'
        + '<div class="panel-heading" role="tab" id="heading-error">'
        + '<h3 class="panel-title">'
        + '<a role="button" data-bs-toggle="collapse" data-bs-parent="#accordion" href="#collapse-error" aria-expanded="true" '
        + 'aria-controls="collapse-error" class="collapsed">'
        + '<span class="caret"></span>'
        + '<strong>Ajax error</strong>'
        + '</a>'
        + '</h3>'
        + '</div>'
        + '<div id="collapse-error" class="panel-collapse collapse" role="tabpanel" aria-labelledby="heading-error">'
        + '<div class="panel-body">'
        + (await error.response.text())
        + '</div>'
        + '</div>'
        + '</div>'
        + '</div>',
      );

      if (typeof $outputContainer !== 'undefined') {
        // Write to given output container. This is typically a modal if given
        $($outputContainer).empty().html($message);
      } else {
        // Else write to main frame
        $(this.selectorBody).empty().html($message);
      }
    }
  }

  public checkEnableInstallToolFile(): void {
    (new AjaxRequest(this.getUrl('checkEnableInstallToolFile')))
      .get({cache: 'no-cache'})
      .then(
        async (response: AjaxResponse): Promise<any> => {
          const data = await response.resolve();
          if (data.success === true) {
            this.checkLogin();
          } else {
            //this.showEnableInstallTool();
            this.mode = AdminToolRoute.Locked;
          }
        },
        (error: AjaxResponse): void => {
          this.handleAjaxError(error)
        }
      );
  }

  public showEnableInstallTool(): void {
    (new AjaxRequest(this.getUrl('showEnableInstallToolFile')))
      .get({cache: 'no-cache'})
      .then(
        async (response: AjaxResponse): Promise<any> => {
          const data = await response.resolve();
          if (data.success === true) {
            $(this.selectorBody).empty().append(data.html);
          }
        },
        (error: AjaxResponse): void => {
          this.handleAjaxError(error)
        }
      );
  }

  public checkLogin(): void {
    (new AjaxRequest(this.getUrl('checkLogin')))
      .get({cache: 'no-cache'})
      .then(
        async (response: AjaxResponse): Promise<any> => {
          const data = await response.resolve();
          if (data.success === true) {
            this.mode = AdminToolRoute.Cards;
            //this.loadMainLayout();
          } else {
            this.mode = AdminToolRoute.Login;
            //this.showLogin();
          }
        },
        (error: AjaxResponse): void => {
          this.handleAjaxError(error)
        }
      );
  }

  public showLogin(): void {
    (new AjaxRequest(this.getUrl('showLogin')))
      .get({cache: 'no-cache'})
      .then(
        async (response: AjaxResponse): Promise<any> => {
          const data = await response.resolve();
          if (data.success === true) {
            $(this.selectorBody).empty().append(data.html);
          }
        },
        (error: AjaxResponse): void => {
          this.handleAjaxError(error)
        }
      );
  }

  public login(): void {
    const $outputContainer: JQuery = $('.t3js-login-output');
    const message: any = ProgressBar.render(Severity.loading, 'Loading...', '');
    $outputContainer.empty().html(message);
    (new AjaxRequest(this.getUrl()))
      .post({
        install: {
          action: 'login',
          token: $('[data-login-token]').data('login-token'),
          password: $('.t3-install-form-input-text').val(),
        },
      })
      .then(
        async (response: AjaxResponse): Promise<any> => {
          const data = await response.resolve();
          if (data.success === true) {
            this.executeSilentConfigurationUpdate();
          } else {
            data.status.forEach((element: any): void => {
              const m: any = InfoBox.render(element.severity, element.title, element.message);
              $outputContainer.empty().html(m);
            });
          }
        },
        (error: AjaxResponse): void => {
          this.handleAjaxError(error)
        }
      );
  }

  public logout(): void {
    (new AjaxRequest(this.getUrl('logout')))
      .get({cache: 'no-cache'})
      .then(
        async (response: AjaxResponse): Promise<any> => {
          const data = await response.resolve();
          if (data.success === true) {
            //this.showEnableInstallTool();
            this.mode = AdminToolRoute.Locked;
          }
        },
        (error: AjaxResponse): void => {
          this.handleAjaxError(error)
        }
      );
  }

  public loadCards(): void {
    const el = document.createElement('typo3-install-module');
    el.setAttribute('endpoint', this.getUrl('cards'));
    el.setAttribute('active', null);
    el.setAttribute('standalone', null);
    const outputContainer = $(this.selectorMainContent);
    outputContainer.empty().append(el);
  }

  public updateLoadingInfo(info: string): void {
    const $outputContainer = $(this.selectorBody);
    $outputContainer.find('#t3js-ui-block-detail').text(info);
  }

  private preAccessCheck(): void {
    this.updateLoadingInfo('Execute pre access check');
    (new AjaxRequest(this.getUrl('preAccessCheck', 'layout')))
      .get({cache: 'no-cache'})
      .then(
        async (response: AjaxResponse): Promise<any> => {
          const data = await response.resolve();
          if (data.installToolLocked) {
            this.checkEnableInstallToolFile();
          } else if (!data.isAuthorized) {
            //this.showLogin();
            this.mode = AdminToolRoute.Login;
          } else {
            this.executeSilentConfigurationUpdate();
          }
        },
        (error: AjaxResponse): void => {
          this.handleAjaxError(error)
        }
      );
  }
}

class RouterProxy {
  get router(): Router {
    return document.querySelector('typo3-admin-tool-router') as Router;
  }

  public getUrl(action?: string, controller?: string, query?: string): string {
    return this.router.getUrl(action, controller, query);
  }

  public async handleAjaxError(error: AjaxResponse, $outputContainer?: JQuery): Promise<any> {
    return this.router.handleAjaxError(error, $outputContainer);
  }

  public logout(): void {
    return this.router.logout();
  }
}

export = new RouterProxy;
