import $ from 'jquery';
import Persistent from '../../../../backend/Resources/Public/JavaScript/Storage/Persistent.mjs';
import 'jquery-ui/resizable';

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
var Selectors;
(function (Selectors) {
    Selectors["resizableContainerIdentifier"] = ".t3js-viewpage-resizeable";
    Selectors["sizeIdentifier"] = ".t3js-viewpage-size";
    Selectors["moduleBodySelector"] = ".t3js-module-body";
    Selectors["customSelector"] = ".t3js-preset-custom";
    Selectors["customWidthSelector"] = ".t3js-preset-custom";
    Selectors["customHeightSelector"] = ".t3js-preset-custom-height";
    Selectors["changeOrientationSelector"] = ".t3js-change-orientation";
    Selectors["changePresetSelector"] = ".t3js-change-preset";
    Selectors["inputWidthSelector"] = ".t3js-viewpage-input-width";
    Selectors["inputHeightSelector"] = ".t3js-viewpage-input-height";
    Selectors["currentLabelSelector"] = ".t3js-viewpage-current-label";
    Selectors["topbarContainerSelector"] = ".t3js-viewpage-topbar";
})(Selectors || (Selectors = {}));
/**
 * Module: TYPO3/CMS/Viewpage/Main
 * Main logic for resizing the view of the frame
 */
