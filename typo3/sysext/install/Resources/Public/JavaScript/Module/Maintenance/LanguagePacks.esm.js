import jQuery from '../../../../../../core/Resources/Public/JavaScript/Contrib/jquery.esm.js';
import AjaxRequest from '../../../../../../core/Resources/Public/JavaScript/Ajax/AjaxRequest.esm.js';
import '../../../../../../core/Resources/Public/JavaScript/Contrib/bootstrap.esm.js';
import SecurityUtility from '../../../../../../core/Resources/Public/JavaScript/SecurityUtility.esm.js';
import { AbstractInteractableModule } from '../AbstractInteractableModule.esm.js';
import Severity from '../../Renderable/Severity.esm.js';
import InfoBox from '../../Renderable/InfoBox.esm.js';
import ProgressBar from '../../Renderable/ProgressBar.esm.js';
import Router from '../../Router.esm.js';
import FlashMessage from '../../Renderable/FlashMessage.esm.js';

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
 * Module: TYPO3/CMS/Install/Module/LanguagePacks
 */
class LanguagePacks extends AbstractInteractableModule {
    constructor() {
        super(...arguments);
        this.selectorOutputContainer = '.t3js-languagePacks-output';
        this.selectorContentContainer = '.t3js-languagePacks-mainContent';
        this.selectorActivateLanguage = '.t3js-languagePacks-activateLanguage';
        this.selectorActivateLanguageIcon = '#t3js-languagePacks-activate-icon';
        this.selectorAddLanguageToggle = '.t3js-languagePacks-addLanguage-toggle';
        this.selectorLanguageInactive = '.t3js-languagePacks-inactive';
        this.selectorDeactivateLanguage = '.t3js-languagePacks-deactivateLanguage';
        this.selectorDeactivateLanguageIcon = '#t3js-languagePacks-deactivate-icon';
        this.selectorUpdate = '.t3js-languagePacks-update';
        this.selectorLanguageUpdateIcon = '#t3js-languagePacks-languageUpdate-icon';
        this.selectorNotifications = '.t3js-languagePacks-notifications';
        this.activeLanguages = [];
        this.activeExtensions = [];
        this.packsUpdateDetails = {
            toHandle: 0,
            handled: 0,
            updated: 0,
            new: 0,
            failed: 0,
        };
        this.notifications = [];
    }
    static pluralize(count, word = 'pack', suffix = 's', additionalCount = 0) {
        return count !== 1 && additionalCount !== 1 ? word + suffix : word;
    }
    initialize(currentModal) {
        this.currentModal = currentModal;
        // Get configuration list on modal open
        this.getData();
        currentModal.on('click', this.selectorAddLanguageToggle, () => {
            currentModal.find(this.selectorContentContainer + ' ' + this.selectorLanguageInactive).toggle();
        });
        currentModal.on('click', this.selectorActivateLanguage, (e) => {
            const iso = jQuery(e.target).closest(this.selectorActivateLanguage).data('iso');
            e.preventDefault();
            this.activateLanguage(iso);
        });
        currentModal.on('click', this.selectorDeactivateLanguage, (e) => {
            const iso = jQuery(e.target).closest(this.selectorDeactivateLanguage).data('iso');
            e.preventDefault();
            this.deactivateLanguage(iso);
        });
        currentModal.on('click', this.selectorUpdate, (e) => {
            const iso = jQuery(e.target).closest(this.selectorUpdate).data('iso');
            const extension = jQuery(e.target).closest(this.selectorUpdate).data('extension');
            e.preventDefault();
            this.updatePacks(iso, extension);
        });
    }
    getData() {
        const modalContent = this.getModalBody();
        (new AjaxRequest(Router.getUrl('languagePacksGetData')))
            .get({ cache: 'no-cache' })
            .then(async (response) => {
            const data = await response.resolve();
            if (data.success === true) {
                this.activeLanguages = data.activeLanguages;
                this.activeExtensions = data.activeExtensions;
                modalContent.empty().append(data.html);
                const contentContainer = modalContent.parent().find(this.selectorContentContainer);
                contentContainer.empty();
                contentContainer.append(this.languageMatrixHtml(data));
                contentContainer.append(this.extensionMatrixHtml(data));
                jQuery('[data-toggle="tooltip"]').tooltip(({ container: contentContainer }));
            }
            else {
                const message = InfoBox.render(Severity.error, 'Something went wrong', '');
                this.addNotification(message);
            }
            this.renderNotifications();
        }, (error) => {
            Router.handleAjaxError(error, modalContent);
        });
    }
    activateLanguage(iso) {
        const modalContent = this.getModalBody();
        const $outputContainer = this.findInModal(this.selectorOutputContainer);
        const message = ProgressBar.render(Severity.loading, 'Loading...', '');
        $outputContainer.empty().append(message);
        this.getNotificationBox().empty();
        (new AjaxRequest(Router.getUrl()))
            .post({
            install: {
                action: 'languagePacksActivateLanguage',
                token: this.getModuleContent().data('language-packs-activate-language-token'),
                iso: iso,
            },
        })
            .then(async (response) => {
            const data = await response.resolve();
            $outputContainer.empty();
            if (data.success === true && Array.isArray(data.status)) {
                data.status.forEach((element) => {
                    const m = InfoBox.render(element.severity, element.title, element.message);
                    this.addNotification(m);
                });
            }
            else {
                const m2 = FlashMessage.render(Severity.error, 'Something went wrong', '');
                this.addNotification(m2);
            }
            this.getData();
        }, (error) => {
            Router.handleAjaxError(error, modalContent);
        });
    }
    deactivateLanguage(iso) {
        const modalContent = this.getModalBody();
        const $outputContainer = this.findInModal(this.selectorOutputContainer);
        const message = ProgressBar.render(Severity.loading, 'Loading...', '');
        $outputContainer.empty().append(message);
        this.getNotificationBox().empty();
        (new AjaxRequest(Router.getUrl()))
            .post({
            install: {
                action: 'languagePacksDeactivateLanguage',
                token: this.getModuleContent().data('language-packs-deactivate-language-token'),
                iso: iso,
            },
        })
            .then(async (response) => {
            const data = await response.resolve();
            $outputContainer.empty();
            if (data.success === true && Array.isArray(data.status)) {
                data.status.forEach((element) => {
                    const m = InfoBox.render(element.severity, element.title, element.message);
                    this.addNotification(m);
                });
            }
            else {
                const m2 = FlashMessage.render(Severity.error, 'Something went wrong', '');
                this.addNotification(m2);
            }
            this.getData();
        }, (error) => {
            Router.handleAjaxError(error, modalContent);
        });
    }
    updatePacks(iso, extension) {
        const $outputContainer = this.findInModal(this.selectorOutputContainer);
        const $contentContainer = this.findInModal(this.selectorContentContainer);
        const isos = iso === undefined ? this.activeLanguages : [iso];
        let updateIsoTimes = true;
        let extensions = this.activeExtensions;
        if (extension !== undefined) {
            extensions = [extension];
            updateIsoTimes = false;
        }
        this.packsUpdateDetails = {
            toHandle: isos.length * extensions.length,
            handled: 0,
            updated: 0,
            new: 0,
            failed: 0,
        };
        $outputContainer.empty().append(jQuery('<div>', { 'class': 'progress' }).append(jQuery('<div>', {
            'class': 'progress-bar progress-bar-info',
            'role': 'progressbar',
            'aria-valuenow': 0,
            'aria-valuemin': 0,
            'aria-valuemax': 100,
            'style': 'width: 0;',
        }).append(jQuery('<span>', { 'class': 'text-nowrap' }).text('0 of ' + this.packsUpdateDetails.toHandle + ' language ' +
            LanguagePacks.pluralize(this.packsUpdateDetails.toHandle) + ' updated'))));
        $contentContainer.empty();
        isos.forEach((isoCode) => {
            extensions.forEach((extensionKey) => {
                this.getNotificationBox().empty();
                (new AjaxRequest(Router.getUrl()))
                    .post({
                    install: {
                        action: 'languagePacksUpdatePack',
                        token: this.getModuleContent().data('language-packs-update-pack-token'),
                        iso: isoCode,
                        extension: extensionKey,
                    },
                })
                    .then(async (response) => {
                    const data = await response.resolve();
                    if (data.success === true) {
                        this.packsUpdateDetails.handled++;
                        if (data.packResult === 'new') {
                            this.packsUpdateDetails.new++;
                        }
                        else if (data.packResult === 'update') {
                            this.packsUpdateDetails.updated++;
                        }
                        else {
                            this.packsUpdateDetails.failed++;
                        }
                        this.packUpdateDone(updateIsoTimes, isos);
                    }
                    else {
                        this.packsUpdateDetails.handled++;
                        this.packsUpdateDetails.failed++;
                        this.packUpdateDone(updateIsoTimes, isos);
                    }
                }, () => {
                    this.packsUpdateDetails.handled++;
                    this.packsUpdateDetails.failed++;
                    this.packUpdateDone(updateIsoTimes, isos);
                });
            });
        });
    }
    packUpdateDone(updateIsoTimes, isos) {
        const modalContent = this.getModalBody();
        const $outputContainer = this.findInModal(this.selectorOutputContainer);
        if (this.packsUpdateDetails.handled === this.packsUpdateDetails.toHandle) {
            // All done - create summary, update 'last update' of iso list, render main view
            const message = InfoBox.render(Severity.ok, 'Language packs updated', this.packsUpdateDetails.new + ' new language ' + LanguagePacks.pluralize(this.packsUpdateDetails.new) + ' downloaded, ' +
                this.packsUpdateDetails.updated + ' language ' + LanguagePacks.pluralize(this.packsUpdateDetails.updated) + ' updated, ' +
                this.packsUpdateDetails.failed + ' language ' + LanguagePacks.pluralize(this.packsUpdateDetails.failed) + ' not available');
            this.addNotification(message);
            if (updateIsoTimes === true) {
                (new AjaxRequest(Router.getUrl()))
                    .post({
                    install: {
                        action: 'languagePacksUpdateIsoTimes',
                        token: this.getModuleContent().data('language-packs-update-iso-times-token'),
                        isos: isos,
                    },
                })
                    .then(async (response) => {
                    const data = await response.resolve();
                    if (data.success === true) {
                        this.getData();
                    }
                    else {
                        const m = FlashMessage.render(Severity.error, 'Something went wrong', '');
                        this.addNotification(m);
                    }
                }, (error) => {
                    Router.handleAjaxError(error, modalContent);
                });
            }
            else {
                this.getData();
            }
        }
        else {
            // Update progress bar
            const percent = (this.packsUpdateDetails.handled / this.packsUpdateDetails.toHandle) * 100;
            $outputContainer.find('.progress-bar')
                .css('width', percent + '%')
                .attr('aria-valuenow', percent)
                .find('span')
                .text(this.packsUpdateDetails.handled + ' of ' + this.packsUpdateDetails.toHandle + ' language ' +
                LanguagePacks.pluralize(this.packsUpdateDetails.handled, 'pack', 's', this.packsUpdateDetails.toHandle) + ' updated');
        }
    }
    languageMatrixHtml(data) {
        const activateIcon = this.findInModal(this.selectorActivateLanguageIcon).html();
        const deactivateIcon = this.findInModal(this.selectorDeactivateLanguageIcon).html();
        const updateIcon = this.findInModal(this.selectorLanguageUpdateIcon).html();
        const $markupContainer = jQuery('<div>');
        const $tbody = jQuery('<tbody>');
        data.languages.forEach((language) => {
            const active = language.active;
            const $tr = jQuery('<tr>');
            if (active) {
                $tbody.append($tr.append(jQuery('<td>').text(' ' + language.name).prepend(jQuery('<div />', { class: 'btn-group' }).append(jQuery('<a>', {
                    'class': 'btn btn-default t3js-languagePacks-deactivateLanguage',
                    'data-iso': language.iso,
                    'data-toggle': 'tooltip',
                    'title': 'Deactivate',
                }).append(deactivateIcon), jQuery('<a>', {
                    'class': 'btn btn-default t3js-languagePacks-update',
                    'data-iso': language.iso,
                    'data-toggle': 'tooltip',
                    'title': 'Download language packs',
                }).append(updateIcon)))));
            }
            else {
                $tbody.append($tr.addClass('t3-languagePacks-inactive t3js-languagePacks-inactive').css({ 'display': 'none' }).append(jQuery('<td>').text(' ' + language.name).prepend(jQuery('<div />', { class: 'btn-group' }).append(jQuery('<a>', {
                    'class': 'btn btn-default t3js-languagePacks-activateLanguage',
                    'data-iso': language.iso,
                    'data-toggle': 'tooltip',
                    'title': 'Activate',
                }).append(activateIcon)))));
            }
            $tr.append(jQuery('<td>').text(language.iso), jQuery('<td>').text(language.dependencies.join(', ')), jQuery('<td>').text(language.lastUpdate === null ? '' : language.lastUpdate));
            $tbody.append($tr);
        });
        $markupContainer.append(jQuery('<h3>').text('Active languages'), jQuery('<table>', { 'class': 'table table-striped table-bordered' }).append(jQuery('<thead>').append(jQuery('<tr>').append(jQuery('<th>').append(jQuery('<div />', { class: 'btn-group' }).append(jQuery('<button>', {
            'class': 'btn btn-default t3js-languagePacks-addLanguage-toggle',
            'type': 'button'
        }).append(jQuery('<span>').append(activateIcon), ' Add language'), jQuery('<button>', { 'class': 'btn btn-default disabled update-all t3js-languagePacks-update', 'type': 'button', 'disabled': 'disabled' }).append(jQuery('<span>').append(updateIcon), ' Update all'))), jQuery('<th>').text('Locale'), jQuery('<th>').text('Dependencies'), jQuery('<th>').text('Last update'))), $tbody));
        if (Array.isArray(this.activeLanguages) && this.activeLanguages.length) {
            $markupContainer.find('.update-all').removeClass('disabled').removeAttr('disabled');
        }
        return $markupContainer.html();
    }
    extensionMatrixHtml(data) {
        const securityUtility = new SecurityUtility();
        const updateIcon = this.findInModal(this.selectorLanguageUpdateIcon).html();
        let tooltip = '';
        let extensionTitle;
        let rowCount = 0;
        const $markupContainer = jQuery('<div>');
        const $headerRow = jQuery('<tr>');
        $headerRow.append(jQuery('<th>').text('Extension'), jQuery('<th>').text('Key'));
        data.activeLanguages.forEach((language) => {
            $headerRow.append(jQuery('<th>').append(jQuery('<a>', {
                'class': 'btn btn-default t3js-languagePacks-update',
                'data-iso': language,
                'data-toggle': 'tooltip',
                'title': 'Download and update all language packs',
            }).append(jQuery('<span>').append(updateIcon), ' ' + language)));
        });
        const $tbody = jQuery('<tbody>');
        data.extensions.forEach((extension) => {
            rowCount++;
            if (typeof extension.icon !== 'undefined') {
                extensionTitle = jQuery('<span>').append(jQuery('<img>', {
                    'style': 'max-height: 16px; max-width: 16px;',
                    'src': '../' + extension.icon,
                    'alt': extension.title,
                }), jQuery('<span>').text(' ' + extension.title));
            }
            else {
                extensionTitle = jQuery('<span>').text(extension.title);
            }
            const $tr = jQuery('<tr>');
            $tr.append(jQuery('<td>').html(extensionTitle.html()), jQuery('<td>').text(extension.key));
            extension.packs.forEach((pack) => {
                const $column = jQuery('<td>');
                $tr.append($column);
                if (pack.exists !== true) {
                    if (pack.lastUpdate !== null) {
                        tooltip = 'No language pack available for ' + pack.iso + ' when tried at ' + pack.lastUpdate + '. Click to re-try.';
                    }
                    else {
                        tooltip = 'Language pack not downloaded. Click to download';
                    }
                }
                else {
                    if (pack.lastUpdate === null) {
                        tooltip = 'Downloaded. Click to renew';
                    }
                    else {
                        tooltip = 'Language pack downloaded at ' + pack.lastUpdate + '. Click to renew';
                    }
                }
                $column.append(jQuery('<a>', {
                    'class': 'btn btn-default t3js-languagePacks-update',
                    'data-extension': extension.key,
                    'data-iso': pack.iso,
                    'data-toggle': 'tooltip',
                    'title': securityUtility.encodeHtml(tooltip),
                }).append(updateIcon));
            });
            $tbody.append($tr);
        });
        $markupContainer.append(jQuery('<h3>').text('Translation status'), jQuery('<table>', { 'class': 'table table-striped table-bordered' }).append(jQuery('<thead>').append($headerRow), $tbody));
        if (rowCount === 0) {
            return InfoBox.render(Severity.ok, 'Language packs have been found for every installed extension.', 'To download the latest changes, use the refresh button in the list above.');
        }
        return $markupContainer.html();
    }
    getNotificationBox() {
        return this.findInModal(this.selectorNotifications);
    }
    addNotification(notification) {
        this.notifications.push(notification);
    }
    renderNotifications() {
        const $notificationBox = this.getNotificationBox();
        for (let notification of this.notifications) {
            $notificationBox.append(notification);
        }
        this.notifications = [];
    }
}
var LanguagePacks$1 = new LanguagePacks();

export default LanguagePacks$1;
