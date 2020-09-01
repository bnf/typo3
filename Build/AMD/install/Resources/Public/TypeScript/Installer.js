define(['jquery', '../../../../core/Resources/Public/TypeScript/Ajax/AjaxRequest', './Renderable/Severity', './Renderable/InfoBox', './Renderable/ProgressBar', './Module/PasswordStrength'], function ($, AjaxRequest, Severity, InfoBox, ProgressBar, PasswordStrength) { 'use strict';

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    var $__default = /*#__PURE__*/_interopDefaultLegacy($);

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
    /**
     * Walk through the installation process of TYPO3
     */
    class Installer {
        constructor() {
            this.selectorBody = '.t3js-body';
            this.selectorModuleContent = '.t3js-module-content';
            this.selectorMainContent = '.t3js-installer-content';
            this.selectorProgressBar = '.t3js-installer-progress';
            this.selectorDatabaseConnectOutput = '.t3js-installer-databaseConnect-output';
            this.selectorDatabaseSelectOutput = '.t3js-installer-databaseSelect-output';
            this.selectorDatabaseDataOutput = '.t3js-installer-databaseData-output';
            this.initializeEvents();
            $__default['default'](() => {
                this.initialize();
            });
        }
        initializeEvents() {
            $__default['default'](document).on('click', '.t3js-installer-environmentFolders-retry', (e) => {
                e.preventDefault();
                this.showEnvironmentAndFolders();
            });
            $__default['default'](document).on('click', '.t3js-installer-environmentFolders-execute', (e) => {
                e.preventDefault();
                this.executeEnvironmentAndFolders();
            });
            $__default['default'](document).on('click', '.t3js-installer-databaseConnect-execute', (e) => {
                e.preventDefault();
                this.executeDatabaseConnect();
            });
            $__default['default'](document).on('click', '.t3js-installer-databaseSelect-execute', (e) => {
                e.preventDefault();
                this.executeDatabaseSelect();
            });
            $__default['default'](document).on('click', '.t3js-installer-databaseData-execute', (e) => {
                e.preventDefault();
                this.executeDatabaseData();
            });
            $__default['default'](document).on('click', '.t3js-installer-defaultConfiguration-execute', (e) => {
                e.preventDefault();
                this.executeDefaultConfiguration();
            });
            $__default['default'](document).on('keyup', '.t3-install-form-password-strength', () => {
                PasswordStrength.initialize('.t3-install-form-password-strength');
            });
            // Database connect db driver selection
            $__default['default'](document).on('change', '#t3js-connect-database-driver', (e) => {
                let driver = $__default['default'](e.currentTarget).val();
                $__default['default']('.t3-install-driver-data').hide();
                $__default['default']('.t3-install-driver-data input').attr('disabled', 'disabled');
                $__default['default']('#' + driver + ' input').attr('disabled', null);
                $__default['default']('#' + driver).show();
            });
        }
        initialize() {
            this.setProgress(0);
            this.getMainLayout();
        }
        getUrl(action) {
            let url = location.href;
            url = url.replace(location.search, '');
            if (action !== undefined) {
                url = url + '?install[action]=' + action;
            }
            return url;
        }
        setProgress(done) {
            let $progressBar = $__default['default'](this.selectorProgressBar);
            let percent = 0;
            if (done !== 0) {
                percent = (done / 5) * 100;
                $progressBar.find('.progress-bar').empty().text(done + ' / 5 - ' + percent + '% Complete');
            }
            $progressBar
                .find('.progress-bar')
                .css('width', percent + '%')
                .attr('aria-valuenow', percent);
        }
        getMainLayout() {
            (new AjaxRequest(this.getUrl('mainLayout')))
                .get({ cache: 'no-cache' })
                .then(async (response) => {
                const data = await response.resolve();
                $__default['default'](this.selectorBody).empty().append(data.html);
                this.checkInstallerAvailable();
            });
        }
        checkInstallerAvailable() {
            (new AjaxRequest(this.getUrl('checkInstallerAvailable')))
                .get({ cache: 'no-cache' })
                .then(async (response) => {
                const data = await response.resolve();
                data.success
                    ? this.checkEnvironmentAndFolders()
                    : this.showInstallerNotAvailable();
            });
        }
        showInstallerNotAvailable() {
            let $outputContainer = $__default['default'](this.selectorMainContent);
            (new AjaxRequest(this.getUrl('showInstallerNotAvailable')))
                .get({ cache: 'no-cache' })
                .then(async (response) => {
                const data = await response.resolve();
                if (data.success === true) {
                    $outputContainer.empty().append(data.html);
                }
            });
        }
        checkEnvironmentAndFolders() {
            this.setProgress(1);
            (new AjaxRequest(this.getUrl('checkEnvironmentAndFolders')))
                .get({ cache: 'no-cache' })
                .then(async (response) => {
                const data = await response.resolve();
                if (data.success === true) {
                    this.checkTrustedHostsPattern();
                }
                else {
                    this.showEnvironmentAndFolders();
                }
            });
        }
        showEnvironmentAndFolders() {
            let $outputContainer = $__default['default'](this.selectorMainContent);
            (new AjaxRequest(this.getUrl('showEnvironmentAndFolders')))
                .get({ cache: 'no-cache' })
                .then(async (response) => {
                const data = await response.resolve();
                if (data.success === true) {
                    $outputContainer.empty().html(data.html);
                    let $detailContainer = $__default['default']('.t3js-installer-environment-details');
                    let hasMessage = false;
                    if (Array.isArray(data.environmentStatusErrors)) {
                        data.environmentStatusErrors.forEach((element) => {
                            hasMessage = true;
                            let message = InfoBox.render(element.severity, element.title, element.message);
                            $detailContainer.append(message);
                        });
                    }
                    if (Array.isArray(data.environmentStatusWarnings)) {
                        data.environmentStatusWarnings.forEach((element) => {
                            hasMessage = true;
                            let message = InfoBox.render(element.severity, element.title, element.message);
                            $detailContainer.append(message);
                        });
                    }
                    if (Array.isArray(data.structureErrors)) {
                        data.structureErrors.forEach((element) => {
                            hasMessage = true;
                            let message = InfoBox.render(element.severity, element.title, element.message);
                            $detailContainer.append(message);
                        });
                    }
                    if (hasMessage) {
                        $detailContainer.show();
                        $__default['default']('.t3js-installer-environmentFolders-bad').show();
                    }
                    else {
                        $__default['default']('.t3js-installer-environmentFolders-good').show();
                    }
                }
            });
        }
        executeEnvironmentAndFolders() {
            (new AjaxRequest(this.getUrl('executeEnvironmentAndFolders')))
                .get({ cache: 'no-cache' })
                .then(async (response) => {
                const data = await response.resolve();
                if (data.success === true) {
                    this.checkTrustedHostsPattern();
                }
            });
        }
        checkTrustedHostsPattern() {
            (new AjaxRequest(this.getUrl('checkTrustedHostsPattern')))
                .get({ cache: 'no-cache' })
                .then(async (response) => {
                const data = await response.resolve();
                if (data.success === true) {
                    this.executeSilentConfigurationUpdate();
                }
                else {
                    this.executeAdjustTrustedHostsPattern();
                }
            });
        }
        executeAdjustTrustedHostsPattern() {
            (new AjaxRequest(this.getUrl('executeAdjustTrustedHostsPattern')))
                .get({ cache: 'no-cache' })
                .then(() => {
                this.executeSilentConfigurationUpdate();
            });
        }
        executeSilentConfigurationUpdate() {
            (new AjaxRequest(this.getUrl('executeSilentConfigurationUpdate')))
                .get({ cache: 'no-cache' })
                .then(async (response) => {
                const data = await response.resolve();
                if (data.success === true) {
                    this.checkDatabaseConnect();
                }
                else {
                    this.executeSilentConfigurationUpdate();
                }
            });
        }
        checkDatabaseConnect() {
            this.setProgress(2);
            (new AjaxRequest(this.getUrl('checkDatabaseConnect')))
                .get({ cache: 'no-cache' })
                .then(async (response) => {
                const data = await response.resolve();
                if (data.success === true) {
                    this.checkDatabaseSelect();
                }
                else {
                    this.showDatabaseConnect();
                }
            });
        }
        showDatabaseConnect() {
            let $outputContainer = $__default['default'](this.selectorMainContent);
            (new AjaxRequest(this.getUrl('showDatabaseConnect')))
                .get({ cache: 'no-cache' })
                .then(async (response) => {
                const data = await response.resolve();
                if (data.success === true) {
                    $outputContainer.empty().html(data.html);
                    $__default['default']('#t3js-connect-database-driver').trigger('change');
                }
            });
        }
        executeDatabaseConnect() {
            let $outputContainer = $__default['default'](this.selectorDatabaseConnectOutput);
            let postData = {
                'install[action]': 'executeDatabaseConnect',
                'install[token]': $__default['default'](this.selectorModuleContent).data('installer-database-connect-execute-token'),
            };
            $__default['default']($__default['default'](this.selectorBody + ' form').serializeArray()).each((index, element) => {
                postData[element.name] = element.value;
            });
            (new AjaxRequest(this.getUrl()))
                .post(postData)
                .then(async (response) => {
                const data = await response.resolve();
                if (data.success === true) {
                    this.checkDatabaseSelect();
                }
                else {
                    if (Array.isArray(data.status)) {
                        $outputContainer.empty();
                        data.status.forEach((element) => {
                            let message = InfoBox.render(element.severity, element.title, element.message);
                            $outputContainer.append(message);
                        });
                    }
                }
            });
        }
        checkDatabaseSelect() {
            this.setProgress(3);
            (new AjaxRequest(this.getUrl('checkDatabaseSelect')))
                .get({ cache: 'no-cache' })
                .then(async (response) => {
                const data = await response.resolve();
                if (data.success === true) {
                    this.checkDatabaseData();
                }
                else {
                    this.showDatabaseSelect();
                }
            });
        }
        showDatabaseSelect() {
            let $outputContainer = $__default['default'](this.selectorMainContent);
            (new AjaxRequest(this.getUrl('showDatabaseSelect')))
                .get({ cache: 'no-cache' })
                .then(async (response) => {
                const data = await response.resolve();
                if (data.success === true) {
                    $outputContainer.empty().html(data.html);
                }
            });
        }
        executeDatabaseSelect() {
            let $outputContainer = $__default['default'](this.selectorDatabaseSelectOutput);
            let postData = {
                'install[action]': 'executeDatabaseSelect',
                'install[token]': $__default['default'](this.selectorModuleContent).data('installer-database-select-execute-token'),
            };
            $__default['default']($__default['default'](this.selectorBody + ' form').serializeArray()).each((index, element) => {
                postData[element.name] = element.value;
            });
            (new AjaxRequest(this.getUrl()))
                .post(postData)
                .then(async (response) => {
                const data = await response.resolve();
                if (data.success === true) {
                    this.checkDatabaseRequirements();
                }
                else {
                    if (Array.isArray(data.status)) {
                        data.status.forEach((element) => {
                            let message = InfoBox.render(element.severity, element.title, element.message);
                            $outputContainer.empty().append(message);
                        });
                    }
                }
            });
        }
        checkDatabaseRequirements() {
            let $outputContainer = $__default['default'](this.selectorDatabaseSelectOutput);
            let postData = {
                'install[action]': 'checkDatabaseRequirements',
                'install[token]': $__default['default'](this.selectorModuleContent).data('installer-database-check-requirements-execute-token'),
            };
            $__default['default']($__default['default'](this.selectorBody + ' form').serializeArray()).each((index, element) => {
                postData[element.name] = element.value;
            });
            (new AjaxRequest(this.getUrl()))
                .post(postData)
                .then(async (response) => {
                const data = await response.resolve();
                if (data.success === true) {
                    this.checkDatabaseData();
                }
                else {
                    if (Array.isArray(data.status)) {
                        $outputContainer.empty();
                        data.status.forEach((element) => {
                            let message = InfoBox.render(element.severity, element.title, element.message);
                            $outputContainer.append(message);
                        });
                    }
                }
            });
        }
        checkDatabaseData() {
            this.setProgress(4);
            (new AjaxRequest(this.getUrl('checkDatabaseData')))
                .get({ cache: 'no-cache' })
                .then(async (response) => {
                const data = await response.resolve();
                if (data.success === true) {
                    this.showDefaultConfiguration();
                }
                else {
                    this.showDatabaseData();
                }
            });
        }
        showDatabaseData() {
            let $outputContainer = $__default['default'](this.selectorMainContent);
            (new AjaxRequest(this.getUrl('showDatabaseData')))
                .get({ cache: 'no-cache' })
                .then(async (response) => {
                const data = await response.resolve();
                if (data.success === true) {
                    $outputContainer.empty().html(data.html);
                }
            });
        }
        executeDatabaseData() {
            let $outputContainer = $__default['default'](this.selectorDatabaseDataOutput);
            let postData = {
                'install[action]': 'executeDatabaseData',
                'install[token]': $__default['default'](this.selectorModuleContent).data('installer-database-data-execute-token'),
            };
            $__default['default']($__default['default'](this.selectorBody + ' form').serializeArray()).each((index, element) => {
                postData[element.name] = element.value;
            });
            let message = ProgressBar.render(Severity.loading, 'Loading...', '');
            $outputContainer.empty().html(message);
            (new AjaxRequest(this.getUrl()))
                .post(postData)
                .then(async (response) => {
                const data = await response.resolve();
                if (data.success === true) {
                    this.showDefaultConfiguration();
                }
                else {
                    if (Array.isArray(data.status)) {
                        data.status.forEach((element) => {
                            let m = InfoBox.render(element.severity, element.title, element.message);
                            $outputContainer.empty().append(m);
                        });
                    }
                }
            });
        }
        showDefaultConfiguration() {
            let $outputContainer = $__default['default'](this.selectorMainContent);
            this.setProgress(5);
            (new AjaxRequest(this.getUrl('showDefaultConfiguration')))
                .get({ cache: 'no-cache' })
                .then(async (response) => {
                const data = await response.resolve();
                if (data.success === true) {
                    $outputContainer.empty().html(data.html);
                }
            });
        }
        executeDefaultConfiguration() {
            let postData = {
                'install[action]': 'executeDefaultConfiguration',
                'install[token]': $__default['default'](this.selectorModuleContent).data('installer-default-configuration-execute-token'),
            };
            $__default['default']($__default['default'](this.selectorBody + ' form').serializeArray()).each((index, element) => {
                postData[element.name] = element.value;
            });
            (new AjaxRequest(this.getUrl()))
                .post(postData)
                .then(async (response) => {
                const data = await response.resolve();
                top.location.href = data.redirect;
            });
        }
    }
    new Installer();

});
