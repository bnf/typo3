import $ from '../../../../core/Resources/Public/JavaScript/Contrib/jquery.esm.js';
import AjaxRequest from '../../../../core/Resources/Public/JavaScript/Ajax/AjaxRequest.esm.js';
import Icons from './Icons.esm.js';
import Modal from './Modal.esm.js';
import FormEngineValidation from './FormEngineValidation.esm.js';
import ThrottleEvent from '../../../../core/Resources/Public/JavaScript/Event/ThrottleEvent.esm.js';
import '../../../../core/Resources/Public/JavaScript/Contrib/jquery-ui/draggable.esm.js';
import '../../../../core/Resources/Public/JavaScript/Contrib/jquery-ui/resizable.esm.js';
import Cropper from '../../../../core/Resources/Public/JavaScript/Contrib/cropperjs.esm.js';
import ImagesLoaded from '../../../../core/Resources/Public/JavaScript/Contrib/imagesloaded.esm.js';

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
 * Module: TYPO3/CMS/Backend/ImageManipulation
 * Contains all logic for the image crop GUI including setting focusAreas
 * @exports TYPO3/CMS/Backend/ImageManipulation
 */
class ImageManipulation {
    constructor() {
        this.initialized = false;
        this.cropImageContainerSelector = '#t3js-crop-image-container';
        this.cropImageSelector = '#t3js-crop-image';
        this.coverAreaSelector = '.t3js-cropper-cover-area';
        this.cropInfoSelector = '.t3js-cropper-info-crop';
        this.focusAreaSelector = '#t3js-cropper-focus-area';
        this.defaultFocusArea = {
            height: 1 / 3,
            width: 1 / 3,
            x: 0,
            y: 0,
        };
        this.defaultOpts = {
            autoCrop: true,
            autoCropArea: 0.7,
            dragMode: 'crop',
            guides: true,
            responsive: true,
            viewMode: 1,
            zoomable: false,
        };
        this.resizeTimeout = 450;
        /**
         * @method cropBuiltHandler
         * @desc Internal cropper handler. Called when the cropper has been instantiated
         * @private
         */
        this.cropBuiltHandler = () => {
            this.initialized = true;
            const imageData = this.cropper.getImageData();
            const image = this.currentModal.find(this.cropImageSelector);
            // Make the image in the backdrop visible again.
            // TODO: Check why this doesn't happen automatically.
            this.currentModal.find('.cropper-canvas img').removeClass('cropper-hide');
            this.imageOriginalSizeFactor = image.data('originalWidth') / imageData.naturalWidth;
            // iterate over the crop variants and set up their respective preview
            this.cropVariantTriggers.each((index, elem) => {
                const cropVariantId = $(elem).attr('data-crop-variant-id');
                const cropArea = this.convertRelativeToAbsoluteCropArea(this.data[cropVariantId].cropArea, imageData);
                const variant = $.extend(true, {}, this.data[cropVariantId], { cropArea });
                this.updatePreviewThumbnail(variant, $(elem));
            });
            this.currentCropVariant.cropArea = this.convertRelativeToAbsoluteCropArea(this.currentCropVariant.cropArea, imageData);
            // can't use .t3js-* as selector because it is an extraneous selector
            this.cropBox = this.currentModal.find('.cropper-crop-box');
            this.setCropArea(this.currentCropVariant.cropArea);
            // check if new cropVariant has coverAreas
            if (this.currentCropVariant.coverAreas) {
                // init or reinit focusArea
                this.initCoverAreas(this.cropBox, this.currentCropVariant.coverAreas);
            }
            // check if new cropVariant has focusArea
            if (this.currentCropVariant.focusArea) {
                // init or reinit focusArea
                if (ImageManipulation.isEmptyArea(this.currentCropVariant.focusArea)) {
                    // if an empty focusArea is set initialise it with the default
                    this.currentCropVariant.focusArea = $.extend(true, {}, this.defaultFocusArea);
                }
                this.initFocusArea(this.cropBox);
                this.scaleAndMoveFocusArea(this.currentCropVariant.focusArea);
            }
            if (this.currentCropVariant.selectedRatio) {
                // set data explicitly or setAspectRatio up-scales the crop
                this.currentModal.find(`[data-option='${this.currentCropVariant.selectedRatio}']`).addClass('active');
            }
        };
        /**
         * @method cropMoveHandler
         * @desc Internal cropper handler. Called when the cropping area is moving
         * @private
         */
        this.cropMoveHandler = (e) => {
            if (!this.initialized) {
                return;
            }
            this.currentCropVariant.cropArea = $.extend(true, this.currentCropVariant.cropArea, {
                height: Math.floor(e.detail.height),
                width: Math.floor(e.detail.width),
                x: Math.floor(e.detail.x),
                y: Math.floor(e.detail.y),
            });
            this.updatePreviewThumbnail(this.currentCropVariant, this.activeCropVariantTrigger);
            this.updateCropVariantData(this.currentCropVariant);
            const naturalWidth = Math.round(this.currentCropVariant.cropArea.width * this.imageOriginalSizeFactor);
            const naturalHeight = Math.round(this.currentCropVariant.cropArea.height * this.imageOriginalSizeFactor);
            this.cropInfo.text(`${naturalWidth}×${naturalHeight} px`);
        };
        /**
         * @method cropStartHandler
         * @desc Internal cropper handler. Called when the cropping starts moving
         * @private
         */
        this.cropStartHandler = () => {
            if (this.currentCropVariant.focusArea) {
                this.focusArea.draggable('option', 'disabled', true);
                this.focusArea.resizable('option', 'disabled', true);
            }
        };
        /**
         * @method cropEndHandler
         * @desc Internal cropper handler. Called when the cropping ends moving
         * @private
         */
        this.cropEndHandler = () => {
            if (this.currentCropVariant.focusArea) {
                this.focusArea.draggable('option', 'disabled', false);
                this.focusArea.resizable('option', 'disabled', false);
            }
        };
        // silence is golden
        $(window).on('resize', () => {
            if (this.cropper) {
                this.cropper.destroy();
            }
        });
        new ThrottleEvent('resize', () => {
            if (this.cropper) {
                this.init();
            }
        }, this.resizeTimeout).bindTo(window);
    }
    /**
     * @method isCropAreaEmpty
     * @desc Checks if an area is set or pristine
     * @param {Area} area - The area to check
     * @return {boolean}
     * @static
     */
    static isEmptyArea(area) {
        return $.isEmptyObject(area);
    }
    /**
     * @method wait
     * @desc window.setTimeout shim
     * @param {Function} fn - The function to execute
     * @param {number} ms - The time in [ms] to wait until execution
     * @return {boolean}
     * @public
     * @static
     */
    static wait(fn, ms) {
        window.setTimeout(fn, ms);
    }
    /**
     * @method toCssPercent
     * @desc Takes a number, and converts it to CSS percentage length
     * @param {number} num - The number to convert
     * @return {string}
     * @public
     * @static
     */
    static toCssPercent(num) {
        return `${num * 100}%`;
    }
    /**
     * @method serializeCropVariants
     * @desc Serializes crop variants for persistence or preview
     * @param {Object} cropVariants
     * @returns string
     */
    static serializeCropVariants(cropVariants) {
        const omitUnused = (key, value) => {
            return (key === 'id'
                || key === 'title'
                || key === 'allowedAspectRatios'
                || key === 'coverAreas') ? undefined : value;
        };
        return JSON.stringify(cropVariants, omitUnused);
    }
    /**
     * @method initializeTrigger
     * @desc Assign a handler to .t3js-image-manipulation-trigger.
     *       Show the modal and kick-off image manipulation
     * @public
     */
    initializeTrigger() {
        const triggerHandler = (e) => {
            e.preventDefault();
            this.trigger = $(e.currentTarget);
            this.show();
        };
        $('.t3js-image-manipulation-trigger').off('click').on('click', triggerHandler);
    }
    /**
     * @method initializeCropperModal
     * @desc Initialize the cropper modal and dispatch the cropper init
     * @private
     */
    initializeCropperModal() {
        const image = this.currentModal.find(this.cropImageSelector);
        ImagesLoaded(image.get(0), () => {
            this.init();
        });
    }
    /**
     * @method show
     * @desc Load the image and setup the modal UI
     * @private
     */
    show() {
        const modalTitle = this.trigger.data('modalTitle');
        const buttonPreviewText = this.trigger.data('buttonPreviewText');
        const buttonDismissText = this.trigger.data('buttonDismissText');
        const buttonSaveText = this.trigger.data('buttonSaveText');
        const imageUri = this.trigger.data('url');
        const payload = this.trigger.data('payload');
        Icons.getIcon('spinner-circle', Icons.sizes.default, null, null, Icons.markupIdentifiers.inline).then((icon) => {
            /**
             * Open modal with image to crop
             */
            this.currentModal = Modal.advanced({
                additionalCssClasses: ['modal-image-manipulation'],
                buttons: [
                    {
                        btnClass: 'btn-default pull-left',
                        dataAttributes: {
                            method: 'preview',
                        },
                        icon: 'actions-view',
                        text: buttonPreviewText,
                    },
                    {
                        btnClass: 'btn-default',
                        dataAttributes: {
                            method: 'dismiss',
                        },
                        icon: 'actions-close',
                        text: buttonDismissText,
                    },
                    {
                        btnClass: 'btn-primary',
                        dataAttributes: {
                            method: 'save',
                        },
                        icon: 'actions-document-save',
                        text: buttonSaveText,
                    },
                ],
                content: $('<div class="modal-loading">').append(icon),
                size: Modal.sizes.full,
                style: Modal.styles.dark,
                title: modalTitle,
            });
            this.currentModal.on('shown.bs.modal', () => {
                new AjaxRequest(imageUri).post(payload).then(async (response) => {
                    this.currentModal.find('.t3js-modal-body').append(await response.resolve()).addClass('cropper');
                    this.initializeCropperModal();
                });
            });
            this.currentModal.on('hide.bs.modal', () => {
                this.destroy();
            });
            // do not dismiss the modal when clicking beside it to avoid data loss
            this.currentModal.data('bs.modal').options.backdrop = 'static';
        });
    }
    /**
     * @method init
     * @desc Initializes the cropper UI and sets up all the event bindings for the UI
     * @private
     */
    init() {
        const image = this.currentModal.find(this.cropImageSelector);
        const imageHeight = $(image).height();
        const imageWidth = $(image).width();
        const data = this.trigger.attr('data-crop-variants');
        if (!data) {
            throw new TypeError('ImageManipulation: No cropVariants data found for image');
        }
        // if we have data already set we assume an internal reinit eg. after resizing
        this.data = $.isEmptyObject(this.data) ? JSON.parse(data) : this.data;
        // initialize our class members
        this.currentModal.find(this.cropImageContainerSelector).css({ height: imageHeight, width: imageWidth });
        this.cropVariantTriggers = this.currentModal.find('.t3js-crop-variant-trigger');
        this.activeCropVariantTrigger = this.currentModal.find('.t3js-crop-variant-trigger.is-active');
        this.cropInfo = this.currentModal.find(this.cropInfoSelector);
        this.saveButton = this.currentModal.find('[data-method=save]');
        this.previewButton = this.currentModal.find('[data-method=preview]');
        this.dismissButton = this.currentModal.find('[data-method=dismiss]');
        this.resetButton = this.currentModal.find('[data-method=reset]');
        this.aspectRatioTrigger = this.currentModal.find('[data-method=setAspectRatio]');
        this.currentCropVariant = this.data[this.activeCropVariantTrigger.attr('data-crop-variant-id')];
        /**
         * Assign EventListener to cropVariantTriggers
         */
        this.cropVariantTriggers.off('click').on('click', (e) => {
            /**
             * Is the current cropVariantTrigger is active, bail out.
             * Bootstrap doesn't provide this functionality when collapsing the Collapse panels
             */
            if ($(e.currentTarget).hasClass('is-active')) {
                e.stopPropagation();
                e.preventDefault();
                return;
            }
            this.activeCropVariantTrigger.removeClass('is-active');
            $(e.currentTarget).addClass('is-active');
            this.activeCropVariantTrigger = $(e.currentTarget);
            const cropVariant = this.data[this.activeCropVariantTrigger.attr('data-crop-variant-id')];
            const imageData = this.cropper.getImageData();
            cropVariant.cropArea = this.convertRelativeToAbsoluteCropArea(cropVariant.cropArea, imageData);
            this.currentCropVariant = $.extend(true, {}, cropVariant);
            this.update(cropVariant);
        });
        /**
         * Assign EventListener to aspectRatioTrigger
         */
        this.aspectRatioTrigger.off('click').on('click', (e) => {
            const ratioId = $(e.currentTarget).attr('data-option');
            const temp = $.extend(true, {}, this.currentCropVariant);
            const ratio = temp.allowedAspectRatios[ratioId];
            this.setAspectRatio(ratio);
            // set data explicitly or setAspectRatio upscales the crop
            this.setCropArea(temp.cropArea);
            this.currentCropVariant = $.extend(true, {}, temp, { selectedRatio: ratioId });
            this.update(this.currentCropVariant);
        });
        /**
         * Assign EventListener to saveButton
         */
        this.saveButton.off('click').on('click', () => {
            this.save(this.data);
        });
        /**
         * Assign EventListener to previewButton if preview url exists
         */
        if (this.trigger.attr('data-preview-url')) {
            this.previewButton.off('click').on('click', () => {
                this.openPreview(this.data);
            });
        }
        else {
            this.previewButton.hide();
        }
        /**
         * Assign EventListener to dismissButton
         */
        this.dismissButton.off('click').on('click', () => {
            this.currentModal.modal('hide');
        });
        /**
         * Assign EventListener to resetButton
         */
        this.resetButton.off('click').on('click', (e) => {
            const imageData = this.cropper.getImageData();
            const resetCropVariantString = $(e.currentTarget).attr('data-crop-variant');
            e.preventDefault();
            e.stopPropagation();
            if (!resetCropVariantString) {
                throw new TypeError('TYPO3 Cropper: No cropVariant data attribute found on reset element.');
            }
            const resetCropVariant = JSON.parse(resetCropVariantString);
            const absoluteCropArea = this.convertRelativeToAbsoluteCropArea(resetCropVariant.cropArea, imageData);
            this.currentCropVariant = $.extend(true, {}, resetCropVariant, { cropArea: absoluteCropArea });
            this.update(this.currentCropVariant);
        });
        // if we start without an cropArea, maximize the cropper
        if (ImageManipulation.isEmptyArea(this.currentCropVariant.cropArea)) {
            this.defaultOpts = $.extend({
                autoCropArea: 1,
            }, this.defaultOpts);
        }
        /**
         * Initialise the cropper
         */
        this.cropper = new Cropper(image.get(0), $.extend(this.defaultOpts, {
            ready: this.cropBuiltHandler,
            crop: this.cropMoveHandler,
            cropend: this.cropEndHandler,
            cropstart: this.cropStartHandler,
            data: this.currentCropVariant.cropArea,
        }));
    }
    /**
     * @method update
     * @desc Update current cropArea position and size when changing cropVariants
     * @param {CropVariant} cropVariant - The new cropVariant to update the UI with
     */
    update(cropVariant) {
        const temp = $.extend(true, {}, cropVariant);
        const selectedRatio = cropVariant.allowedAspectRatios[cropVariant.selectedRatio];
        this.currentModal.find('[data-option]').removeClass('active');
        this.currentModal.find(`[data-option="${cropVariant.selectedRatio}"]`).addClass('active');
        /**
         * Setting the aspect ratio cause a redraw of the crop area so we need to manually reset it to last data
         */
        this.setAspectRatio(selectedRatio);
        this.setCropArea(temp.cropArea);
        this.currentCropVariant = $.extend(true, {}, temp, cropVariant);
        this.cropBox.find(this.coverAreaSelector).remove();
        // if the current container has a focus area element, deregister and cleanup prior to initialization
        if (this.cropBox.has(this.focusAreaSelector).length) {
            this.focusArea.resizable('destroy').draggable('destroy');
            this.focusArea.remove();
        }
        // check if new cropVariant has focusArea
        if (cropVariant.focusArea) {
            // init or reinit focusArea
            if (ImageManipulation.isEmptyArea(cropVariant.focusArea)) {
                this.currentCropVariant.focusArea = $.extend(true, {}, this.defaultFocusArea);
            }
            this.initFocusArea(this.cropBox);
            this.scaleAndMoveFocusArea(this.currentCropVariant.focusArea);
        }
        // check if new cropVariant has coverAreas
        if (cropVariant.coverAreas) {
            // init or reinit focusArea
            this.initCoverAreas(this.cropBox, this.currentCropVariant.coverAreas);
        }
        this.updatePreviewThumbnail(this.currentCropVariant, this.activeCropVariantTrigger);
    }
    /**
     * @method initFocusArea
     * @desc Initializes the focus area inside a container and registers the resizable and draggable interfaces to it
     * @param {JQuery} container
     * @private
     */
    initFocusArea(container) {
        this.focusArea = $('<div id="t3js-cropper-focus-area" class="cropper-focus-area"></div>');
        container.append(this.focusArea);
        this.focusArea
            .draggable({
            containment: container,
            create: () => {
                this.scaleAndMoveFocusArea(this.currentCropVariant.focusArea);
            },
            drag: () => {
                const { left, top } = container.offset();
                const { left: fLeft, top: fTop } = this.focusArea.offset();
                const { focusArea, coverAreas } = this.currentCropVariant;
                focusArea.x = (fLeft - left) / container.width();
                focusArea.y = (fTop - top) / container.height();
                this.updatePreviewThumbnail(this.currentCropVariant, this.activeCropVariantTrigger);
                if (this.checkFocusAndCoverAreasCollision(focusArea, coverAreas)) {
                    this.focusArea.addClass('has-nodrop');
                }
                else {
                    this.focusArea.removeClass('has-nodrop');
                }
            },
            revert: () => {
                const revertDelay = 250;
                const { left, top } = container.offset();
                const { left: fLeft, top: fTop } = this.focusArea.offset();
                const { focusArea, coverAreas } = this.currentCropVariant;
                if (this.checkFocusAndCoverAreasCollision(focusArea, coverAreas)) {
                    this.focusArea.removeClass('has-nodrop');
                    ImageManipulation.wait(() => {
                        focusArea.x = (fLeft - left) / container.width();
                        focusArea.y = (fTop - top) / container.height();
                        this.updateCropVariantData(this.currentCropVariant);
                    }, revertDelay);
                    return true;
                }
                return false;
            },
            revertDuration: 200,
            stop: () => {
                const { left, top } = container.offset();
                const { left: fLeft, top: fTop } = this.focusArea.offset();
                const { focusArea } = this.currentCropVariant;
                focusArea.x = (fLeft - left) / container.width();
                focusArea.y = (fTop - top) / container.height();
                this.scaleAndMoveFocusArea(focusArea);
            },
        })
            .resizable({
            containment: container,
            handles: 'all',
            resize: () => {
                const { left, top } = container.offset();
                const { left: fLeft, top: fTop } = this.focusArea.offset();
                const { focusArea, coverAreas } = this.currentCropVariant;
                focusArea.height = this.focusArea.height() / container.height();
                focusArea.width = this.focusArea.width() / container.width();
                focusArea.x = (fLeft - left) / container.width();
                focusArea.y = (fTop - top) / container.height();
                this.updatePreviewThumbnail(this.currentCropVariant, this.activeCropVariantTrigger);
                if (this.checkFocusAndCoverAreasCollision(focusArea, coverAreas)) {
                    this.focusArea.addClass('has-nodrop');
                }
                else {
                    this.focusArea.removeClass('has-nodrop');
                }
            },
            stop: (event, ui) => {
                const revertDelay = 250;
                const { left, top } = container.offset();
                const { left: fLeft, top: fTop } = this.focusArea.offset();
                const { focusArea, coverAreas } = this.currentCropVariant;
                if (this.checkFocusAndCoverAreasCollision(focusArea, coverAreas)) {
                    ui.element.animate($.extend(ui.originalPosition, ui.originalSize), revertDelay, () => {
                        focusArea.height = this.focusArea.height() / container.height();
                        focusArea.width = this.focusArea.width() / container.width();
                        focusArea.x = (fLeft - left) / container.width();
                        focusArea.y = (fTop - top) / container.height();
                        this.scaleAndMoveFocusArea(focusArea);
                        this.focusArea.removeClass('has-nodrop');
                    });
                }
                else {
                    this.scaleAndMoveFocusArea(focusArea);
                }
            },
        });
    }
    /**
     * @method initCoverAreas
     * @desc Initialise cover areas inside the cropper container
     * @param {JQuery} container - The container element to append the cover areas
     * @param {Array<Area>} coverAreas - An array of areas to construct the cover area elements from
     */
    initCoverAreas(container, coverAreas) {
        coverAreas.forEach((coverArea) => {
            const coverAreaCanvas = $('<div class="cropper-cover-area t3js-cropper-cover-area"></div>');
            container.append(coverAreaCanvas);
            coverAreaCanvas.css({
                height: ImageManipulation.toCssPercent(coverArea.height),
                left: ImageManipulation.toCssPercent(coverArea.x),
                top: ImageManipulation.toCssPercent(coverArea.y),
                width: ImageManipulation.toCssPercent(coverArea.width),
            });
        });
    }
    /**
     * @method updatePreviewThumbnail
     * @desc Sync the cropping (and focus area) to the preview thumbnail
     * @param {CropVariant} cropVariant - The crop variant to preview in the thumbnail
     * @param {JQuery} cropVariantTrigger - The crop variant element containing the thumbnail
     * @private
     */
    updatePreviewThumbnail(cropVariant, cropVariantTrigger) {
        let styles;
        const cropperPreviewThumbnailCrop = cropVariantTrigger.find('.t3js-cropper-preview-thumbnail-crop-area');
        const cropperPreviewThumbnailImage = cropVariantTrigger.find('.t3js-cropper-preview-thumbnail-crop-image');
        const cropperPreviewThumbnailFocus = cropVariantTrigger.find('.t3js-cropper-preview-thumbnail-focus-area');
        const imageData = this.cropper.getImageData();
        // update the position/dimension of the crop area in the preview
        cropperPreviewThumbnailCrop.css({
            height: ImageManipulation.toCssPercent(cropVariant.cropArea.height / imageData.naturalHeight),
            left: ImageManipulation.toCssPercent(cropVariant.cropArea.x / imageData.naturalWidth),
            top: ImageManipulation.toCssPercent(cropVariant.cropArea.y / imageData.naturalHeight),
            width: ImageManipulation.toCssPercent(cropVariant.cropArea.width / imageData.naturalWidth),
        });
        // show and update focusArea in the preview only if we really have one configured
        if (cropVariant.focusArea) {
            cropperPreviewThumbnailFocus.css({
                height: ImageManipulation.toCssPercent(cropVariant.focusArea.height),
                left: ImageManipulation.toCssPercent(cropVariant.focusArea.x),
                top: ImageManipulation.toCssPercent(cropVariant.focusArea.y),
                width: ImageManipulation.toCssPercent(cropVariant.focusArea.width),
            });
        }
        // destruct the preview container's CSS properties
        styles = cropperPreviewThumbnailCrop.css([
            'width', 'height', 'left', 'top',
        ]);
        /**
         * Apply negative margins on the previewThumbnailImage to make the illusion of an offset
         */
        cropperPreviewThumbnailImage.css({
            height: `${parseFloat(styles.height) * (1 / (cropVariant.cropArea.height / imageData.naturalHeight))}px`,
            margin: `${-1 * parseFloat(styles.left)}px`,
            marginTop: `${-1 * parseFloat(styles.top)}px`,
            width: `${parseFloat(styles.width) * (1 / (cropVariant.cropArea.width / imageData.naturalWidth))}px`,
        });
    }
    /**
     * @method scaleAndMoveFocusArea
     * @desc Calculation logic for moving the focus area given the
     *       specified constrains of a crop and an optional cover area
     * @param {Area} focusArea - The translation data
     */
    scaleAndMoveFocusArea(focusArea) {
        this.focusArea.css({
            height: ImageManipulation.toCssPercent(focusArea.height),
            left: ImageManipulation.toCssPercent(focusArea.x),
            top: ImageManipulation.toCssPercent(focusArea.y),
            width: ImageManipulation.toCssPercent(focusArea.width),
        });
        this.currentCropVariant.focusArea = focusArea;
        this.updatePreviewThumbnail(this.currentCropVariant, this.activeCropVariantTrigger);
        this.updateCropVariantData(this.currentCropVariant);
    }
    /**
     * @method updateCropVariantData
     * @desc Immutably updates the currently selected cropVariant data
     * @param {CropVariant} currentCropVariant - The cropVariant to immutably save
     * @private
     */
    updateCropVariantData(currentCropVariant) {
        const imageData = this.cropper.getImageData();
        const absoluteCropArea = this.convertAbsoluteToRelativeCropArea(currentCropVariant.cropArea, imageData);
        this.data[currentCropVariant.id] = $.extend(true, {}, currentCropVariant, { cropArea: absoluteCropArea });
    }
    /**
     * @method setAspectRatio
     * @desc Sets the cropper to a specific ratio
     * @param {ratio} ratio - The ratio value to apply
     * @private
     */
    setAspectRatio(ratio) {
        this.cropper.setAspectRatio(ratio.value);
    }
    /**
     * @method setCropArea
     * @desc Sets the cropper to a specific crop area
     * @param {cropArea} cropArea - The crop area to apply
     * @private
     */
    setCropArea(cropArea) {
        const currentRatio = this.currentCropVariant.allowedAspectRatios[this.currentCropVariant.selectedRatio];
        if (currentRatio.value === 0) {
            this.cropper.setData({
                height: cropArea.height,
                width: cropArea.width,
                x: cropArea.x,
                y: cropArea.y,
            });
        }
        else {
            this.cropper.setData({
                height: cropArea.height,
                width: cropArea.height * currentRatio.value,
                x: cropArea.x,
                y: cropArea.y,
            });
        }
    }
    /**
     * @method checkFocusAndCoverAreas
     * @desc Checks is one focus area and one or more cover areas overlap
     * @param focusArea
     * @param coverAreas
     * @return {boolean}
     */
    checkFocusAndCoverAreasCollision(focusArea, coverAreas) {
        if (!coverAreas) {
            return false;
        }
        return coverAreas
            .some((coverArea) => {
            // noinspection OverlyComplexBooleanExpressionJS
            return (focusArea.x < coverArea.x + coverArea.width &&
                focusArea.x + focusArea.width > coverArea.x &&
                focusArea.y < coverArea.y + coverArea.height &&
                focusArea.height + focusArea.y > coverArea.y);
        });
    }
    /**
     * @method convertAbsoluteToRelativeCropArea
     * @desc Converts a crop area from absolute pixel-based into relative length values
     * @param {Area} cropArea - The crop area to convert from
     * @param {Cropper.ImageData} imageData - The image data
     * @return {Area}
     */
    convertAbsoluteToRelativeCropArea(cropArea, imageData) {
        const { height, width, x, y } = cropArea;
        return {
            height: height / imageData.naturalHeight,
            width: width / imageData.naturalWidth,
            x: x / imageData.naturalWidth,
            y: y / imageData.naturalHeight,
        };
    }
    /**
     * @method convertRelativeToAbsoluteCropArea
     * @desc Converts a crop area from relative into absolute pixel-based length values
     * @param {Area} cropArea - The crop area to convert from
     * @param {Cropper.ImageData} imageData - The image data
     * @return {{height: number, width: number, x: number, y: number}}
     */
    convertRelativeToAbsoluteCropArea(cropArea, imageData) {
        const { height, width, x, y } = cropArea;
        return {
            height: height * imageData.naturalHeight,
            width: width * imageData.naturalWidth,
            x: x * imageData.naturalWidth,
            y: y * imageData.naturalHeight,
        };
    }
    /**
     * @method setPreviewImages
     * @desc Updates the preview images in the editing section with the respective crop variants
     * @param {Object} data - The internal crop variants state
     */
    setPreviewImages(data) {
        // @ts-ignore .image is not declared
        const image = this.cropper.image;
        const imageData = this.cropper.getImageData();
        // iterate over the crop variants and set up their respective preview
        Object.keys(data).forEach((cropVariantId) => {
            const cropVariant = data[cropVariantId];
            const cropData = this.convertRelativeToAbsoluteCropArea(cropVariant.cropArea, imageData);
            const $preview = this.trigger
                .closest('.form-group')
                .find(`.t3js-image-manipulation-preview[data-crop-variant-id="${cropVariantId}"]`);
            const $previewSelectedRatio = this.trigger
                .closest('.form-group')
                .find(`.t3js-image-manipulation-selected-ratio[data-crop-variant-id="${cropVariantId}"]`); // tslint:disable-line:max-line-length
            if ($preview.length === 0) {
                return;
            }
            let previewWidth = $preview.width();
            let previewHeight = $preview.data('preview-height');
            // adjust aspect ratio of preview width/height
            const aspectRatio = cropData.width / cropData.height;
            const tmpHeight = previewWidth / aspectRatio;
            if (tmpHeight > previewHeight) {
                previewWidth = previewHeight * aspectRatio;
            }
            else {
                previewHeight = tmpHeight;
            }
            // preview should never be up-scaled
            if (previewWidth > cropData.width) {
                previewWidth = cropData.width;
                previewHeight = cropData.height;
            }
            const ratio = previewWidth / cropData.width;
            const $viewBox = $('<div />').html('<img src="' + image.src + '">');
            const $ratioTitleText = this.currentModal.find(`.t3-js-ratio-title[data-ratio-id="${cropVariant.id}${cropVariant.selectedRatio}"]`); // tslint:disable-line:max-line-length
            $previewSelectedRatio.text($ratioTitleText.text());
            $viewBox.addClass('cropper-preview-container');
            $preview.empty().append($viewBox);
            $viewBox.wrap('<span class="thumbnail thumbnail-status"></span>');
            $viewBox.width(previewWidth).height(previewHeight).find('img').css({
                height: imageData.naturalHeight * ratio,
                left: -cropData.x * ratio,
                top: -cropData.y * ratio,
                width: imageData.naturalWidth * ratio,
            });
        });
    }
    /**
     * @method openPreview
     * @desc Opens a preview view with the crop variants
     * @param {object} data - The whole data object containing all the cropVariants
     * @private
     */
    openPreview(data) {
        const cropVariants = ImageManipulation.serializeCropVariants(data);
        let previewUrl = this.trigger.attr('data-preview-url');
        previewUrl = previewUrl + '&cropVariants=' + encodeURIComponent(cropVariants);
        window.open(previewUrl, 'TYPO3ImageManipulationPreview');
    }
    /**
     * @method save
     * @desc Saves the edited cropVariants to a hidden field
     * @param {object} data - The whole data object containing all the cropVariants
     * @private
     */
    save(data) {
        const cropVariants = ImageManipulation.serializeCropVariants(data);
        const hiddenField = $(`#${this.trigger.attr('data-field')}`);
        this.trigger.attr('data-crop-variants', JSON.stringify(data));
        this.setPreviewImages(data);
        hiddenField.val(cropVariants);
        FormEngineValidation.markFieldAsChanged(hiddenField);
        this.currentModal.modal('hide');
    }
    /**
     * @method destroy
     * @desc Destroy the ImageManipulation including cropper and alike
     * @private
     */
    destroy() {
        if (this.currentModal) {
            if (this.cropper instanceof Cropper) {
                this.cropper.destroy();
            }
            this.initialized = false;
            this.cropper = null;
            this.currentModal = null;
            this.data = null;
        }
    }
}
var ImageManipulation$1 = new ImageManipulation();

export default ImageManipulation$1;
