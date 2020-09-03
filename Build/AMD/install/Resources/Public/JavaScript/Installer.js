define(['../../../../core/Resources/Public/JavaScript/Contrib/jquery', '../../../../core/Resources/Public/JavaScript/Ajax/AjaxRequest', './Renderable/Severity', './Renderable/InfoBox', './Renderable/ProgressBar', './Module/PasswordStrength'], function (jquery, AjaxRequest, Severity, InfoBox, ProgressBar, PasswordStrength) { 'use strict';

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
            jquery(() => {
                this.initialize();
            });
        }
        initializeEvents() {
            jquery(document).on('click', '.t3js-installer-environmentFolders-retry', (e) => {
                e.preventDefault();
                this.showEnvironmentAndFolders();
            });
            jquery(document).on('click', '.t3js-installer-environmentFolders-execute', (e) => {
                e.preventDefault();
                this.executeEnvironmentAndFolders();
            });
            jquery(document).on('click', '.t3js-installer-databaseConnect-execute', (e) => {
                e.preventDefault();
                this.executeDatabaseConnect();
            });
            jquery(document).on('click', '.t3js-installer-databaseSelect-execute', (e) => {
                e.preventDefault();
                this.executeDatabaseSelect();
            });
            jquery(document).on('click', '.t3js-installer-databaseData-execute', (e) => {
                e.preventDefault();
                this.executeDatabaseData();
            });
            jquery(document).on('click', '.t3js-installer-defaultConfiguration-execute', (e) => {
                e.preventDefault();
                this.executeDefaultConfiguration();
            });
            jquery(document).on('keyup', '.t3-install-form-password-strength', () => {
                PasswordStrength.initialize('.t3-install-form-password-strength');
            });
            // Database connect db driver selection
            jquery(document).on('change', '#t3js-connect-database-driver', (e) => {
                let driver = jquery(e.currentTarget).val();
                jquery('.t3-install-driver-data').hide();
                jquery('.t3-install-driver-data input').attr('disabled', 'disabled');
                jquery('#' + driver + ' input').attr('disabled', null);
                jquery('#' + driver).show();
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
            let $progressBar = jquery(this.selectorProgressBar);
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
                jquery(this.selectorBody).empty().append(data.html);
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
            let $outputContainer = jquery(this.selectorMainContent);
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
            let $outputContainer = jquery(this.selectorMainContent);
            (new AjaxRequest(this.getUrl('showEnvironmentAndFolders')))
                .get({ cache: 'no-cache' })
                .then(async (response) => {
                const data = await response.resolve();
                if (data.success === true) {
                    $outputContainer.empty().html(data.html);
                    let $detailContainer = jquery('.t3js-installer-environment-details');
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
                        jquery('.t3js-installer-environmentFolders-bad').show();
                    }
                    else {
                        jquery('.t3js-installer-environmentFolders-good').show();
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
                else {
                    // @todo message output handling
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
            let $outputContainer = jquery(this.selectorMainContent);
            (new AjaxRequest(this.getUrl('showDatabaseConnect')))
                .get({ cache: 'no-cache' })
                .then(async (response) => {
                const data = await response.resolve();
                if (data.success === true) {
                    $outputContainer.empty().html(data.html);
                    jquery('#t3js-connect-database-driver').trigger('change');
                }
            });
        }
        executeDatabaseConnect() {
            let $outputContainer = jquery(this.selectorDatabaseConnectOutput);
            let postData = {
                'install[action]': 'executeDatabaseConnect',
                'install[token]': jquery(this.selectorModuleContent).data('installer-database-connect-execute-token'),
            };
            jquery(jquery(this.selectorBody + ' form').serializeArray()).each((index, element) => {
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
            let $outputContainer = jquery(this.selectorMainContent);
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
            let $outputContainer = jquery(this.selectorDatabaseSelectOutput);
            let postData = {
                'install[action]': 'executeDatabaseSelect',
                'install[token]': jquery(this.selectorModuleContent).data('installer-database-select-execute-token'),
            };
            jquery(jquery(this.selectorBody + ' form').serializeArray()).each((index, element) => {
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
            let $outputContainer = jquery(this.selectorDatabaseSelectOutput);
            let postData = {
                'install[action]': 'checkDatabaseRequirements',
                'install[token]': jquery(this.selectorModuleContent).data('installer-database-check-requirements-execute-token'),
            };
            jquery(jquery(this.selectorBody + ' form').serializeArray()).each((index, element) => {
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
            let $outputContainer = jquery(this.selectorMainContent);
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
            let $outputContainer = jquery(this.selectorDatabaseDataOutput);
            let postData = {
                'install[action]': 'executeDatabaseData',
                'install[token]': jquery(this.selectorModuleContent).data('installer-database-data-execute-token'),
            };
            jquery(jquery(this.selectorBody + ' form').serializeArray()).each((index, element) => {
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
            let $outputContainer = jquery(this.selectorMainContent);
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
                'install[token]': jquery(this.selectorModuleContent).data('installer-default-configuration-execute-token'),
            };
            jquery(jquery(this.selectorBody + ' form').serializeArray()).each((index, element) => {
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
    var Installer$1 = new Installer();

    return Installer$1;

});
