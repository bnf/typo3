import { SeverityEnum } from '../../../../backend/Resources/Public/JavaScript/Enum/Severity.esm.js';
import jQuery from '../../../../core/Resources/Public/JavaScript/Contrib/jquery/jquery.esm.js';
import SecurityUtility from '../../../../core/Resources/Public/JavaScript/SecurityUtility.esm.js';
import Modal from '../../../../backend/Resources/Public/JavaScript/Modal.esm.js';
import RegularEvent from '../../../../core/Resources/Public/JavaScript/Event/RegularEvent.esm.js';
import Utility from '../../../../backend/Resources/Public/JavaScript/Utility.esm.js';
import windowManager from '../../../../backend/Resources/Public/JavaScript/WindowManager.esm.js';
import Persistent from '../../../../backend/Resources/Public/JavaScript/Storage/Persistent.esm.js';
import tooltipObject from '../../../../backend/Resources/Public/JavaScript/Tooltip.esm.js';
import '../../../../backend/Resources/Public/JavaScript/Input/Clearable.esm.js';
import Wizard from '../../../../backend/Resources/Public/JavaScript/Wizard.esm.js';
import Workspaces from './Workspaces.esm.js';

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
var Identifiers;
(function (Identifiers) {
    Identifiers["searchForm"] = "#workspace-settings-form";
    Identifiers["searchTextField"] = "#workspace-settings-form input[name=\"search-text\"]";
    Identifiers["searchSubmitBtn"] = "#workspace-settings-form button[type=\"submit\"]";
    Identifiers["depthSelector"] = "#workspace-settings-form [name=\"depth\"]";
    Identifiers["languageSelector"] = "#workspace-settings-form select[name=\"languages\"]";
    Identifiers["workspaceActions"] = ".workspace-actions";
    Identifiers["chooseStageAction"] = ".workspace-actions [name=\"stage-action\"]";
    Identifiers["chooseSelectionAction"] = ".workspace-actions [name=\"selection-action\"]";
    Identifiers["chooseMassAction"] = ".workspace-actions [name=\"mass-action\"]";
    Identifiers["container"] = "#workspace-panel";
    Identifiers["contentsContainer"] = "#workspace-contents";
    Identifiers["noContentsContainer"] = "#workspace-contents-empty";
    Identifiers["actionIcons"] = "#workspace-action-icons";
    Identifiers["previewLinksButton"] = ".t3js-preview-link";
    Identifiers["pagination"] = "#workspace-pagination";
})(Identifiers || (Identifiers = {}));
/**
 * Backend workspace module. Loaded only in Backend context, not in
 * workspace preview. Contains all JavaScript of the main BE module.
 */