class ViewPage {
    constructor() {
        this.defaultLabel = '';
        this.minimalHeight = 300;
        this.minimalWidth = 300;
        this.storagePrefix = 'moduleData.web_view.States.';
        this.queue = [];
        this.queueIsRunning = false;
        $(() => {
            const $presetCustomLabel = $('.t3js-preset-custom-label');
            this.defaultLabel = $presetCustomLabel.length > 0 ? $presetCustomLabel.html().trim() : '';
            this.$iframe = $('#tx_this_iframe');
            this.$resizableContainer = $(Selectors.resizableContainerIdentifier);
            this.$sizeSelector = $(Selectors.sizeIdentifier);
            this.initialize();
        });
    }
    static getCurrentWidth() {
        return $(Selectors.inputWidthSelector).val();
    }
    static getCurrentHeight() {
        return $(Selectors.inputHeightSelector).val();
    }
    static setLabel(label) {
        $(Selectors.currentLabelSelector).html(label);
    }
    static getCurrentLabel() {
        return $(Selectors.currentLabelSelector).html().trim();
    }
    persistQueue() {
        if (this.queueIsRunning === false && this.queue.length >= 1) {
            this.queueIsRunning = true;
            let item = this.queue.shift();
            Persistent.set(item.storageIdentifier, item.data).done(() => {
                this.queueIsRunning = false;
                this.persistQueue();
            });
        }
    }
    addToQueue(storageIdentifier, data) {
        const item = {
            storageIdentifier: storageIdentifier,
            data: data,
        };
        this.queue.push(item);
        if (this.queue.length >= 1) {
            this.persistQueue();
        }
    }
    setSize(width, height) {
        if (isNaN(height)) {
            height = this.calculateContainerMaxHeight();
        }
        if (height < this.minimalHeight) {
            height = this.minimalHeight;
        }
        if (isNaN(width)) {
            width = this.calculateContainerMaxWidth();
        }
        if (width < this.minimalWidth) {
            width = this.minimalWidth;
        }
        $(Selectors.inputWidthSelector).val(width);
        $(Selectors.inputHeightSelector).val(height);
        this.$resizableContainer.css({
            width: width,
            height: height,
            left: 0,
        });
    }
    persistCurrentPreset() {
        let data = {
            width: ViewPage.getCurrentWidth(),
            height: ViewPage.getCurrentHeight(),
            label: ViewPage.getCurrentLabel(),
        };
        this.addToQueue(this.storagePrefix + 'current', data);
    }
    persistCustomPreset() {
        let data = {
            width: ViewPage.getCurrentWidth(),
            height: ViewPage.getCurrentHeight(),
        };
        $(Selectors.customSelector).data('width', data.width);
        $(Selectors.customSelector).data('height', data.height);
        $(Selectors.customWidthSelector).html(data.width);
        $(Selectors.customHeightSelector).html(data.height);
        this.addToQueue(this.storagePrefix + 'custom', data);
    }
    persistCustomPresetAfterChange() {
        clearTimeout(this.queueDelayTimer);
        this.queueDelayTimer = window.setTimeout(() => { this.persistCustomPreset(); }, 1000);
    }
    /**
     * Initialize
     */
    initialize() {
        // Change orientation
        $(document).on('click', Selectors.changeOrientationSelector, () => {
            const width = $(Selectors.inputHeightSelector).val();
            const height = $(Selectors.inputWidthSelector).val();
            this.setSize(width, height);
            this.persistCurrentPreset();
        });
        // On change
        $(document).on('change', Selectors.inputWidthSelector, () => {
            const width = $(Selectors.inputWidthSelector).val();
            const height = $(Selectors.inputHeightSelector).val();
            this.setSize(width, height);
            ViewPage.setLabel(this.defaultLabel);
            this.persistCustomPresetAfterChange();
        });
        $(document).on('change', Selectors.inputHeightSelector, () => {
            const width = $(Selectors.inputWidthSelector).val();
            const height = $(Selectors.inputHeightSelector).val();
            this.setSize(width, height);
            ViewPage.setLabel(this.defaultLabel);
            this.persistCustomPresetAfterChange();
        });
        // Add event to width selector so the container is resized
        $(document).on('click', Selectors.changePresetSelector, (evt) => {
            const data = $(evt.currentTarget).data();
            this.setSize(parseInt(data.width, 10), parseInt(data.height, 10));
            ViewPage.setLabel(data.label);
            this.persistCurrentPreset();
        });
        // Initialize the jQuery UI Resizable plugin
        this.$resizableContainer.resizable({
            handles: 'w, sw, s, se, e',
        });
        this.$resizableContainer.on('resizestart', (evt) => {
            // Add iframe overlay to prevent losing the mouse focus to the iframe while resizing fast
            $(evt.currentTarget)
                .append('<div id="this-iframe-cover" style="z-index:99;position:absolute;width:100%;top:0;left:0;height:100%;"></div>');
        });
        this.$resizableContainer.on('resize', (evt, ui) => {
            ui.size.width = ui.originalSize.width + ((ui.size.width - ui.originalSize.width) * 2);
            if (ui.size.height < this.minimalHeight) {
                ui.size.height = this.minimalHeight;
            }
            if (ui.size.width < this.minimalWidth) {
                ui.size.width = this.minimalWidth;
            }
            $(Selectors.inputWidthSelector).val(ui.size.width);
            $(Selectors.inputHeightSelector).val(ui.size.height);
            this.$resizableContainer.css({
                left: 0,
            });
            ViewPage.setLabel(this.defaultLabel);
        });
        this.$resizableContainer.on('resizestop', () => {
            $('#viewpage-iframe-cover').remove();
            this.persistCurrentPreset();
            this.persistCustomPreset();
        });
    }
    calculateContainerMaxHeight() {
        this.$resizableContainer.hide();
        let $moduleBody = $(Selectors.moduleBodySelector);
        let padding = $moduleBody.outerHeight() - $moduleBody.height(), documentHeight = $(document).height(), topbarHeight = $(Selectors.topbarContainerSelector).outerHeight();
        this.$resizableContainer.show();
        return documentHeight - padding - topbarHeight - 8;
    }
    calculateContainerMaxWidth() {
        this.$resizableContainer.hide();
        let $moduleBody = $(Selectors.moduleBodySelector);
        let padding = $moduleBody.outerWidth() - $moduleBody.width();
        let documentWidth = $(document).width();
        this.$resizableContainer.show();
        return parseInt((documentWidth - padding) + '', 10);
    }
}
var Main = new ViewPage();

export default Main;
