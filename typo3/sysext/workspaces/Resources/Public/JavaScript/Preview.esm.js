import { SeverityEnum } from '../../../../backend/Resources/Public/JavaScript/Enum/Severity.esm.js';
import jQuery from '../../../../core/Resources/Public/JavaScript/Contrib/jquery/jquery.esm.js';
import Modal from '../../../../backend/Resources/Public/JavaScript/Modal.esm.js';
import Utility from '../../../../backend/Resources/Public/JavaScript/Utility.esm.js';
import ThrottleEvent from '../../../../core/Resources/Public/JavaScript/Event/ThrottleEvent.esm.js';
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
    Identifiers["topbar"] = "#typo3-topbar";
    Identifiers["workspacePanel"] = ".workspace-panel";
    Identifiers["liveView"] = "#live-view";
    Identifiers["stageSlider"] = "#workspace-stage-slider";
    Identifiers["workspaceView"] = "#workspace-view";
    Identifiers["sendToStageAction"] = "[data-action=\"send-to-stage\"]";
    Identifiers["discardAction"] = "[data-action=\"discard\"]";
    Identifiers["stageButtonsContainer"] = ".t3js-stage-buttons";
    Identifiers["previewModeContainer"] = ".t3js-preview-mode";
    Identifiers["activePreviewMode"] = ".t3js-active-preview-mode";
    Identifiers["workspacePreview"] = ".t3js-workspace-preview";
})(Identifiers || (Identifiers = {}));
class Preview extends Workspaces {
    constructor() {
        super();
        this.currentSlidePosition = 100;
        this.elements = {};
        /**
         * Updates the position of the comparison slider
         *
         * @param {Event} e
         */
        this.updateSlidePosition = (e) => {
            this.currentSlidePosition = parseInt(e.target.value, 10);
            this.resizeViews();
        };
        /**
         * Renders the discard window
         */
        this.renderDiscardWindow = () => {
            const $modal = Modal.confirm(TYPO3.lang['window.discardAll.title'], TYPO3.lang['window.discardAll.message'], SeverityEnum.warning, [
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
            $modal.on('button.clicked', (e) => {
                if (e.target.name === 'ok') {
                    this.sendRemoteRequest([
                        this.generateRemoteActionsPayload('discardStagesFromPage', [TYPO3.settings.Workspaces.id]),
                        this.generateRemoteActionsPayload('updateStageChangeButtons', [TYPO3.settings.Workspaces.id]),
                    ]).then(async (response) => {
                        $modal.modal('hide');
                        this.renderStageButtons((await response.resolve())[1].result);
                        // Reloading live view IFRAME
                        this.elements.$workspaceView.attr('src', this.elements.$workspaceView.attr('src'));
                    });
                }
            });
        };
        /**
         * Renders the "send page to stage" window
         */
        this.renderSendPageToStageWindow = (e) => {
            const me = e.currentTarget;
            const direction = me.dataset.direction;
            let actionName;
            if (direction === 'prev') {
                actionName = 'sendPageToPreviousStage';
            }
            else if (direction === 'next') {
                actionName = 'sendPageToNextStage';
            }
            else {
                throw 'Invalid direction ' + direction + ' requested.';
            }
            this.sendRemoteRequest(this.generateRemoteActionsPayload(actionName, [TYPO3.settings.Workspaces.id])).then(async (response) => {
                const resolvedResponse = await response.resolve();
                const $modal = this.renderSendToStageWindow(resolvedResponse);
                $modal.on('button.clicked', (modalEvent) => {
                    if (modalEvent.target.name === 'ok') {
                        const serializedForm = Utility.convertFormToObject(modalEvent.currentTarget.querySelector('form'));
                        serializedForm.affects = resolvedResponse[0].result.affects;
                        serializedForm.stageId = me.dataset.stageId;
                        this.sendRemoteRequest([
                            this.generateRemoteActionsPayload('sentCollectionToStage', [serializedForm]),
                            this.generateRemoteActionsPayload('updateStageChangeButtons', [TYPO3.settings.Workspaces.id]),
                        ]).then(async (updateResponse) => {
                            $modal.modal('hide');
                            this.renderStageButtons((await updateResponse.resolve())[1].result);
                        });
                    }
                });
            });
        };
        /**
         * Changes the preview mode
         *
         * @param {Event} e
         */
        this.changePreviewMode = (e) => {
            e.preventDefault();
            const $trigger = jQuery(e.currentTarget);
            const currentPreviewMode = this.elements.$activePreviewMode.data('activePreviewMode');
            const newPreviewMode = $trigger.data('previewMode');
            this.elements.$activePreviewMode.text($trigger.text()).data('activePreviewMode', newPreviewMode);
            this.elements.$workspacePreview.parent()
                .removeClass('preview-mode-' + currentPreviewMode)
                .addClass('preview-mode-' + newPreviewMode);
            if (newPreviewMode === 'slider') {
                this.elements.$stageSlider.parent().toggle(true);
                this.resizeViews();
            }
            else {
                this.elements.$stageSlider.parent().toggle(false);
                if (newPreviewMode === 'vbox') {
                    this.elements.$liveView.height('100%');
                }
                else {
                    this.elements.$liveView.height('50%');
                }
            }
        };
        jQuery(() => {
            this.getElements();
            this.resizeViews();
            this.adjustPreviewModeSelectorWidth();
            this.registerEvents();
        });
    }
    /**
     * Calculate the available space based on the viewport height
     *
     * @returns {Number}
     */
    static getAvailableSpace() {
        const $viewportHeight = jQuery(window).height();
        const $topbarHeight = jQuery(Identifiers.topbar).outerHeight();
        return $viewportHeight - $topbarHeight;
    }
    /**
     * Fetches and stores often required elements
     */
    getElements() {
        this.elements.$liveView = jQuery(Identifiers.liveView);
        this.elements.$workspacePanel = jQuery(Identifiers.workspacePanel);
        this.elements.$stageSlider = jQuery(Identifiers.stageSlider);
        this.elements.$workspaceView = jQuery(Identifiers.workspaceView);
        this.elements.$stageButtonsContainer = jQuery(Identifiers.stageButtonsContainer);
        this.elements.$previewModeContainer = jQuery(Identifiers.previewModeContainer);
        this.elements.$activePreviewMode = jQuery(Identifiers.activePreviewMode);
        this.elements.$workspacePreview = jQuery(Identifiers.workspacePreview);
    }
    /**
     * Registers the events
     */
    registerEvents() {
        new ThrottleEvent('resize', () => {
            this.resizeViews();
        }, 50).bindTo(window);
        jQuery(document)
            .on('click', Identifiers.discardAction, this.renderDiscardWindow)
            .on('click', Identifiers.sendToStageAction, this.renderSendPageToStageWindow);
        new ThrottleEvent('input', this.updateSlidePosition, 25).bindTo(document.querySelector(Identifiers.stageSlider));
        this.elements.$previewModeContainer.find('[data-preview-mode]').on('click', this.changePreviewMode);
    }
    /**
     * Renders the staging buttons
     *
     * @param {String} buttons
     */
    renderStageButtons(buttons) {
        this.elements.$stageButtonsContainer.html(buttons);
    }
    /**
     * Resize the views based on the current viewport height and slider position
     */
    resizeViews() {
        const availableSpace = Preview.getAvailableSpace();
        const relativeHeightOfLiveView = (this.currentSlidePosition - 100) * -1;
        const absoluteHeightOfLiveView = Math.round(Math.abs(availableSpace * relativeHeightOfLiveView / 100));
        const outerHeightDifference = this.elements.$liveView.outerHeight() - this.elements.$liveView.height();
        this.elements.$workspacePreview.height(availableSpace);
        if (this.elements.$activePreviewMode.data('activePreviewMode') === 'slider') {
            this.elements.$liveView.height(absoluteHeightOfLiveView - outerHeightDifference);
        }
    }
    /**
     * Adjusts the width of the preview mode selector to avoid jumping around due to different widths of the labels
     */
    adjustPreviewModeSelectorWidth() {
        const $btnGroup = this.elements.$previewModeContainer.find('.btn-group');
        let maximumWidth = 0;
        $btnGroup.addClass('open');
        this.elements.$previewModeContainer.find('li > a > span').each((_, el) => {
            const width = jQuery(el).width();
            if (maximumWidth < width) {
                maximumWidth = width;
            }
        });
        $btnGroup.removeClass('open');
        this.elements.$activePreviewMode.width(maximumWidth);
    }
}
var Preview$1 = new Preview();

export default Preview$1;