class Backend extends Workspaces {
    constructor() {
        super();
        this.elements = {};
        this.settings = {
            dir: 'ASC',
            id: TYPO3.settings.Workspaces.id,
            depth: 1,
            language: 'all',
            limit: 30,
            query: '',
            sort: 'label_Live',
            start: 0,
            filterTxt: '',
        };
        this.paging = {
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
        };
        this.latestPath = '';
        this.markedRecordsForMassAction = [];
        this.indentationPadding = 26;
        this.handleCheckboxStateChanged = (e) => {
            const $checkbox = jQuery(e.target);
            const $tr = $checkbox.parents('tr');
            const table = $tr.data('table');
            const uid = $tr.data('uid');
            const t3ver_oid = $tr.data('t3ver_oid');
            const record = table + ':' + uid + ':' + t3ver_oid;
            if ($checkbox.prop('checked')) {
                this.markedRecordsForMassAction.push(record);
            }
            else {
                const index = this.markedRecordsForMassAction.indexOf(record);
                if (index > -1) {
                    this.markedRecordsForMassAction.splice(index, 1);
                }
            }
            this.elements.$chooseMassAction.prop('disabled', this.markedRecordsForMassAction.length > 0);
        };
        /**
         * View changes of a record
         *
         * @param {Event} e
         */
        this.viewChanges = (e) => {
            e.preventDefault();
            const $tr = jQuery(e.currentTarget).closest('tr');
            this.sendRemoteRequest(this.generateRemotePayload('getRowDetails', {
                stage: $tr.data('stage'),
                t3ver_oid: $tr.data('t3ver_oid'),
                table: $tr.data('table'),
                uid: $tr.data('uid'),
                filterFields: true
            })).then(async (response) => {
                const item = (await response.resolve())[0].result.data[0];
                const $content = jQuery('<div />');
                const $tabsNav = jQuery('<ul />', { class: 'nav nav-tabs', role: 'tablist' });
                const $tabsContent = jQuery('<div />', { class: 'tab-content' });
                const modalButtons = [];
                $content.append(jQuery('<p />').html(TYPO3.lang.path.replace('{0}', item.path_Live)), jQuery('<p />').html(TYPO3.lang.current_step.replace('{0}', item.label_Stage)
                    .replace('{1}', item.stage_position)
                    .replace('{2}', item.stage_count)));
                if (item.diff.length > 0) {
                    $tabsNav.append(jQuery('<li />', { role: 'presentation', class: 'nav-item' }).append(jQuery('<a />', {
                        class: 'nav-link',
                        href: '#workspace-changes',
                        'aria-controls': 'workspace-changes',
                        role: 'tab',
                        'data-bs-toggle': 'tab',
                    }).text(TYPO3.lang['window.recordChanges.tabs.changeSummary'])));
                    $tabsContent.append(jQuery('<div />', { role: 'tabpanel', class: 'tab-pane', id: 'workspace-changes' }).append(jQuery('<div />', { class: 'form-section' }).append(Backend.generateDiffView(item.diff))));
                }
                if (item.comments.length > 0) {
                    $tabsNav.append(jQuery('<li />', { role: 'presentation', class: 'nav-item' }).append(jQuery('<a />', {
                        class: 'nav-link',
                        href: '#workspace-comments',
                        'aria-controls': 'workspace-comments',
                        role: 'tab',
                        'data-bs-toggle': 'tab',
                    }).html(TYPO3.lang['window.recordChanges.tabs.comments'] + '&nbsp;').append(jQuery('<span />', { class: 'badge' }).text(item.comments.length))));
                    $tabsContent.append(jQuery('<div />', { role: 'tabpanel', class: 'tab-pane', id: 'workspace-comments' }).append(jQuery('<div />', { class: 'form-section' }).append(Backend.generateCommentView(item.comments))));
                }
                if (item.history.total > 0) {
                    $tabsNav.append(jQuery('<li />', { role: 'presentation', class: 'nav-item' }).append(jQuery('<a />', {
                        class: 'nav-link',
                        href: '#workspace-history',
                        'aria-controls': 'workspace-history',
                        role: 'tab',
                        'data-bs-toggle': 'tab',
                    }).text(TYPO3.lang['window.recordChanges.tabs.history'])));
                    $tabsContent.append(jQuery('<div />', { role: 'tabpanel', class: 'tab-pane', id: 'workspace-history' }).append(jQuery('<div />', { class: 'form-section' }).append(Backend.generateHistoryView(item.history.data))));
                }
                // Mark the first tab and pane as active
                $tabsNav.find('li > a').first().addClass('active');
                $tabsContent.find('.tab-pane').first().addClass('active');
                // Attach tabs
                $content.append(jQuery('<div />').append($tabsNav, $tabsContent));
                if (item.label_PrevStage !== false && $tr.data('stage') !== $tr.data('prevStage')) {
                    modalButtons.push({
                        text: item.label_PrevStage.title,
                        active: true,
                        btnClass: 'btn-default',
                        name: 'prevstage',
                        trigger: () => {
                            Modal.currentModal.trigger('modal-dismiss');
                            this.sendToStage($tr, 'prev');
                        },
                    });
                }
                if (item.label_NextStage !== false) {
                    modalButtons.push({
                        text: item.label_NextStage.title,
                        active: true,
                        btnClass: 'btn-default',
                        name: 'nextstage',
                        trigger: () => {
                            Modal.currentModal.trigger('modal-dismiss');
                            this.sendToStage($tr, 'next');
                        },
                    });
                }
                modalButtons.push({
                    text: TYPO3.lang.close,
                    active: true,
                    btnClass: 'btn-info',
                    name: 'cancel',
                    trigger: () => {
                        Modal.currentModal.trigger('modal-dismiss');
                    },
                });
                Modal.advanced({
                    type: Modal.types.default,
                    title: TYPO3.lang['window.recordInformation'].replace('{0}', $tr.find('.t3js-title-live').text().trim()),
                    content: $content,
                    severity: SeverityEnum.info,
                    buttons: modalButtons,
                    size: Modal.sizes.medium,
                });
            });
        };
        /**
         * Shows a confirmation modal and deletes the selected record from workspace.
         *
         * @param {Event} e
         */
        this.confirmDeleteRecordFromWorkspace = (e) => {
            const $tr = jQuery(e.target).closest('tr');
            const $modal = Modal.confirm(TYPO3.lang['window.discard.title'], TYPO3.lang['window.discard.message'], SeverityEnum.warning, [
                {
                    text: TYPO3.lang.cancel,
                    active: true,
                    btnClass: 'btn-default',
                    name: 'cancel',
                    trigger: () => {
                        $modal.modal('hide');
                    },
                },
                {
                    text: TYPO3.lang.ok,
                    btnClass: 'btn-warning',
                    name: 'ok',
                },
            ]);
            $modal.on('button.clicked', (modalEvent) => {
                if (modalEvent.target.name === 'ok') {
                    this.sendRemoteRequest([
                        this.generateRemoteActionsPayload('deleteSingleRecord', [
                            $tr.data('table'),
                            $tr.data('uid'),
                        ]),
                    ]).then(() => {
                        $modal.modal('hide');
                        this.getWorkspaceInfos();
                        Backend.refreshPageTree();
                    });
                }
            });
        };
        /**
         * Runs a mass action
         */
        this.runSelectionAction = (e) => {
            const selectedAction = jQuery(e.currentTarget).val();
            const integrityCheckRequired = selectedAction !== 'discard';
            if (selectedAction.length === 0) {
                // Don't do anything if that value is empty
                return;
            }
            const affectedRecords = [];
            for (let i = 0; i < this.markedRecordsForMassAction.length; ++i) {
                const affected = this.markedRecordsForMassAction[i].split(':');
                affectedRecords.push({
                    table: affected[0],
                    liveId: affected[2],
                    versionId: affected[1],
                });
            }
            if (!integrityCheckRequired) {
                Wizard.setForceSelection(false);
                this.renderSelectionActionWizard(selectedAction, affectedRecords);
            }
            else {
                this.checkIntegrity({
                    selection: affectedRecords,
                    type: 'selection',
                }).then(async (response) => {
                    Wizard.setForceSelection(false);
                    if ((await response.resolve())[0].result.result === 'warning') {
                        this.addIntegrityCheckWarningToWizard();
                    }
                    this.renderSelectionActionWizard(selectedAction, affectedRecords);
                });
            }
        };
        /**
         * Adds a slide to the wizard concerning an integrity check warning.
         */
        this.addIntegrityCheckWarningToWizard = () => {
            Wizard.addSlide('integrity-warning', 'Warning', TYPO3.lang['integrity.hasIssuesDescription'] + '<br>' + TYPO3.lang['integrity.hasIssuesQuestion'], SeverityEnum.warning);
        };
        /**
         * Runs a mass action
         */
        this.runMassAction = (e) => {
            const selectedAction = jQuery(e.currentTarget).val();
            const integrityCheckRequired = selectedAction !== 'discard';
            if (selectedAction.length === 0) {
                // Don't do anything if that value is empty
                return;
            }
            if (!integrityCheckRequired) {
                Wizard.setForceSelection(false);
                this.renderMassActionWizard(selectedAction);
            }
            else {
                this.checkIntegrity({
                    language: this.settings.language,
                    type: selectedAction,
                }).then(async (response) => {
                    Wizard.setForceSelection(false);
                    if ((await response.resolve())[0].result.result === 'warning') {
                        this.addIntegrityCheckWarningToWizard();
                    }
                    this.renderMassActionWizard(selectedAction);
                });
            }
        };
        /**
         * Sends marked records to a stage
         *
         * @param {Event} e
         */
        this.sendToSpecificStageAction = (e) => {
            const affectedRecords = [];
            const stage = jQuery(e.currentTarget).val();
            for (let i = 0; i < this.markedRecordsForMassAction.length; ++i) {
                const affected = this.markedRecordsForMassAction[i].split(':');
                affectedRecords.push({
                    table: affected[0],
                    uid: affected[1],
                    t3ver_oid: affected[2],
                });
            }
            this.sendRemoteRequest(this.generateRemoteActionsPayload('sendToSpecificStageWindow', [
                stage, affectedRecords,
            ])).then(async (response) => {
                const $modal = this.renderSendToStageWindow(await response.resolve());
                $modal.on('button.clicked', (modalEvent) => {
                    if (modalEvent.target.name === 'ok') {
                        const serializedForm = Utility.convertFormToObject(modalEvent.currentTarget.querySelector('form'));
                        serializedForm.affects = {
                            elements: affectedRecords,
                            nextStage: stage,
                        };
                        this.sendRemoteRequest([
                            this.generateRemoteActionsPayload('sendToSpecificStageExecute', [serializedForm]),
                            this.generateRemotePayload('getWorkspaceInfos', this.settings),
                        ]).then(async (response) => {
                            const actionResponse = await response.resolve();
                            $modal.modal('hide');
                            this.renderWorkspaceInfos(actionResponse[1].result);
                            Backend.refreshPageTree();
                        });
                    }
                }).on('modal-destroyed', () => {
                    this.elements.$chooseStageAction.val('');
                });
            });
        };
        /**
         * Fetches and renders available preview links
         */
        this.generatePreviewLinks = () => {
            this.sendRemoteRequest(this.generateRemoteActionsPayload('generateWorkspacePreviewLinksForAllLanguages', [
                this.settings.id,
            ])).then(async (response) => {
                const result = (await response.resolve())[0].result;
                const $list = jQuery('<dl />');
                jQuery.each(result, (language, url) => {
                    $list.append(jQuery('<dt />').text(language), jQuery('<dd />').append(jQuery('<a />', { href: url, target: '_blank' }).text(url)));
                });
                Modal.show(TYPO3.lang.previewLink, $list, SeverityEnum.info, [{
                        text: TYPO3.lang.ok,
                        active: true,
                        btnClass: 'btn-info',
                        name: 'ok',
                        trigger: () => {
                            Modal.currentModal.trigger('modal-dismiss');
                        },
                    }], ['modal-inner-scroll']);
            });
        };
        jQuery(() => {
            this.getElements();
            this.registerEvents();
            this.notifyWorkspaceSwitchAction();
            // Set the depth from the main element
            this.settings.depth = this.elements.$depthSelector.val();
            this.settings.language = this.elements.$languageSelector.val();
            // Fetch workspace info (listing) if workspace is accessible
            if (this.elements.$container.length) {
                this.getWorkspaceInfos();
            }
        });
    }
    /**
     * Reloads the page tree
     */
    static refreshPageTree() {
        top.document.dispatchEvent(new CustomEvent('typo3:pagetree:refresh'));
    }
    /**
     * Generates the diff view of a record
     *
     * @param {Object} diff
     * @return {$}
     */
    static generateDiffView(diff) {
        const $diff = jQuery('<div />', { class: 'diff' });
        for (let currentDiff of diff) {
            $diff.append(jQuery('<div />', { class: 'diff-item' }).append(jQuery('<div />', { class: 'diff-item-title' }).text(currentDiff.label), jQuery('<div />', { class: 'diff-item-result diff-item-result-inline' }).html(currentDiff.content)));
        }
        return $diff;
    }
    /**
     * Generates the comments view of a record
     *
     * @param {Object} comments
     * @return {$}
     */
    static generateCommentView(comments) {
        const $comments = jQuery('<div />');
        for (let comment of comments) {
            const $panel = jQuery('<div />', { class: 'panel panel-default' });
            if (comment.user_comment.length > 0) {
                $panel.append(jQuery('<div />', { class: 'panel-body' }).html(comment.user_comment));
            }
            $panel.append(jQuery('<div />', { class: 'panel-footer' }).append(jQuery('<span />', { class: 'label label-success' }).text(comment.stage_title), jQuery('<span />', { class: 'label label-info' }).text(comment.tstamp)));
            $comments.append(jQuery('<div />', { class: 'media' }).append(jQuery('<div />', { class: 'media-left text-center' }).text(comment.user_username).prepend(jQuery('<div />').html(comment.user_avatar)), jQuery('<div />', { class: 'media-body' }).append($panel)));
        }
        return $comments;
    }
    /**
     * Renders the record's history
     *
     * @param {Object} data
     * @return {JQuery}
     */
    static generateHistoryView(data) {
        const $history = jQuery('<div />');
        for (let currentData of data) {
            const $panel = jQuery('<div />', { class: 'panel panel-default' });
            let $diff;
            if (typeof currentData.differences === 'object') {
                if (currentData.differences.length === 0) {
                    // Somehow here are no differences. What a pity, skip that record
                    continue;
                }
                $diff = jQuery('<div />', { class: 'diff' });
                for (let j = 0; j < currentData.differences.length; ++j) {
                    $diff.append(jQuery('<div />', { class: 'diff-item' }).append(jQuery('<div />', { class: 'diff-item-title' }).text(currentData.differences[j].label), jQuery('<div />', { class: 'diff-item-result diff-item-result-inline' }).html(currentData.differences[j].html)));
                }
                $panel.append(jQuery('<div />').append($diff));
            }
            else {
                $panel.append(jQuery('<div />', { class: 'panel-body' }).text(currentData.differences));
            }
            $panel.append(jQuery('<div />', { class: 'panel-footer' }).append(jQuery('<span />', { class: 'label label-info' }).text(currentData.datetime)));
            $history.append(jQuery('<div />', { class: 'media' }).append(jQuery('<div />', { class: 'media-left text-center' }).text(currentData.user).prepend(jQuery('<div />').html(currentData.user_avatar)), jQuery('<div />', { class: 'media-body' }).append($panel)));
        }
        return $history;
    }
    notifyWorkspaceSwitchAction() {
        const mainElement = document.querySelector('main[data-workspace-switch-action]');
        if (mainElement.dataset.workspaceSwitchAction) {
            const workspaceSwitchInformation = JSON.parse(mainElement.dataset.workspaceSwitchAction);
            // we need to do this manually, but this should be done better via proper events
            top.TYPO3.WorkspacesMenu.performWorkspaceSwitch(workspaceSwitchInformation.id, workspaceSwitchInformation.title);
            top.document.dispatchEvent(new CustomEvent('typo3:pagetree:refresh'));
            top.TYPO3.ModuleMenu.App.refreshMenu();
        }
    }
    /**
     * Checks the integrity of a record
     *
     * @param {Array} payload
     * @return {$}
     */
    checkIntegrity(payload) {
        return this.sendRemoteRequest(this.generateRemotePayload('checkIntegrity', payload));
    }
    getElements() {
        this.elements.$searchForm = jQuery(Identifiers.searchForm);
        this.elements.$searchTextField = jQuery(Identifiers.searchTextField);
        this.elements.$searchSubmitBtn = jQuery(Identifiers.searchSubmitBtn);
        this.elements.$depthSelector = jQuery(Identifiers.depthSelector);
        this.elements.$languageSelector = jQuery(Identifiers.languageSelector);
        this.elements.$container = jQuery(Identifiers.container);
        this.elements.$contentsContainer = jQuery(Identifiers.contentsContainer);
        this.elements.$noContentsContainer = jQuery(Identifiers.noContentsContainer);
        this.elements.$tableBody = this.elements.$contentsContainer.find('tbody');
        this.elements.$actionIcons = jQuery(Identifiers.actionIcons);
        this.elements.$workspaceActions = jQuery(Identifiers.workspaceActions);
        this.elements.$chooseStageAction = jQuery(Identifiers.chooseStageAction);
        this.elements.$chooseSelectionAction = jQuery(Identifiers.chooseSelectionAction);
        this.elements.$chooseMassAction = jQuery(Identifiers.chooseMassAction);
        this.elements.$previewLinksButton = jQuery(Identifiers.previewLinksButton);
        this.elements.$pagination = jQuery(Identifiers.pagination);
    }
    registerEvents() {
        jQuery(document).on('click', '[data-action="publish"]', (e) => {
            const row = e.target.closest('tr');
            this.checkIntegrity({
                selection: [
                    {
                        liveId: row.dataset.uid,
                        versionId: row.dataset.t3ver_oid,
                        table: row.dataset.table,
                    },
                ],
                type: 'selection',
            }).then(async (response) => {
                if ((await response.resolve())[0].result.result === 'warning') {
                    this.addIntegrityCheckWarningToWizard();
                }
                Wizard.setForceSelection(false);
                Wizard.addSlide('publish-confirm', 'Publish', TYPO3.lang['window.publish.message'], SeverityEnum.info);
                Wizard.addFinalProcessingSlide(() => {
                    // We passed this slide, publish the record now
                    this.sendRemoteRequest(this.generateRemoteActionsPayload('publishSingleRecord', [
                        row.dataset.table,
                        row.dataset.t3ver_oid,
                        row.dataset.uid,
                    ])).then(() => {
                        Wizard.dismiss();
                        this.getWorkspaceInfos();
                        Backend.refreshPageTree();
                    });
                }).done(() => {
                    Wizard.show();
                });
            });
        }).on('click', '[data-action="prevstage"]', (e) => {
            this.sendToStage(jQuery(e.currentTarget).closest('tr'), 'prev');
        }).on('click', '[data-action="nextstage"]', (e) => {
            this.sendToStage(jQuery(e.currentTarget).closest('tr'), 'next');
        }).on('click', '[data-action="changes"]', this.viewChanges)
            .on('click', '[data-action="preview"]', this.openPreview.bind(this))
            .on('click', '[data-action="open"]', (e) => {
            const row = e.currentTarget.closest('tr');
            let newUrl = TYPO3.settings.FormEngine.moduleUrl
                + '&returnUrl=' + encodeURIComponent(document.location.href)
                + '&id=' + TYPO3.settings.Workspaces.id + '&edit[' + row.dataset.table + '][' + row.dataset.uid + ']=edit';
            window.location.href = newUrl;
        }).on('click', '[data-action="version"]', (e) => {
            const row = e.currentTarget.closest('tr');
            const recordUid = row.dataset.table === 'pages' ? row.dataset.t3ver_oid : row.dataset.pid;
            window.location.href = top.TYPO3.configuration.pageModuleUrl
                + '&id=' + recordUid
                + '&returnUrl=' + encodeURIComponent(window.location.href);
        }).on('click', '[data-action="remove"]', this.confirmDeleteRecordFromWorkspace)
            .on('click', '[data-action="expand"]', (e) => {
            const $me = jQuery(e.currentTarget);
            let iconIdentifier;
            if ($me.first().attr('aria-expanded') === 'true') {
                iconIdentifier = 'apps-pagetree-expand';
            }
            else {
                iconIdentifier = 'apps-pagetree-collapse';
            }
            $me.empty().append(this.getPreRenderedIcon(iconIdentifier));
        });
        jQuery(window.top.document).on('click', '.t3js-workspace-recipients-selectall', () => {
            jQuery('.t3js-workspace-recipient', window.top.document).not(':disabled').prop('checked', true);
        }).on('click', '.t3js-workspace-recipients-deselectall', () => {
            jQuery('.t3js-workspace-recipient', window.top.document).not(':disabled').prop('checked', false);
        });
        this.elements.$searchForm.on('submit', (e) => {
            e.preventDefault();
            this.settings.filterTxt = this.elements.$searchTextField.val();
            this.getWorkspaceInfos();
        });
        this.elements.$searchTextField.on('keyup', (e) => {
            const me = e.target;
            if (me.value !== '') {
                this.elements.$searchSubmitBtn.removeClass('disabled');
            }
            else {
                this.elements.$searchSubmitBtn.addClass('disabled');
                this.getWorkspaceInfos();
            }
        });
        const searchTextField = this.elements.$searchTextField.get(0);
        if (searchTextField !== undefined) {
            searchTextField.clearable({
                onClear: () => {
                    this.elements.$searchSubmitBtn.addClass('disabled');
                    this.settings.filterTxt = '';
                    this.getWorkspaceInfos();
                },
            });
        }
        // checkboxes in the table
        new RegularEvent('checkbox:state:changed', this.handleCheckboxStateChanged).bindTo(document);
        // Listen for depth changes
        this.elements.$depthSelector.on('change', (e) => {
            const depth = e.target.value;
            Persistent.set('moduleData.workspaces.settings.depth', depth);
            this.settings.depth = depth;
            this.getWorkspaceInfos();
        });
        // Generate preview links
        this.elements.$previewLinksButton.on('click', this.generatePreviewLinks);
        // Listen for language changes
        this.elements.$languageSelector.on('change', (e) => {
            const $me = jQuery(e.target);
            Persistent.set('moduleData.workspaces.settings.language', $me.val());
            this.settings.language = $me.val();
            this.sendRemoteRequest(this.generateRemotePayload('getWorkspaceInfos', this.settings)).then(async (response) => {
                const actionResponse = await response.resolve();
                this.elements.$languageSelector.prev().html($me.find(':selected').data('icon'));
                this.renderWorkspaceInfos(actionResponse[0].result);
            });
        });
        // Listen for actions
        this.elements.$chooseStageAction.on('change', this.sendToSpecificStageAction);
        this.elements.$chooseSelectionAction.on('change', this.runSelectionAction);
        this.elements.$chooseMassAction.on('change', this.runMassAction);
        // clicking an action in the paginator
        this.elements.$pagination.on('click', 'a[data-action]', (e) => {
            e.preventDefault();
            const $el = jQuery(e.currentTarget);
            let reload = false;
            switch ($el.data('action')) {
                case 'previous':
                    if (this.paging.currentPage > 1) {
                        this.paging.currentPage--;
                        reload = true;
                    }
                    break;
                case 'next':
                    if (this.paging.currentPage < this.paging.totalPages) {
                        this.paging.currentPage++;
                        reload = true;
                    }
                    break;
                case 'page':
                    this.paging.currentPage = parseInt($el.data('page'), 10);
                    reload = true;
                    break;
                default:
                    throw 'Unknown action "' + $el.data('action') + '"';
            }
            if (reload) {
                // Adjust settings
                this.settings.start = parseInt(this.settings.limit.toString(), 10) * (this.paging.currentPage - 1);
                this.getWorkspaceInfos();
            }
        });
    }
    /**
     * Sends a record to a stage
     *
     * @param {Object} $row
     * @param {String} direction
     */
    sendToStage($row, direction) {
        let nextStage;
        let stageWindowAction;
        let stageExecuteAction;
        if (direction === 'next') {
            nextStage = $row.data('nextStage');
            stageWindowAction = 'sendToNextStageWindow';
            stageExecuteAction = 'sendToNextStageExecute';
        }
        else if (direction === 'prev') {
            nextStage = $row.data('prevStage');
            stageWindowAction = 'sendToPrevStageWindow';
            stageExecuteAction = 'sendToPrevStageExecute';
        }
        else {
            throw 'Invalid direction given.';
        }
        this.sendRemoteRequest(this.generateRemoteActionsPayload(stageWindowAction, [
            $row.data('uid'), $row.data('table'), $row.data('t3ver_oid'),
        ])).then(async (response) => {
            const $modal = this.renderSendToStageWindow(await response.resolve());
            $modal.on('button.clicked', (modalEvent) => {
                if (modalEvent.target.name === 'ok') {
                    const serializedForm = Utility.convertFormToObject(modalEvent.currentTarget.querySelector('form'));
                    serializedForm.affects = {
                        table: $row.data('table'),
                        nextStage: nextStage,
                        t3ver_oid: $row.data('t3ver_oid'),
                        uid: $row.data('uid'),
                        elements: [],
                    };
                    this.sendRemoteRequest([
                        this.generateRemoteActionsPayload(stageExecuteAction, [serializedForm]),
                        this.generateRemotePayload('getWorkspaceInfos', this.settings),
                    ]).then(async (response) => {
                        const requestResponse = await response.resolve();
                        $modal.modal('hide');
                        this.renderWorkspaceInfos(requestResponse[1].result);
                        Backend.refreshPageTree();
                    });
                }
            });
        });
    }
    /**
     * Gets the workspace infos (= filling the contents).
     *
     * @return {Promise}
     * @protected
     */
    getWorkspaceInfos() {
        this.sendRemoteRequest(this.generateRemotePayload('getWorkspaceInfos', this.settings)).then(async (response) => {
            this.renderWorkspaceInfos((await response.resolve())[0].result);
        });
    }
    /**
     * Renders fetched workspace information
     *
     * @param {Object} result
     */
    renderWorkspaceInfos(result) {
        this.elements.$tableBody.children().remove();
        this.resetMassActionState(result.data.length);
        this.buildPagination(result.total);
        // disable the contents area
        if (result.total === 0) {
            this.elements.$contentsContainer.hide();
            this.elements.$noContentsContainer.show();
        }
        else {
            this.elements.$contentsContainer.show();
            this.elements.$noContentsContainer.hide();
        }
        for (let i = 0; i < result.data.length; ++i) {
            const item = result.data[i];
            const $actions = jQuery('<div />', { class: 'btn-group' });
            let $integrityIcon;
            let hasSubitems = item.Workspaces_CollectionChildren > 0 && item.Workspaces_CollectionCurrent !== '';
            $actions.append(this.getAction(hasSubitems, 'expand', (item.expanded ? 'apps-pagetree-expand' : 'apps-pagetree-collapse')).attr('title', TYPO3.lang['tooltip.expand'])
                .attr('data-bs-target', '[data-collection="' + item.Workspaces_CollectionCurrent + '"]')
                .attr('aria-expanded', !hasSubitems || item.expanded ? 'true' : 'false')
                .attr('data-bs-toggle', 'collapse'), this.getAction(item.hasChanges, 'changes', 'actions-document-info')
                .attr('title', TYPO3.lang['tooltip.showChanges']), this.getAction(item.allowedAction_publish && item.Workspaces_CollectionParent === '', 'publish', 'actions-version-swap-version')
                .attr('title', TYPO3.lang['tooltip.publish']), this.getAction(item.allowedAction_view, 'preview', 'actions-version-workspace-preview').attr('title', TYPO3.lang['tooltip.viewElementAction']), this.getAction(item.allowedAction_edit, 'open', 'actions-open').attr('title', TYPO3.lang['tooltip.editElementAction']), this.getAction(true, 'version', 'actions-version-page-open').attr('title', TYPO3.lang['tooltip.openPage']), this.getAction(item.allowedAction_delete, 'remove', 'actions-version-document-remove').attr('title', TYPO3.lang['tooltip.discardVersion']));
            if (item.integrity.messages !== '') {
                $integrityIcon = jQuery(TYPO3.settings.Workspaces.icons[item.integrity.status]);
                $integrityIcon
                    .attr('data-bs-toggle', 'tooltip')
                    .attr('data-bs-placement', 'top')
                    .attr('data-bs-html', 'true')
                    .attr('title', item.integrity.messages);
            }
            if (this.latestPath !== item.path_Workspace) {
                this.latestPath = item.path_Workspace;
                this.elements.$tableBody.append(jQuery('<tr />').append(jQuery('<th />'), jQuery('<th />', { colspan: 6 }).html('<span title="' + item.path_Workspace + '">' + item.path_Workspace_crop + '</span>')));
            }
            const $checkbox = jQuery('<span />', { class: 'form-check form-toggle' }).append(jQuery('<input />', { type: 'checkbox', class: 'form-check-input t3js-multi-record-selection-check' }));
            const rowConfiguration = {
                'data-uid': item.uid,
                'data-pid': item.livepid,
                'data-t3ver_oid': item.t3ver_oid,
                'data-t3ver_wsid': item.t3ver_wsid,
                'data-table': item.table,
                'data-next-stage': item.value_nextStage,
                'data-prev-stage': item.value_prevStage,
                'data-stage': item.stage,
            };
            if (item.Workspaces_CollectionParent !== '') {
                // fetch parent and see if this one is expanded
                let parentItem = result.data.find((element) => {
                    return element.Workspaces_CollectionCurrent === item.Workspaces_CollectionParent;
                });
                rowConfiguration['data-collection'] = item.Workspaces_CollectionParent;
                rowConfiguration.class = 'collapse' + (parentItem.expanded ? ' show' : '');
            }
            this.elements.$tableBody.append(jQuery('<tr />', rowConfiguration).append(jQuery('<td />').empty().append($checkbox), jQuery('<td />', {
                class: 't3js-title-workspace',
                style: item.Workspaces_CollectionLevel > 0
                    ? 'padding-left: ' + this.indentationPadding * item.Workspaces_CollectionLevel + 'px'
                    : '',
            }).html(item.icon_Workspace + '&nbsp;'
                + '<a href="#" data-action="changes">'
                + '<span class="workspace-state-' + item.state_Workspace + '" title="' + item.label_Workspace + '">' + item.label_Workspace_crop + '</span>'
                + '</a>'), jQuery('<td />', { class: 't3js-title-live' }).html(item.icon_Live
                + '&nbsp;'
                + '<span class"workspace-live-title title="' + item.label_Live + '">' + item.label_Live_crop + '</span>'), jQuery('<td />').text(item.label_Stage), jQuery('<td />').empty().append($integrityIcon), jQuery('<td />').html(item.language.icon), jQuery('<td />', { class: 'text-right nowrap' }).append($actions)));
            tooltipObject.initialize('[data-bs-toggle="tooltip"]', {
                delay: {
                    show: 500,
                    hide: 100,
                },
                trigger: 'hover',
                container: 'body',
            });
        }
    }
    /**
     * Renders the pagination
     *
     * @param {Number} totalItems
     */
    buildPagination(totalItems) {
        if (totalItems === 0) {
            this.elements.$pagination.contents().remove();
            return;
        }
        this.paging.totalItems = totalItems;
        this.paging.totalPages = Math.ceil(totalItems / parseInt(this.settings.limit.toString(), 10));
        if (this.paging.totalPages === 1) {
            // early abort if only one page is available
            this.elements.$pagination.contents().remove();
            return;
        }
        const $ul = jQuery('<ul />', { class: 'pagination' });
        const liElements = [];
        const $controlFirstPage = jQuery('<li />', { class: 'page-item' }).append(jQuery('<a />', { class: 'page-link', 'data-action': 'previous' }).append(jQuery('<span />', { class: 't3-icon fa fa-arrow-left' }))), $controlLastPage = jQuery('<li />', { class: 'page-item' }).append(jQuery('<a />', { class: 'page-link', 'data-action': 'next' }).append(jQuery('<span />', { class: 't3-icon fa fa-arrow-right' })));
        if (this.paging.currentPage === 1) {
            $controlFirstPage.disablePagingAction();
        }
        if (this.paging.currentPage === this.paging.totalPages) {
            $controlLastPage.disablePagingAction();
        }
        for (let i = 1; i <= this.paging.totalPages; i++) {
            const $li = jQuery('<li />', { class: 'page-item' + (this.paging.currentPage === i ? ' active' : '') });
            $li.append(jQuery('<a />', { class: 'page-link', 'data-action': 'page', 'data-page': i }).append(jQuery('<span />').text(i)));
            liElements.push($li);
        }
        $ul.append($controlFirstPage, liElements, $controlLastPage);
        this.elements.$pagination.empty().append($ul);
    }
    /**
     * Opens a record in a preview window
     *
     * @param {JQueryEventObject} evt
     */
    openPreview(evt) {
        const $tr = jQuery(evt.currentTarget).closest('tr');
        this.sendRemoteRequest(this.generateRemoteActionsPayload('viewSingleRecord', [
            $tr.data('table'), $tr.data('uid'),
        ])).then(async (response) => {
            const previewUri = (await response.resolve())[0].result;
            windowManager.localOpen(previewUri);
        });
    }
    /**
     * Renders the wizard for selection actions
     *
     * @param {String} selectedAction
     * @param {Array<object>} affectedRecords
     */
    renderSelectionActionWizard(selectedAction, affectedRecords) {
        Wizard.addSlide('mass-action-confirmation', TYPO3.lang['window.selectionAction.title'], '<p>'
            + new SecurityUtility().encodeHtml(TYPO3.lang['tooltip.' + selectedAction + 'Selected'])
            + '</p>', SeverityEnum.warning);
        Wizard.addFinalProcessingSlide(() => {
            this.sendRemoteRequest(this.generateRemoteActionsPayload('executeSelectionAction', {
                action: selectedAction,
                selection: affectedRecords,
            })).then(() => {
                this.markedRecordsForMassAction = [];
                this.getWorkspaceInfos();
                Wizard.dismiss();
                Backend.refreshPageTree();
            });
        }).done(() => {
            Wizard.show();
            Wizard.getComponent().on('wizard-dismissed', () => {
                this.elements.$chooseSelectionAction.val('');
            });
        });
    }
    /**
     * Renders the wizard for mass actions
     *
     * @param {String} selectedAction
     */
    renderMassActionWizard(selectedAction) {
        let massAction;
        switch (selectedAction) {
            case 'publish':
                massAction = 'publishWorkspace';
                break;
            case 'discard':
                massAction = 'flushWorkspace';
                break;
            default:
                throw 'Invalid mass action ' + selectedAction + ' called.';
        }
        const securityUtility = new SecurityUtility();
        Wizard.setForceSelection(false);
        Wizard.addSlide('mass-action-confirmation', TYPO3.lang['window.massAction.title'], '<p>'
            + securityUtility.encodeHtml(TYPO3.lang['tooltip.' + selectedAction + 'All']) + '<br><br>'
            + securityUtility.encodeHtml(TYPO3.lang['tooltip.affectWholeWorkspace'])
            + '</p>', SeverityEnum.warning);
        const sendRequestsUntilAllProcessed = async (response) => {
            const result = (await response.resolve())[0].result;
            // Make sure to process all items
            if (result.processed < result.total) {
                this.sendRemoteRequest(this.generateRemoteMassActionsPayload(massAction, result)).then(sendRequestsUntilAllProcessed);
            }
            else {
                this.getWorkspaceInfos();
                Wizard.dismiss();
            }
        };
        Wizard.addFinalProcessingSlide(() => {
            this.sendRemoteRequest(this.generateRemoteMassActionsPayload(massAction, {
                init: true,
                total: 0,
                processed: 0,
                language: this.settings.language
            })).then(sendRequestsUntilAllProcessed);
        }).done(() => {
            Wizard.show();
            Wizard.getComponent().on('wizard-dismissed', () => {
                this.elements.$chooseMassAction.val('');
            });
        });
    }
    /**
     * Renders the action button based on the user's permission.
     *
     * @param {string} condition
     * @param {string} action
     * @param {string} iconIdentifier
     * @return {JQuery}
     */
    getAction(condition, action, iconIdentifier) {
        if (condition) {
            return jQuery('<button />', {
                class: 'btn btn-default',
                'data-action': action,
                'data-bs-toggle': 'tooltip',
            }).append(this.getPreRenderedIcon(iconIdentifier));
        }
        return jQuery('<span />', { class: 'btn btn-default disabled' }).append(this.getPreRenderedIcon('empty-empty'));
    }
    /**
     * Gets the pre-rendered icon
     * This method is intended to be dropped once we use Fluid's StandaloneView.
     *
     * @param {String} identifier
     * @returns {$}
     */
    getPreRenderedIcon(identifier) {
        return this.elements.$actionIcons.find('[data-identifier="' + identifier + '"]').clone();
    }
    /**
     * This is used to reset the records, internally stored for
     * mass actions. This is needed as those records may no
     * longer be available in the current view and would therefore
     * led to misbehaviour as "unrelated" records get processed.
     *
     * Furthermore, the mass action "bar" is initialized in case the
     * current view contains records. Also a custom event is being
     * dispatched to hide the mass actions, which are only available
     * when at least one record is selected.
     *
     * @param hasRecords Whether the current view contains records
     */
    resetMassActionState(hasRecords) {
        this.markedRecordsForMassAction = [];
        if (hasRecords) {
            this.elements.$workspaceActions.removeClass('hidden');
            this.elements.$chooseMassAction.prop('disabled', false);
        }
        document.dispatchEvent(new Event('multiRecordSelection:actions:hide'));
    }
}
/**
 * Changes the markup of a pagination action being disabled
 */
jQuery.fn.disablePagingAction = function () {
    jQuery(this).addClass('disabled').find('.t3-icon').unwrap().wrap(jQuery('<span />', { class: 'page-link' }));
};
var Backend$1 = new Backend();

export default Backend$1;
