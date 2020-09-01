define(['../../../../backend/Resources/Public/TypeScript/Enum/Severity', 'jquery', '../../../../core/Resources/Public/TypeScript/SecurityUtility', '../../../../backend/Resources/Public/TypeScript/Modal', 'nprogress', '../../../../backend/Resources/Public/TypeScript/Utility', '../../../../backend/Resources/Public/TypeScript/Viewport', '../../../../backend/Resources/Public/TypeScript/Storage/Persistent', '../../../../backend/Resources/Public/TypeScript/Input/Clearable', '../../../../backend/Resources/Public/TypeScript/Wizard', '../../../../backend/Resources/Public/TypeScript/Tooltip', './Workspaces'], function (Severity, $, SecurityUtility, Modal, NProgress, Utility, Viewport, Persistent, Clearable, Wizard, Tooltip, Workspaces) { 'use strict';

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
    var Identifiers;
    (function (Identifiers) {
        Identifiers["searchForm"] = "#workspace-settings-form";
        Identifiers["searchTextField"] = "#workspace-settings-form input[name=\"search-text\"]";
        Identifiers["searchSubmitBtn"] = "#workspace-settings-form button[type=\"submit\"]";
        Identifiers["depthSelector"] = "#workspace-settings-form [name=\"depth\"]";
        Identifiers["languageSelector"] = "#workspace-settings-form select[name=\"languages\"]";
        Identifiers["chooseStageAction"] = "#workspace-actions-form [name=\"stage-action\"]";
        Identifiers["chooseSelectionAction"] = "#workspace-actions-form [name=\"selection-action\"]";
        Identifiers["chooseMassAction"] = "#workspace-actions-form [name=\"mass-action\"]";
        Identifiers["container"] = "#workspace-panel";
        Identifiers["actionIcons"] = "#workspace-action-icons";
        Identifiers["toggleAll"] = ".t3js-toggle-all";
        Identifiers["previewLinksButton"] = ".t3js-preview-link";
        Identifiers["pagination"] = "#workspace-pagination";
    })(Identifiers || (Identifiers = {}));
    class Backend extends Workspaces {
        constructor() {
            super();
            this.elements = {};
            this.settings = {
                dir: 'ASC',
                id: TYPO3.settings.Workspaces.id,
                language: TYPO3.settings.Workspaces.language,
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
            this.allToggled = false;
            this.latestPath = '';
            this.markedRecordsForMassAction = [];
            this.indentationPadding = 26;
            this.handleCheckboxChange = (e) => {
                const $checkbox = $__default['default'](e.currentTarget);
                const $tr = $checkbox.parents('tr');
                const table = $tr.data('table');
                const uid = $tr.data('uid');
                const t3ver_oid = $tr.data('t3ver_oid');
                const record = table + ':' + uid + ':' + t3ver_oid;
                if ($checkbox.prop('checked')) {
                    this.markedRecordsForMassAction.push(record);
                    $tr.addClass('warning');
                }
                else {
                    const index = this.markedRecordsForMassAction.indexOf(record);
                    if (index > -1) {
                        this.markedRecordsForMassAction.splice(index, 1);
                    }
                    $tr.removeClass('warning');
                }
                this.elements.$chooseStageAction.prop('disabled', this.markedRecordsForMassAction.length === 0);
                this.elements.$chooseSelectionAction.prop('disabled', this.markedRecordsForMassAction.length === 0);
                this.elements.$chooseMassAction.prop('disabled', this.markedRecordsForMassAction.length > 0);
            };
            /**
             * View changes of a record
             *
             * @param {Event} e
             */
            this.viewChanges = (e) => {
                e.preventDefault();
                const $tr = $__default['default'](e.currentTarget).closest('tr');
                this.sendRemoteRequest(this.generateRemotePayload('getRowDetails', {
                    stage: $tr.data('stage'),
                    t3ver_oid: $tr.data('t3ver_oid'),
                    table: $tr.data('table'),
                    uid: $tr.data('uid'),
                })).then(async (response) => {
                    const item = (await response.resolve())[0].result.data[0];
                    const $content = $__default['default']('<div />');
                    const $tabsNav = $__default['default']('<ul />', { class: 'nav nav-tabs', role: 'tablist' });
                    const $tabsContent = $__default['default']('<div />', { class: 'tab-content' });
                    const modalButtons = [];
                    $content.append($__default['default']('<p />').html(TYPO3.lang.path.replace('{0}', item.path_Live)), $__default['default']('<p />').html(TYPO3.lang.current_step.replace('{0}', item.label_Stage)
                        .replace('{1}', item.stage_position)
                        .replace('{2}', item.stage_count)));
                    if (item.diff.length > 0) {
                        $tabsNav.append($__default['default']('<li />', { role: 'presentation' }).append($__default['default']('<a />', {
                            href: '#workspace-changes',
                            'aria-controls': 'workspace-changes',
                            role: 'tab',
                            'data-toggle': 'tab',
                        }).text(TYPO3.lang['window.recordChanges.tabs.changeSummary'])));
                        $tabsContent.append($__default['default']('<div />', { role: 'tabpanel', class: 'tab-pane', id: 'workspace-changes' }).append($__default['default']('<div />', { class: 'form-section' }).append(Backend.generateDiffView(item.diff))));
                    }
                    if (item.comments.length > 0) {
                        $tabsNav.append($__default['default']('<li />', { role: 'presentation' }).append($__default['default']('<a />', {
                            href: '#workspace-comments',
                            'aria-controls': 'workspace-comments',
                            role: 'tab',
                            'data-toggle': 'tab',
                        }).html(TYPO3.lang['window.recordChanges.tabs.comments'] + '&nbsp;').append($__default['default']('<span />', { class: 'badge' }).text(item.comments.length))));
                        $tabsContent.append($__default['default']('<div />', { role: 'tabpanel', class: 'tab-pane', id: 'workspace-comments' }).append($__default['default']('<div />', { class: 'form-section' }).append(Backend.generateCommentView(item.comments))));
                    }
                    if (item.history.total > 0) {
                        $tabsNav.append($__default['default']('<li />', { role: 'presentation' }).append($__default['default']('<a />', {
                            href: '#workspace-history',
                            'aria-controls': 'workspace-history',
                            role: 'tab',
                            'data-toggle': 'tab',
                        }).text(TYPO3.lang['window.recordChanges.tabs.history'])));
                        $tabsContent.append($__default['default']('<div />', { role: 'tabpanel', class: 'tab-pane', id: 'workspace-history' }).append($__default['default']('<div />', { class: 'form-section' }).append(Backend.generateHistoryView(item.history.data))));
                    }
                    // Mark the first tab and pane as active
                    $tabsNav.find('li').first().addClass('active');
                    $tabsContent.find('.tab-pane').first().addClass('active');
                    // Attach tabs
                    $content.append($__default['default']('<div />').append($tabsNav, $tabsContent));
                    if ($tr.data('stage') !== $tr.data('prevStage')) {
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
                        severity: Severity.SeverityEnum.info,
                        buttons: modalButtons,
                        size: Modal.sizes.medium,
                    });
                });
            };
            /**
             * Opens a record in a preview window
             *
             * @param {Event} e
             */
            this.openPreview = (e) => {
                const $tr = $__default['default'](e.currentTarget).closest('tr');
                this.sendRemoteRequest(this.generateRemoteActionsPayload('viewSingleRecord', [
                    $tr.data('table'), $tr.data('uid'),
                ])).then(async (response) => {
                    // eslint-disable-next-line no-eval
                    eval((await response.resolve())[0].result);
                });
            };
            /**
             * Shows a confirmation modal and deletes the selected record from workspace.
             *
             * @param {Event} e
             */
            this.confirmDeleteRecordFromWorkspace = (e) => {
                const $tr = $__default['default'](e.target).closest('tr');
                const $modal = Modal.confirm(TYPO3.lang['window.discard.title'], TYPO3.lang['window.discard.message'], Severity.SeverityEnum.warning, [
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
            this.runSelectionAction = () => {
                const selectedAction = this.elements.$chooseSelectionAction.val();
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
                Wizard.addSlide('integrity-warning', 'Warning', TYPO3.lang['integrity.hasIssuesDescription'] + '<br>' + TYPO3.lang['integrity.hasIssuesQuestion'], Severity.SeverityEnum.warning);
            };
            /**
             * Runs a mass action
             */
            this.runMassAction = () => {
                const selectedAction = this.elements.$chooseMassAction.val();
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
                const stage = $__default['default'](e.currentTarget).val();
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
                    const $list = $__default['default']('<dl />');
                    $__default['default'].each(result, (language, url) => {
                        $list.append($__default['default']('<dt />').text(language), $__default['default']('<dd />').append($__default['default']('<a />', { href: url, target: '_blank' }).text(url)));
                    });
                    Modal.show(TYPO3.lang.previewLink, $list, Severity.SeverityEnum.info, [{
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
            $__default['default'](() => {
                let persistedDepth;
                this.getElements();
                this.registerEvents();
                if (Persistent.isset('this.Module.depth')) {
                    persistedDepth = Persistent.get('this.Module.depth');
                    this.elements.$depthSelector.val(persistedDepth);
                    this.settings.depth = persistedDepth;
                }
                else {
                    this.settings.depth = TYPO3.settings.Workspaces.depth;
                }
                this.loadWorkspaceComponents();
            });
        }
        /**
         * Reloads the page tree
         */
        static refreshPageTree() {
            if (Viewport.NavigationContainer && Viewport.NavigationContainer.PageTree) {
                Viewport.NavigationContainer.PageTree.refreshTree();
            }
        }
        /**
         * Generates the diff view of a record
         *
         * @param {Object} diff
         * @return {$}
         */
        static generateDiffView(diff) {
            const $diff = $__default['default']('<div />', { class: 'diff' });
            for (let currentDiff of diff) {
                $diff.append($__default['default']('<div />', { class: 'diff-item' }).append($__default['default']('<div />', { class: 'diff-item-title' }).text(currentDiff.label), $__default['default']('<div />', { class: 'diff-item-result diff-item-result-inline' }).html(currentDiff.content)));
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
            const $comments = $__default['default']('<div />');
            for (let comment of comments) {
                const $panel = $__default['default']('<div />', { class: 'panel panel-default' });
                if (comment.user_comment.length > 0) {
                    $panel.append($__default['default']('<div />', { class: 'panel-body' }).html(comment.user_comment));
                }
                $panel.append($__default['default']('<div />', { class: 'panel-footer' }).append($__default['default']('<span />', { class: 'label label-success' }).text(comment.stage_title), $__default['default']('<span />', { class: 'label label-info' }).text(comment.tstamp)));
                $comments.append($__default['default']('<div />', { class: 'media' }).append($__default['default']('<div />', { class: 'media-left text-center' }).text(comment.user_username).prepend($__default['default']('<div />').html(comment.user_avatar)), $__default['default']('<div />', { class: 'media-body' }).append($panel)));
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
            const $history = $__default['default']('<div />');
            for (let currentData of data) {
                const $panel = $__default['default']('<div />', { class: 'panel panel-default' });
                let $diff;
                if (typeof currentData.differences === 'object') {
                    if (currentData.differences.length === 0) {
                        // Somehow here are no differences. What a pity, skip that record
                        continue;
                    }
                    $diff = $__default['default']('<div />', { class: 'diff' });
                    for (let j = 0; j < currentData.differences.length; ++j) {
                        $diff.append($__default['default']('<div />', { class: 'diff-item' }).append($__default['default']('<div />', { class: 'diff-item-title' }).text(currentData.differences[j].label), $__default['default']('<div />', { class: 'diff-item-result diff-item-result-inline' }).html(currentData.differences[j].html)));
                    }
                    $panel.append($__default['default']('<div />').append($diff));
                }
                else {
                    $panel.append($__default['default']('<div />', { class: 'panel-body' }).text(currentData.differences));
                }
                $panel.append($__default['default']('<div />', { class: 'panel-footer' }).append($__default['default']('<span />', { class: 'label label-info' }).text(currentData.datetime)));
                $history.append($__default['default']('<div />', { class: 'media' }).append($__default['default']('<div />', { class: 'media-left text-center' }).text(currentData.user).prepend($__default['default']('<div />').html(currentData.user_avatar)), $__default['default']('<div />', { class: 'media-body' }).append($panel)));
            }
            return $history;
        }
        getElements() {
            this.elements.$searchForm = $__default['default'](Identifiers.searchForm);
            this.elements.$searchTextField = $__default['default'](Identifiers.searchTextField);
            this.elements.$searchSubmitBtn = $__default['default'](Identifiers.searchSubmitBtn);
            this.elements.$depthSelector = $__default['default'](Identifiers.depthSelector);
            this.elements.$languageSelector = $__default['default'](Identifiers.languageSelector);
            this.elements.$container = $__default['default'](Identifiers.container);
            this.elements.$tableBody = this.elements.$container.find('tbody');
            this.elements.$actionIcons = $__default['default'](Identifiers.actionIcons);
            this.elements.$toggleAll = $__default['default'](Identifiers.toggleAll);
            this.elements.$chooseStageAction = $__default['default'](Identifiers.chooseStageAction);
            this.elements.$chooseSelectionAction = $__default['default'](Identifiers.chooseSelectionAction);
            this.elements.$chooseMassAction = $__default['default'](Identifiers.chooseMassAction);
            this.elements.$previewLinksButton = $__default['default'](Identifiers.previewLinksButton);
            this.elements.$pagination = $__default['default'](Identifiers.pagination);
        }
        registerEvents() {
            $__default['default'](document).on('click', '[data-action="swap"]', (e) => {
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
                    Wizard.addSlide('swap-confirm', 'Swap', TYPO3.lang['window.swap.message'], Severity.SeverityEnum.info);
                    Wizard.addFinalProcessingSlide(() => {
                        // We passed this slide, swap the record now
                        this.sendRemoteRequest(this.generateRemoteActionsPayload('swapSingleRecord', [
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
                this.sendToStage($__default['default'](e.currentTarget).closest('tr'), 'prev');
            }).on('click', '[data-action="nextstage"]', (e) => {
                this.sendToStage($__default['default'](e.currentTarget).closest('tr'), 'next');
            }).on('click', '[data-action="changes"]', this.viewChanges)
                .on('click', '[data-action="preview"]', this.openPreview)
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
                const $me = $__default['default'](e.currentTarget);
                const $target = this.elements.$tableBody.find($me.data('target'));
                let iconIdentifier;
                if ($target.first().attr('aria-expanded') === 'true') {
                    iconIdentifier = 'apps-pagetree-expand';
                }
                else {
                    iconIdentifier = 'apps-pagetree-collapse';
                }
                $me.empty().append(this.getPreRenderedIcon(iconIdentifier));
            });
            $__default['default'](window.top.document).on('click', '.t3js-workspace-recipients-selectall', (e) => {
                e.preventDefault();
                $__default['default']('.t3js-workspace-recipient', window.top.document).not(':disabled').prop('checked', true);
            }).on('click', '.t3js-workspace-recipients-deselectall', (e) => {
                e.preventDefault();
                $__default['default']('.t3js-workspace-recipient', window.top.document).not(':disabled').prop('checked', false);
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
            this.elements.$searchTextField.get(0).clearable({
                onClear: () => {
                    this.elements.$searchSubmitBtn.addClass('disabled');
                    this.settings.filterTxt = '';
                    this.getWorkspaceInfos();
                },
            });
            // checkboxes in the table
            this.elements.$toggleAll.on('click', () => {
                this.allToggled = !this.allToggled;
                this.elements.$tableBody.find('input[type="checkbox"]').prop('checked', this.allToggled).trigger('change');
            });
            this.elements.$tableBody.on('change', 'tr input[type=checkbox]', this.handleCheckboxChange);
            // Listen for depth changes
            this.elements.$depthSelector.on('change', (e) => {
                const depth = e.target.value;
                Persistent.set('this.Module.depth', depth);
                this.settings.depth = depth;
                this.getWorkspaceInfos();
            });
            // Generate preview links
            this.elements.$previewLinksButton.on('click', this.generatePreviewLinks);
            // Listen for language changes
            this.elements.$languageSelector.on('change', (e) => {
                const $me = $__default['default'](e.target);
                this.settings.language = $me.val();
                this.sendRemoteRequest([
                    this.generateRemoteActionsPayload('saveLanguageSelection', [$me.val()]),
                    this.generateRemotePayload('getWorkspaceInfos', this.settings),
                ]).then((response) => {
                    this.elements.$languageSelector.prev().html($me.find(':selected').data('icon'));
                    this.renderWorkspaceInfos(response[1].result);
                });
            });
            // Listen for actions
            this.elements.$chooseStageAction.on('change', this.sendToSpecificStageAction);
            this.elements.$chooseSelectionAction.on('change', this.runSelectionAction);
            this.elements.$chooseMassAction.on('change', this.runMassAction);
            // clicking an action in the paginator
            this.elements.$pagination.on('click', 'a[data-action]', (e) => {
                e.preventDefault();
                const $el = $__default['default'](e.currentTarget);
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
         * Loads the workspace components, like available stage actions and items of the workspace
         */
        loadWorkspaceComponents() {
            this.sendRemoteRequest([
                this.generateRemotePayload('getWorkspaceInfos', this.settings),
                this.generateRemotePayload('getStageActions', {}),
                this.generateRemoteMassActionsPayload('getMassStageActions', {}),
                this.generateRemotePayload('getSystemLanguages', {
                    pageUid: this.elements.$container.data('pageUid'),
                }),
            ]).then(async (response) => {
                const resolvedResponse = await response.resolve();
                this.elements.$depthSelector.prop('disabled', false);
                // Records
                this.renderWorkspaceInfos(resolvedResponse[0].result);
                // Stage actions
                const stageActions = resolvedResponse[1].result.data;
                let i;
                for (i = 0; i < stageActions.length; ++i) {
                    this.elements.$chooseStageAction.append($__default['default']('<option />').val(stageActions[i].uid).text(stageActions[i].title));
                }
                // Mass actions
                const massActions = resolvedResponse[2].result.data;
                for (i = 0; i < massActions.length; ++i) {
                    this.elements.$chooseSelectionAction.append($__default['default']('<option />').val(massActions[i].action).text(massActions[i].title));
                    this.elements.$chooseMassAction.append($__default['default']('<option />').val(massActions[i].action).text(massActions[i].title));
                }
                // Languages
                const languages = resolvedResponse[3].result.data;
                for (i = 0; i < languages.length; ++i) {
                    const $option = $__default['default']('<option />').val(languages[i].uid).text(languages[i].title).data('icon', languages[i].icon);
                    if (String(languages[i].uid) === String(TYPO3.settings.Workspaces.language)) {
                        $option.prop('selected', true);
                        this.elements.$languageSelector.prev().html(languages[i].icon);
                    }
                    this.elements.$languageSelector.append($option);
                }
                this.elements.$languageSelector.prop('disabled', false);
            });
        }
        /**
         * Gets the workspace infos
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
         * Renders fetched workspace informations
         *
         * @param {Object} result
         */
        renderWorkspaceInfos(result) {
            this.elements.$tableBody.children().remove();
            this.allToggled = false;
            this.elements.$chooseStageAction.prop('disabled', true);
            this.elements.$chooseSelectionAction.prop('disabled', true);
            this.elements.$chooseMassAction.prop('disabled', result.data.length === 0);
            this.buildPagination(result.total);
            for (let i = 0; i < result.data.length; ++i) {
                const item = result.data[i];
                const $actions = $__default['default']('<div />', { class: 'btn-group' });
                let $integrityIcon;
                $actions.append(this.getAction(item.Workspaces_CollectionChildren > 0 && item.Workspaces_CollectionCurrent !== '', 'expand', 'apps-pagetree-collapse').attr('title', TYPO3.lang['tooltip.expand'])
                    .attr('data-target', '[data-collection="' + item.Workspaces_CollectionCurrent + '"]')
                    .attr('data-toggle', 'collapse'), $__default['default']('<button />', {
                    class: 'btn btn-default',
                    'data-action': 'changes',
                    'data-toggle': 'tooltip',
                    title: TYPO3.lang['tooltip.showChanges'],
                }).append(this.getPreRenderedIcon('actions-document-info')), this.getAction(item.allowedAction_swap && item.Workspaces_CollectionParent === '', 'swap', 'actions-version-swap-version')
                    .attr('title', TYPO3.lang['tooltip.swap']), this.getAction(item.allowedAction_view, 'preview', 'actions-version-workspace-preview').attr('title', TYPO3.lang['tooltip.viewElementAction']), this.getAction(item.allowedAction_edit, 'open', 'actions-open').attr('title', TYPO3.lang['tooltip.editElementAction']), this.getAction(true, 'version', 'actions-version-page-open').attr('title', TYPO3.lang['tooltip.openPage']), this.getAction(item.allowedAction_delete, 'remove', 'actions-version-document-remove').attr('title', TYPO3.lang['tooltip.discardVersion']));
                if (item.integrity.messages !== '') {
                    $integrityIcon = $__default['default'](TYPO3.settings.Workspaces.icons[item.integrity.status]);
                    $integrityIcon
                        .attr('data-toggle', 'tooltip')
                        .attr('data-placement', 'top')
                        .attr('data-html', 'true')
                        .attr('title', item.integrity.messages);
                }
                if (this.latestPath !== item.path_Workspace) {
                    this.latestPath = item.path_Workspace;
                    this.elements.$tableBody.append($__default['default']('<tr />').append($__default['default']('<th />'), $__default['default']('<th />', { colspan: 6 }).html('<span title="' + item.path_Workspace + '">' + item.path_Workspace_crop + '</span>')));
                }
                const $checkbox = $__default['default']('<label />', { class: 'btn btn-default btn-checkbox' }).append($__default['default']('<input />', { type: 'checkbox' }), $__default['default']('<span />', { class: 't3-icon fa' }));
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
                    rowConfiguration['data-collection'] = item.Workspaces_CollectionParent;
                    rowConfiguration.class = 'collapse';
                }
                this.elements.$tableBody.append($__default['default']('<tr />', rowConfiguration).append($__default['default']('<td />').empty().append($checkbox), $__default['default']('<td />', {
                    class: 't3js-title-workspace',
                    style: item.Workspaces_CollectionLevel > 0
                        ? 'padding-left: ' + this.indentationPadding * item.Workspaces_CollectionLevel + 'px'
                        : '',
                }).html(item.icon_Workspace + '&nbsp;'
                    + '<a href="#" data-action="changes">'
                    + '<span class="workspace-state-' + item.state_Workspace + '" title="' + item.label_Workspace + '">' + item.label_Workspace_crop + '</span>'
                    + '</a>'), $__default['default']('<td />', { class: 't3js-title-live' }).html(item.icon_Live
                    + '&nbsp;'
                    + '<span class"workspace-live-title title="' + item.label_Live + '">' + item.label_Live_crop + '</span>'), $__default['default']('<td />').text(item.label_Stage), $__default['default']('<td />').empty().append($integrityIcon), $__default['default']('<td />').html(item.language.icon), $__default['default']('<td />', { class: 'text-right nowrap' }).append($actions)));
                Tooltip.initialize('[data-toggle="tooltip"]', {
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
            const $ul = $__default['default']('<ul />', { class: 'pagination pagination-block' });
            const liElements = [];
            const $controlFirstPage = $__default['default']('<li />').append($__default['default']('<a />', { 'data-action': 'previous' }).append($__default['default']('<span />', { class: 't3-icon fa fa-arrow-left' }))), $controlLastPage = $__default['default']('<li />').append($__default['default']('<a />', { 'data-action': 'next' }).append($__default['default']('<span />', { class: 't3-icon fa fa-arrow-right' })));
            if (this.paging.currentPage === 1) {
                $controlFirstPage.disablePagingAction();
            }
            if (this.paging.currentPage === this.paging.totalPages) {
                $controlLastPage.disablePagingAction();
            }
            for (let i = 1; i <= this.paging.totalPages; i++) {
                const $li = $__default['default']('<li />', { class: this.paging.currentPage === i ? 'active' : '' });
                $li.append($__default['default']('<a />', { 'data-action': 'page', 'data-page': i }).append($__default['default']('<span />').text(i)));
                liElements.push($li);
            }
            $ul.append($controlFirstPage, liElements, $controlLastPage);
            this.elements.$pagination.empty().append($ul);
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
                + '</p>', Severity.SeverityEnum.warning);
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
            let doSwap = false;
            switch (selectedAction) {
                case 'publish':
                    massAction = 'publishWorkspace';
                    break;
                case 'swap':
                    massAction = 'publishWorkspace';
                    doSwap = true;
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
                + '</p>', Severity.SeverityEnum.warning);
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
                    language: this.settings.language,
                    swap: doSwap,
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
                return $__default['default']('<button />', {
                    class: 'btn btn-default',
                    'data-action': action,
                    'data-toggle': 'tooltip',
                }).append(this.getPreRenderedIcon(iconIdentifier));
            }
            return $__default['default']('<span />', { class: 'btn btn-default disabled' }).append(this.getPreRenderedIcon('empty-empty'));
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
    }
    new Backend();

});
