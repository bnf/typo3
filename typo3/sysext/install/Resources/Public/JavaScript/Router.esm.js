import AjaxRequest from '../../../../core/Resources/Public/JavaScript/Ajax/AjaxRequest.esm.js';
import Icons from '../../../../backend/Resources/Public/JavaScript/Icons.esm.js';
import jQuery from '../../../../core/Resources/Public/JavaScript/Contrib/jquery/jquery.esm.js';
import Modal from '../../../../backend/Resources/Public/JavaScript/Modal.esm.js';
import Severity from './Renderable/Severity.esm.js';
import InfoBox from './Renderable/InfoBox.esm.js';
import ProgressBar from './Renderable/ProgressBar.esm.js';

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
class Router {
    constructor() {
        this.selectorBody = '.t3js-body';
        this.selectorMainContent = '.t3js-module-body';
    }
    initialize() {
        this.registerInstallToolRoutes();
        jQuery(document).on('click', '.t3js-login-lockInstallTool', (e) => {
            e.preventDefault();
            this.logout();
        });
        jQuery(document).on('click', '.t3js-login-login', (e) => {
            e.preventDefault();
            this.login();
        });
        jQuery(document).on('keydown', '#t3-install-form-password', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                jQuery('.t3js-login-login').trigger('click');
            }
        });
        jQuery(document).on('click', '.t3js-modulemenu-action', (e) => {
            e.preventDefault();
            const $me = jQuery(e.currentTarget);
            window.location.href = $me.data('link');
        });
        jQuery(document).on('click', '.card .btn', (e) => {
            e.preventDefault();
            const $me = jQuery(e.currentTarget);
            const requireModule = $me.data('require');
            const inlineState = $me.data('inline');
            const isInline = typeof inlineState !== 'undefined' && parseInt(inlineState, 10) === 1;
            if (isInline) {
                import(requireModule).then(({ default: aModule }) => {
                    aModule.initialize($me);
                });
            }
            else {
                const modalTitle = $me.closest('.card').find('.card-title').html();
                const modalSize = $me.data('modalSize') || Modal.sizes.large;
                const $modal = Modal.advanced({
                    type: Modal.types.default,
                    title: modalTitle,
                    size: modalSize,
                    content: jQuery('<div class="modal-loading">'),
                    additionalCssClasses: ['install-tool-modal'],
                    callback: (currentModal) => {
                        import(requireModule).then(({ default: aModule }) => {
                            aModule.initialize(currentModal);
                        });
                    },
                });
                Icons.getIcon('spinner-circle', Icons.sizes.default, null, null, Icons.markupIdentifiers.inline).then((icon) => {
                    $modal.find('.modal-loading').append(icon);
                });
            }
        });
        const $context = jQuery(this.selectorBody).data('context');
        if ($context === 'backend') {
            this.executeSilentConfigurationUpdate();
        }
        else {
            this.preAccessCheck();
        }
    }
    registerInstallToolRoutes() {
        if (typeof TYPO3.settings === 'undefined') {
            TYPO3.settings = {
                ajaxUrls: {
                    icons: window.location.origin + window.location.pathname + '?install[controller]=icon&install[action]=getIcon',
                    icons_cache: window.location.origin + window.location.pathname + '?install[controller]=icon&install[action]=getCacheIdentifier',
                },
            };
        }
    }
    getUrl(action, controller, query) {
        const context = jQuery(this.selectorBody).data('context');
        let url = location.href;
        url = url.replace(location.search, '');
        if (controller === undefined) {
            controller = jQuery(this.selectorBody).data('controller');
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
    executeSilentConfigurationUpdate() {
        this.updateLoadingInfo('Checking session and executing silent configuration update');
        (new AjaxRequest(this.getUrl('executeSilentConfigurationUpdate', 'layout')))
            .get({ cache: 'no-cache' })
            .then(async (response) => {
            const data = await response.resolve();
            if (data.success === true) {
                this.executeSilentTemplateFileUpdate();
            }
            else {
                this.executeSilentConfigurationUpdate();
            }
        }, (error) => {
            this.handleAjaxError(error);
        });
    }
    executeSilentTemplateFileUpdate() {
        this.updateLoadingInfo('Checking session and executing silent template file update');
        (new AjaxRequest(this.getUrl('executeSilentTemplateFileUpdate', 'layout')))
            .get({ cache: 'no-cache' })
            .then(async (response) => {
            const data = await response.resolve();
            if (data.success === true) {
                this.executeSilentExtensionConfigurationSynchronization();
            }
            else {
                this.executeSilentTemplateFileUpdate();
            }
        }, (error) => {
            this.handleAjaxError(error);
        });
    }
    /**
     * Extensions which come with new default settings in ext_conf_template.txt extension
     * configuration files get their new defaults written to LocalConfiguration.
     */
    executeSilentExtensionConfigurationSynchronization() {
        const $outputContainer = jQuery(this.selectorBody);
        this.updateLoadingInfo('Executing silent extension configuration synchronization');
        (new AjaxRequest(this.getUrl('executeSilentExtensionConfigurationSynchronization', 'layout')))
            .get({ cache: 'no-cache' })
            .then(async (response) => {
            const data = await response.resolve();
            if (data.success === true) {
                this.loadMainLayout();
            }
            else {
                const message = InfoBox.render(Severity.error, 'Something went wrong', '');
                $outputContainer.empty().append(message);
            }
        }, (error) => {
            this.handleAjaxError(error);
        });
    }
    loadMainLayout() {
        const $outputContainer = jQuery(this.selectorBody);
        const controller = $outputContainer.data('controller');
        this.updateLoadingInfo('Loading main layout');
        (new AjaxRequest(this.getUrl('mainLayout', 'layout', 'install[module]=' + controller)))
            .get({ cache: 'no-cache' })
            .then(async (response) => {
            const data = await response.resolve();
            if (data.success === true && data.html !== 'undefined' && data.html.length > 0) {
                $outputContainer.empty().append(data.html);
                // Mark main module as active in standalone
                if (jQuery(this.selectorBody).data('context') !== 'backend') {
                    $outputContainer.find('.t3js-modulemenu-action[data-controller="' + controller + '"]').addClass('modulemenu-action-active');
                }
                this.loadCards();
            }
            else {
                const message = InfoBox.render(Severity.error, 'Something went wrong', '');
                $outputContainer.empty().append(message);
            }
        }, (error) => {
            this.handleAjaxError(error);
        });
    }
    async handleAjaxError(error, $outputContainer) {
        let $message;
        if (error.response.status === 403) {
            // Install tool session expired - depending on context render error message or login
            const $context = jQuery(this.selectorBody).data('context');
            if ($context === 'backend') {
                $message = InfoBox.render(Severity.error, 'The install tool session expired. Please reload the backend and try again.');
                jQuery(this.selectorBody).empty().append($message);
            }
            else {
                this.checkEnableInstallToolFile();
            }
        }
        else {
            // @todo Recovery tests should be started here
            const url = this.getUrl(undefined, 'upgrade');
            $message = jQuery('<div class="t3js-infobox callout callout-sm callout-danger">'
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
                + '</div>');
            if (typeof $outputContainer !== 'undefined') {
                // Write to given output container. This is typically a modal if given
                jQuery($outputContainer).empty().html($message);
            }
            else {
                // Else write to main frame
                jQuery(this.selectorBody).empty().html($message);
            }
        }
    }
    checkEnableInstallToolFile() {
        (new AjaxRequest(this.getUrl('checkEnableInstallToolFile')))
            .get({ cache: 'no-cache' })
            .then(async (response) => {
            const data = await response.resolve();
            if (data.success === true) {
                this.checkLogin();
            }
            else {
                this.showEnableInstallTool();
            }
        }, (error) => {
            this.handleAjaxError(error);
        });
    }
    showEnableInstallTool() {
        (new AjaxRequest(this.getUrl('showEnableInstallToolFile')))
            .get({ cache: 'no-cache' })
            .then(async (response) => {
            const data = await response.resolve();
            if (data.success === true) {
                jQuery(this.selectorBody).empty().append(data.html);
            }
        }, (error) => {
            this.handleAjaxError(error);
        });
    }
    checkLogin() {
        (new AjaxRequest(this.getUrl('checkLogin')))
            .get({ cache: 'no-cache' })
            .then(async (response) => {
            const data = await response.resolve();
            if (data.success === true) {
                this.loadMainLayout();
            }
            else {
                this.showLogin();
            }
        }, (error) => {
            this.handleAjaxError(error);
        });
    }
    showLogin() {
        (new AjaxRequest(this.getUrl('showLogin')))
            .get({ cache: 'no-cache' })
            .then(async (response) => {
            const data = await response.resolve();
            if (data.success === true) {
                jQuery(this.selectorBody).empty().append(data.html);
            }
        }, (error) => {
            this.handleAjaxError(error);
        });
    }
    login() {
        const $outputContainer = jQuery('.t3js-login-output');
        const message = ProgressBar.render(Severity.loading, 'Loading...', '');
        $outputContainer.empty().html(message);
        (new AjaxRequest(this.getUrl()))
            .post({
            install: {
                action: 'login',
                token: jQuery('[data-login-token]').data('login-token'),
                password: jQuery('.t3-install-form-input-text').val(),
            },
        })
            .then(async (response) => {
            const data = await response.resolve();
            if (data.success === true) {
                this.executeSilentConfigurationUpdate();
            }
            else {
                data.status.forEach((element) => {
                    const m = InfoBox.render(element.severity, element.title, element.message);
                    $outputContainer.empty().html(m);
                });
            }
        }, (error) => {
            this.handleAjaxError(error);
        });
    }
    logout() {
        (new AjaxRequest(this.getUrl('logout')))
            .get({ cache: 'no-cache' })
            .then(async (response) => {
            const data = await response.resolve();
            if (data.success === true) {
                this.showEnableInstallTool();
            }
        }, (error) => {
            this.handleAjaxError(error);
        });
    }
    loadCards() {
        const outputContainer = jQuery(this.selectorMainContent);
        (new AjaxRequest(this.getUrl('cards')))
            .get({ cache: 'no-cache' })
            .then(async (response) => {
            const data = await response.resolve();
            if (data.success === true && data.html !== 'undefined' && data.html.length > 0) {
                outputContainer.empty().append(data.html);
            }
            else {
                const message = InfoBox.render(Severity.error, 'Something went wrong', '');
                outputContainer.empty().append(message);
            }
        }, (error) => {
            this.handleAjaxError(error);
        });
    }
    updateLoadingInfo(info) {
        const $outputContainer = jQuery(this.selectorBody);
        $outputContainer.find('#t3js-ui-block-detail').text(info);
    }
    preAccessCheck() {
        this.updateLoadingInfo('Execute pre access check');
        (new AjaxRequest(this.getUrl('preAccessCheck', 'layout')))
            .get({ cache: 'no-cache' })
            .then(async (response) => {
            const data = await response.resolve();
            if (data.installToolLocked) {
                this.checkEnableInstallToolFile();
            }
            else if (!data.isAuthorized) {
                this.showLogin();
            }
            else {
                this.executeSilentConfigurationUpdate();
            }
        }, (error) => {
            this.handleAjaxError(error);
        });
    }
}
var Router$1 = new Router();

export default Router$1;
