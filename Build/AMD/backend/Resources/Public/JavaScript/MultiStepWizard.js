define(['./Icons', './Enum/Severity', '../../../../core/Resources/Public/JavaScript/Contrib/jquery', './Severity', './Modal'], function (Icons, Severity, jquery, Severity$1, Modal) { 'use strict';

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
     * Module: TYPO3/CMS/Backend/MultiStepWizard
     * Multi step wizard within a modal
     * @exports TYPO3/CMS/Backend/MultiStepWizard
     */
    class MultiStepWizard {
        constructor() {
            this.setup = {
                slides: [],
                settings: {},
                forceSelection: true,
                $carousel: null,
            };
            this.originalSetup = jquery.extend(true, {}, this.setup);
        }
        /**
         * @param {string} key
         * @param {any} value
         * @returns {MultiStepWizard}
         */
        set(key, value) {
            this.setup.settings[key] = value;
            return this;
        }
        /**
         * Add a slide item to carousel as an additional step
         *
         * @param {string} identifier
         * @param {string} title
         * @param {string} progressBarTitle
         * @param {string} content
         * @param {SeverityEnum} severity
         * @param {Function} callback
         * @returns {MultiStepWizard}
         */
        addSlide(identifier, title, content = '', severity = Severity.SeverityEnum.info, progressBarTitle, callback) {
            const slide = {
                identifier: identifier,
                title: title,
                content: content,
                severity: severity,
                progressBarTitle: progressBarTitle,
                callback: callback,
            };
            this.setup.slides.push(slide);
            return this;
        }
        /**
         * Add the final processing slide as the last step
         *
         * @param {Function} callback
         * @returns {Promise<string>}
         */
        addFinalProcessingSlide(callback) {
            if (!callback) {
                callback = () => {
                    this.dismiss();
                };
            }
            return Icons.getIcon('spinner-circle', Icons.sizes.default, null, null).then((markup) => {
                let $processingSlide = jquery('<div />', { class: 'text-center' }).append(markup);
                this.addSlide('final-processing-slide', top.TYPO3.lang['wizard.processing.title'], $processingSlide[0].outerHTML, Severity$1.info, null, callback);
            });
        }
        /**
         * Create wizard with modal, buttons, progress bar and carousel
         */
        show() {
            let $slides = this.generateSlides();
            let firstSlide = this.setup.slides[0];
            Modal.confirm(firstSlide.title, $slides, firstSlide.severity, [{
                    text: top.TYPO3.lang['wizard.button.cancel'],
                    active: true,
                    btnClass: 'btn-default pull-left',
                    name: 'cancel',
                    trigger: () => {
                        this.getComponent().trigger('wizard-dismiss');
                    },
                }, {
                    text: top.TYPO3.lang['wizard.button.prev'],
                    btnClass: 'btn-' + Severity$1.getCssClass(firstSlide.severity),
                    name: 'prev',
                }, {
                    text: top.TYPO3.lang['wizard.button.next'],
                    btnClass: 'btn-' + Severity$1.getCssClass(firstSlide.severity),
                    name: 'next',
                }], ['modal-multi-step-wizard']);
            this.addButtonContainer();
            this.addProgressBar();
            this.initializeEvents();
            this.getComponent().on('wizard-visible', () => {
                this.runSlideCallback(firstSlide, this.setup.$carousel.find('.item').first());
            }).on('wizard-dismissed', () => {
                this.setup = jquery.extend(true, {}, this.originalSetup);
            });
        }
        /**
         * @returns {JQuery}
         */
        getComponent() {
            if (this.setup.$carousel === null) {
                this.generateSlides();
            }
            return this.setup.$carousel;
        }
        /**
         * Close the modal / wizard
         */
        dismiss() {
            Modal.dismiss();
        }
        /**
         * Lock the button for the next step
         *
         * @returns {JQuery}
         */
        lockNextStep() {
            let $button = this.setup.$carousel.closest('.modal').find('button[name="next"]');
            $button.prop('disabled', true);
            return $button;
        }
        /**
         * Unlock the button for the next step
         *
         * @returns {JQuery}
         */
        unlockNextStep() {
            let $button = this.setup.$carousel.closest('.modal').find('button[name="next"]');
            $button.prop('disabled', false);
            return $button;
        }
        /**
         * Lock the button for the prev step
         *
         * @returns {JQuery}
         */
        lockPrevStep() {
            let $button = this.setup.$carousel.closest('.modal').find('button[name="prev"]');
            $button.prop('disabled', true);
            return $button;
        }
        /**
         * Unlock the button for the prev step
         *
         * @returns {JQuery}
         */
        unlockPrevStep() {
            let $button = this.setup.$carousel.closest('.modal').find('button[name="prev"]');
            $button.prop('disabled', false);
            return $button;
        }
        /**
         * Trigger a step button (prev or next)
         *
         * @param {string} direction
         * @returns {JQuery}
         */
        triggerStepButton(direction) {
            let $button = this.setup.$carousel.closest('.modal').find('button[name="' + direction + '"]');
            if ($button.length > 0 && $button.prop('disabled') !== true) {
                $button.trigger('click');
            }
            return $button;
        }
        /**
         * Blur the button for the cancel step
         *
         * @returns {JQuery}
         */
        blurCancelStep() {
            let $button = this.setup.$carousel.closest('.modal').find('button[name="cancel"]');
            $button.trigger('blur');
            return $button;
        }
        /**
         * Register all events
         *
         * @private
         */
        initializeEvents() {
            let $modal = this.setup.$carousel.closest('.modal');
            this.initializeSlideNextEvent($modal);
            this.initializeSlidePrevEvent($modal);
            // Event fires when the slide transition is invoked
            this.setup.$carousel.on('slide.bs.carousel', (evt) => {
                if (evt.direction === 'left') {
                    this.nextSlideChanges($modal);
                }
                else {
                    this.prevSlideChanges($modal);
                }
            })
                // Event is fired when the carousel has completed its slide transition
                .on('slid.bs.carousel', (evt) => {
                let currentIndex = this.setup.$carousel.data('currentIndex');
                let slide = this.setup.slides[currentIndex];
                this.runSlideCallback(slide, jquery(evt.relatedTarget));
                if (this.setup.forceSelection) {
                    this.lockNextStep();
                }
            });
            // Custom event, closes the wizard
            let cmp = this.getComponent();
            cmp.on('wizard-dismiss', this.dismiss);
            Modal.currentModal.on('hidden.bs.modal', () => {
                cmp.trigger('wizard-dismissed');
            }).on('shown.bs.modal', () => {
                cmp.trigger('wizard-visible');
            });
        }
        initializeSlideNextEvent($modal) {
            let $modalFooter = $modal.find('.modal-footer');
            let $nextButton = $modalFooter.find('button[name="next"]');
            $nextButton.off().on('click', () => {
                this.setup.$carousel.carousel('next');
            });
        }
        initializeSlidePrevEvent($modal) {
            let $modalFooter = $modal.find('.modal-footer');
            let $prevButton = $modalFooter.find('button[name="prev"]');
            $prevButton.off().on('click', () => {
                this.setup.$carousel.carousel('prev');
            });
        }
        /**
         * All changes after applying the next-button
         *
         * @param {JQuery} $modal
         * @private
         */
        nextSlideChanges($modal) {
            this.initializeSlideNextEvent($modal);
            let $modalTitle = $modal.find('.modal-title');
            let $modalFooter = $modal.find('.modal-footer');
            let $modalButtonGroup = $modal.find('.modal-btn-group');
            let $nextButton = $modalFooter.find('button[name="next"]');
            let nextSlideNumber = this.setup.$carousel.data('currentSlide') + 1;
            let currentIndex = this.setup.$carousel.data('currentIndex') + 1;
            $modalTitle.text(this.setup.slides[currentIndex].title);
            this.setup.$carousel.data('currentSlide', nextSlideNumber);
            this.setup.$carousel.data('currentIndex', currentIndex);
            // Last wizard step
            if (nextSlideNumber >= this.setup.$carousel.data('realSlideCount')) {
                $nextButton.text(this.getProgressBarTitle(this.setup.$carousel.data('currentIndex')));
                $modalFooter.find('.progress-bar.first-step')
                    .width('100%')
                    .text(this.getProgressBarTitle(this.setup.$carousel.data('currentIndex')));
                $modalFooter.find('.progress-bar.last-step')
                    .width('0%')
                    .text('');
                this.setup.forceSelection = false;
            }
            else {
                $modalFooter.find('.progress-bar.first-step')
                    .width(this.setup.$carousel.data('initialStep') * nextSlideNumber + '%')
                    .text(this.getProgressBarTitle(currentIndex));
                $modalFooter.find('.progress-bar.step')
                    .width('0%')
                    .text('');
                $modalButtonGroup.slideDown();
            }
            $nextButton
                .removeClass('btn-' + Severity$1.getCssClass(this.setup.slides[currentIndex - 1].severity))
                .addClass('btn-' + Severity$1.getCssClass(this.setup.slides[currentIndex].severity));
            $modal
                .removeClass('modal-severity-' + Severity$1.getCssClass(this.setup.slides[currentIndex - 1].severity))
                .addClass('modal-severity-' + Severity$1.getCssClass(this.setup.slides[currentIndex].severity));
        }
        /**
         * All changes after applying the prev-button
         *
         * @param {JQuery} $modal
         * @private
         */
        prevSlideChanges($modal) {
            this.initializeSlidePrevEvent($modal);
            let $modalTitle = $modal.find('.modal-title');
            let $modalFooter = $modal.find('.modal-footer');
            let $modalButtonGroup = $modal.find('.modal-btn-group');
            let $nextButton = $modalFooter.find('button[name="next"]');
            let nextSlideNumber = this.setup.$carousel.data('currentSlide') - 1;
            let currentIndex = this.setup.$carousel.data('currentIndex') - 1;
            this.setup.$carousel.data('currentSlide', nextSlideNumber);
            this.setup.$carousel.data('currentIndex', currentIndex);
            $modalTitle.text(this.setup.slides[currentIndex].title);
            $modalFooter.find('.progress-bar.last-step')
                .width(this.setup.$carousel.data('initialStep') + '%')
                .text(this.getProgressBarTitle(this.setup.$carousel.data('slideCount') - 1));
            $nextButton.text(top.TYPO3.lang['wizard.button.next']);
            // First wizard step
            if (nextSlideNumber === 1) {
                $modalFooter.find('.progress-bar.first-step')
                    .width(this.setup.$carousel.data('initialStep') * nextSlideNumber + '%')
                    .text(this.getProgressBarTitle(0));
                $modalFooter.find('.progress-bar.step')
                    .width(this.setup.$carousel.data('initialStep') + '%')
                    .text(this.getProgressBarTitle(currentIndex + 1));
                $modalButtonGroup.slideUp();
            }
            else {
                $modalFooter.find('.progress-bar.first-step')
                    .width(this.setup.$carousel.data('initialStep') * nextSlideNumber + '%')
                    .text(this.getProgressBarTitle(currentIndex));
                this.setup.forceSelection = true;
            }
        }
        /**
         * get custom progress bar label of current slide
         * or fallback label
         *
         * @private
         */
        getProgressBarTitle(slideIndex) {
            let progessBarTitle;
            if (this.setup.slides[slideIndex].progressBarTitle === null) {
                if (slideIndex === 0) {
                    progessBarTitle = top.TYPO3.lang['wizard.progressStep.start'];
                }
                else if (slideIndex >= this.setup.$carousel.data('slideCount') - 1) {
                    progessBarTitle = top.TYPO3.lang['wizard.progressStep.finish'];
                }
                else {
                    progessBarTitle = top.TYPO3.lang['wizard.progressStep'] + String(slideIndex + 1);
                }
            }
            else {
                progessBarTitle = this.setup.slides[slideIndex].progressBarTitle;
            }
            return progessBarTitle;
        }
        /**
         * @param {Slide} slide
         * @param {JQuery} $slide
         * @private
         */
        runSlideCallback(slide, $slide) {
            if (typeof slide.callback === 'function') {
                slide.callback($slide, this.setup.settings, slide.identifier);
            }
        }
        /**
         * Create the progress bar within the modal footer
         *
         * @private
         */
        addProgressBar() {
            let realSlideCount = this.setup.$carousel.find('.item').length - 1;
            let slideCount = Math.max(1, realSlideCount);
            let initialStep;
            let $modal = this.setup.$carousel.closest('.modal');
            let $modalFooter = $modal.find('.modal-footer');
            initialStep = Math.round(100 / slideCount);
            this.setup.$carousel
                .data('initialStep', initialStep)
                .data('slideCount', slideCount)
                .data('realSlideCount', realSlideCount)
                .data('currentIndex', 0)
                .data('currentSlide', 1);
            // Append progress bar to modal footer
            if (slideCount > 1) {
                $modalFooter.prepend(jquery('<div />', { class: 'progress' }));
                for (let i = 0; i < this.setup.slides.length; ++i) {
                    let classes;
                    if (i === 0) {
                        classes = 'progress-bar first-step';
                    }
                    else if (i === this.setup.$carousel.data('slideCount') - 1) {
                        classes = 'progress-bar last-step inactive';
                    }
                    else {
                        classes = 'progress-bar step inactive';
                    }
                    $modalFooter.find('.progress')
                        .append(jquery('<div />', {
                        role: 'progressbar',
                        class: classes,
                        'aria-valuemin': 0,
                        'aria-valuenow': initialStep,
                        'aria-valuemax': 100,
                    })
                        .width(initialStep + '%')
                        .text(this.getProgressBarTitle(i)));
                }
            }
        }
        /**
         * Wrap all the buttons of modal footer
         *
         * @private
         */
        addButtonContainer() {
            let $modal = this.setup.$carousel.closest('.modal');
            let $modalFooterButtons = $modal.find('.modal-footer .btn');
            $modalFooterButtons.wrapAll('<div class="modal-btn-group" />');
        }
        /**
         * Generate slides of carousel
         *
         * @returns {JQuery}
         * @private
         */
        generateSlides() {
            // Check whether the slides were already generated
            if (this.setup.$carousel !== null) {
                return this.setup.$carousel;
            }
            let slides = '<div class="carousel slide" data-ride="carousel" data-interval="false">'
                + '<div class="carousel-inner" role="listbox">';
            for (let i = 0; i < this.setup.slides.length; ++i) {
                let currentSlide = this.setup.slides[i];
                let slideContent = currentSlide.content;
                if (typeof slideContent === 'object') {
                    slideContent = slideContent.html();
                }
                slides += '<div class="item" data-slide="' + currentSlide.identifier + '" data-step="' + i + '">' + slideContent + '</div>';
            }
            slides += '</div></div>';
            this.setup.$carousel = jquery(slides);
            this.setup.$carousel.find('.item').first().addClass('active');
            return this.setup.$carousel;
        }
    }
    let multistepWizardObject;
    try {
        // fetch from opening window
        if (window.opener && window.opener.TYPO3 && window.opener.TYPO3.MultiStepWizard) {
            multistepWizardObject = window.opener.TYPO3.MultiStepWizard;
        }
        // fetch from parent
        if (parent && parent.window.TYPO3 && parent.window.TYPO3.MultiStepWizard) {
            multistepWizardObject = parent.window.TYPO3.MultiStepWizard;
        }
        // fetch object from outer frame
        if (top && top.TYPO3 && top.TYPO3.MultiStepWizard) {
            multistepWizardObject = top.TYPO3.MultiStepWizard;
        }
    }
    catch (e) {
        // This only happens if the opener, parent or top is some other url (eg a local file)
        // which loaded the current window. Then the browser's cross domain policy jumps in
        // and raises an exception.
        // For this case we are safe and we can create our global object below.
    }
    if (!multistepWizardObject) {
        multistepWizardObject = new MultiStepWizard();
        // attach to global frame
        if (typeof TYPO3 !== 'undefined') {
            TYPO3.MultiStepWizard = multistepWizardObject;
        }
    }
    var multistepWizardObject$1 = multistepWizardObject;

    return multistepWizardObject$1;

});
