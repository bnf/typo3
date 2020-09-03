import { SeverityEnum } from './Enum/Severity.mjs';
import jQuery from '../../../../core/Resources/Public/JavaScript/Contrib/jquery.mjs';
import AjaxRequest from '../../../../core/Resources/Public/JavaScript/Ajax/AjaxRequest.mjs';
import Icons from './Icons.mjs';
import '../../../../core/Resources/Public/JavaScript/Contrib/bootstrap.mjs';
import SecurityUtility from '../../../../core/Resources/Public/JavaScript/SecurityUtility.mjs';
import Severity from './Severity.mjs';

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
    Identifiers["modal"] = ".t3js-modal";
    Identifiers["content"] = ".t3js-modal-content";
    Identifiers["title"] = ".t3js-modal-title";
    Identifiers["close"] = ".t3js-modal-close";
    Identifiers["body"] = ".t3js-modal-body";
    Identifiers["footer"] = ".t3js-modal-footer";
    Identifiers["iframe"] = ".t3js-modal-iframe";
    Identifiers["iconPlaceholder"] = ".t3js-modal-icon-placeholder";
})(Identifiers || (Identifiers = {}));
var Sizes;
(function (Sizes) {
    Sizes["small"] = "small";
    Sizes["default"] = "default";
    Sizes["medium"] = "medium";
    Sizes["large"] = "large";
    Sizes["full"] = "full";
})(Sizes || (Sizes = {}));
var Styles;
(function (Styles) {
    Styles["default"] = "default";
    Styles["light"] = "light";
    Styles["dark"] = "dark";
})(Styles || (Styles = {}));
var Types;
(function (Types) {
    Types["default"] = "default";
    Types["ajax"] = "ajax";
    Types["iframe"] = "iframe";
})(Types || (Types = {}));
/**
 * Module: TYPO3/CMS/Backend/Modal
 * API for modal windows powered by Twitter Bootstrap.
 */
class Modal {
    constructor(securityUtility) {
        this.sizes = Sizes;
        this.styles = Styles;
        this.types = Types;
        this.currentModal = null;
        this.instances = [];
        this.$template = jQuery('<div class="t3js-modal modal fade">' +
            '<div class="modal-dialog">' +
            '<div class="t3js-modal-content modal-content">' +
            '<div class="modal-header">' +
            '<button class="t3js-modal-close close">' +
            '<span aria-hidden="true">' +
            '<span class="t3js-modal-icon-placeholder" data-icon="actions-close"></span>' +
            '</span>' +
            '<span class="sr-only"></span>' +
            '</button>' +
            '<h4 class="t3js-modal-title modal-title"></h4>' +
            '</div>' +
            '<div class="t3js-modal-body modal-body"></div>' +
            '<div class="t3js-modal-footer modal-footer"></div>' +
            '</div>' +
            '</div>' +
            '</div>');
        this.defaultConfiguration = {
            type: Types.default,
            title: 'Information',
            content: 'No content provided, please check your <code>Modal</code> configuration.',
            severity: SeverityEnum.notice,
            buttons: [],
            style: Styles.default,
            size: Sizes.default,
            additionalCssClasses: [],
            callback: jQuery.noop(),
            ajaxCallback: jQuery.noop(),
            ajaxTarget: null,
        };
        this.securityUtility = securityUtility;
        jQuery(document).on('modal-dismiss', this.dismiss);
        this.initializeMarkupTrigger(document);
    }
    static resolveEventNameTargetElement(evt) {
        const target = evt.target;
        const currentTarget = evt.currentTarget;
        if (target.dataset && target.dataset.eventName) {
            return target;
        }
        else if (currentTarget.dataset && currentTarget.dataset.eventName) {
            return currentTarget;
        }
        return null;
    }
    static createModalResponseEventFromElement(element, result) {
        if (!element || !element.dataset.eventName) {
            return null;
        }
        return new CustomEvent(element.dataset.eventName, {
            bubbles: true,
            detail: { result, payload: element.dataset.eventPayload || null }
        });
    }
    /**
     * Close the current open modal
     */
    dismiss() {
        if (this.currentModal) {
            this.currentModal.modal('hide');
        }
    }
    /**
     * Shows a confirmation dialog
     * Events:
     * - button.clicked
     * - confirm.button.cancel
     * - confirm.button.ok
     *
     * @param {string} title The title for the confirm modal
     * @param {string | JQuery} content The content for the conform modal, e.g. the main question
     * @param {SeverityEnum} severity Default SeverityEnum.warning
     * @param {Array<Button>} buttons An array with buttons, default no buttons
     * @param {Array<string>} additionalCssClasses Additional css classes to add to the modal
     * @returns {JQuery}
     */
    confirm(title, content, severity = SeverityEnum.warning, buttons = [], additionalCssClasses) {
        if (buttons.length === 0) {
            buttons.push({
                text: jQuery(this).data('button-close-text') || TYPO3.lang['button.cancel'] || 'Cancel',
                active: true,
                btnClass: 'btn-default',
                name: 'cancel',
            }, {
                text: jQuery(this).data('button-ok-text') || TYPO3.lang['button.ok'] || 'OK',
                btnClass: 'btn-' + Severity.getCssClass(severity),
                name: 'ok',
            });
        }
        return this.advanced({
            title,
            content,
            severity,
            buttons,
            additionalCssClasses,
            callback: (currentModal) => {
                currentModal.on('button.clicked', (e) => {
                    if (e.target.getAttribute('name') === 'cancel') {
                        jQuery(e.currentTarget).trigger('confirm.button.cancel');
                    }
                    else if (e.target.getAttribute('name') === 'ok') {
                        jQuery(e.currentTarget).trigger('confirm.button.ok');
                    }
                });
            },
        });
    }
    /**
     * Load URL with AJAX, append the content to the modal-body
     * and trigger the callback
     *
     * @param {string} title
     * @param {SeverityEnum} severity
     * @param {Array<Button>} buttons
     * @param {string} url
     * @param {Function} callback
     * @param {string} target
     * @returns {JQuery}
     */
    loadUrl(title, severity = SeverityEnum.info, buttons, url, callback, target) {
        return this.advanced({
            type: Types.ajax,
            title,
            severity,
            buttons,
            ajaxCallback: callback,
            ajaxTarget: target,
            content: url,
        });
    }
    /**
     * Shows a dialog
     *
     * @param {string} title
     * @param {string | JQuery} content
     * @param {number} severity
     * @param {Array<Object>} buttons
     * @param {Array<string>} additionalCssClasses
     * @returns {JQuery}
     */
    show(title, content, severity = SeverityEnum.info, buttons, additionalCssClasses) {
        return this.advanced({
            type: Types.default,
            title,
            content,
            severity,
            buttons,
            additionalCssClasses,
        });
    }
    /**
     * Loads modal by configuration
     *
     * @param {object} configuration configuration for the modal
     */
    advanced(configuration) {
        // Validation of configuration
        configuration.type = typeof configuration.type === 'string' && configuration.type in Types
            ? configuration.type
            : this.defaultConfiguration.type;
        configuration.title = typeof configuration.title === 'string'
            ? configuration.title
            : this.defaultConfiguration.title;
        configuration.content = typeof configuration.content === 'string' || typeof configuration.content === 'object'
            ? configuration.content
            : this.defaultConfiguration.content;
        configuration.severity = typeof configuration.severity !== 'undefined'
            ? configuration.severity
            : this.defaultConfiguration.severity;
        configuration.buttons = configuration.buttons || this.defaultConfiguration.buttons;
        configuration.size = typeof configuration.size === 'string' && configuration.size in Sizes
            ? configuration.size
            : this.defaultConfiguration.size;
        configuration.style = typeof configuration.style === 'string' && configuration.style in Styles
            ? configuration.style
            : this.defaultConfiguration.style;
        configuration.additionalCssClasses = configuration.additionalCssClasses || this.defaultConfiguration.additionalCssClasses;
        configuration.callback = typeof configuration.callback === 'function' ? configuration.callback : this.defaultConfiguration.callback;
        configuration.ajaxCallback = typeof configuration.ajaxCallback === 'function'
            ? configuration.ajaxCallback
            : this.defaultConfiguration.ajaxCallback;
        configuration.ajaxTarget = typeof configuration.ajaxTarget === 'string'
            ? configuration.ajaxTarget
            : this.defaultConfiguration.ajaxTarget;
        return this.generate(configuration);
    }
    /**
     * Sets action buttons for the modal window or removed the footer, if no buttons are given.
     *
     * @param {Array<Button>} buttons
     */
    setButtons(buttons) {
        const modalFooter = this.currentModal.find(Identifiers.footer);
        if (buttons.length > 0) {
            modalFooter.empty();
            for (let i = 0; i < buttons.length; i++) {
                const button = buttons[i];
                const $button = jQuery('<button />', { 'class': 'btn' });
                $button.html('<span>' + this.securityUtility.encodeHtml(button.text, false) + '</span>');
                if (button.active) {
                    $button.addClass('t3js-active');
                }
                if (button.btnClass !== '') {
                    $button.addClass(button.btnClass);
                }
                if (button.name !== '') {
                    $button.attr('name', button.name);
                }
                if (button.action) {
                    $button.on('click', () => {
                        modalFooter.find('button').not($button).addClass('disabled');
                        button.action.execute($button.get(0)).then(() => {
                            this.currentModal.modal('hide');
                        });
                    });
                }
                else if (button.trigger) {
                    $button.on('click', button.trigger);
                }
                if (button.dataAttributes) {
                    if (Object.keys(button.dataAttributes).length > 0) {
                        Object.keys(button.dataAttributes).map((value) => {
                            $button.attr('data-' + value, button.dataAttributes[value]);
                        });
                    }
                }
                if (button.icon) {
                    $button.prepend('<span class="t3js-modal-icon-placeholder" data-icon="' + button.icon + '"></span>');
                }
                modalFooter.append($button);
            }
            modalFooter.show();
            modalFooter.find('button')
                .on('click', (e) => {
                jQuery(e.currentTarget).trigger('button.clicked');
            });
        }
        else {
            modalFooter.hide();
        }
        return this.currentModal;
    }
    /**
     * Initialize markup with data attributes
     *
     * @param {HTMLDocument} theDocument
     */
    initializeMarkupTrigger(theDocument) {
        jQuery(theDocument).on('click', '.t3js-modal-trigger', (evt) => {
            evt.preventDefault();
            const $element = jQuery(evt.currentTarget);
            const content = $element.data('content') || 'Are you sure?';
            const severity = typeof SeverityEnum[$element.data('severity')] !== 'undefined'
                ? SeverityEnum[$element.data('severity')]
                : SeverityEnum.info;
            let url = $element.data('url') || null;
            if (url !== null) {
                const separator = url.includes('?') ? '&' : '?';
                const params = jQuery.param({ data: $element.data() });
                url = url + separator + params;
            }
            this.advanced({
                type: url !== null ? Types.ajax : Types.default,
                title: $element.data('title') || 'Alert',
                content: url !== null ? url : content,
                severity,
                buttons: [
                    {
                        text: $element.data('button-close-text') || TYPO3.lang['button.close'] || 'Close',
                        active: true,
                        btnClass: 'btn-default',
                        trigger: () => {
                            this.currentModal.trigger('modal-dismiss');
                            const eventNameTarget = Modal.resolveEventNameTargetElement(evt);
                            const event = Modal.createModalResponseEventFromElement(eventNameTarget, false);
                            if (event !== null) {
                                // dispatch event at the element having `data-event-name` declared
                                eventNameTarget.dispatchEvent(event);
                            }
                        },
                    },
                    {
                        text: $element.data('button-ok-text') || TYPO3.lang['button.ok'] || 'OK',
                        btnClass: 'btn-' + Severity.getCssClass(severity),
                        trigger: () => {
                            this.currentModal.trigger('modal-dismiss');
                            const eventNameTarget = Modal.resolveEventNameTargetElement(evt);
                            const event = Modal.createModalResponseEventFromElement(eventNameTarget, true);
                            if (event !== null) {
                                // dispatch event at the element having `data-event-name` declared
                                eventNameTarget.dispatchEvent(event);
                            }
                            const href = $element.data('href') || $element.attr('href');
                            if (href && href !== '#') {
                                evt.target.ownerDocument.location.href = href;
                            }
                        },
                    },
                ],
            });
        });
    }
    /**
     * @param {Configuration} configuration
     */
    generate(configuration) {
        const currentModal = this.$template.clone();
        if (configuration.additionalCssClasses.length > 0) {
            for (let additionalClass of configuration.additionalCssClasses) {
                currentModal.addClass(additionalClass);
            }
        }
        currentModal.addClass('modal-type-' + configuration.type);
        currentModal.addClass('modal-severity-' + Severity.getCssClass(configuration.severity));
        currentModal.addClass('modal-style-' + configuration.style);
        currentModal.addClass('modal-size-' + configuration.size);
        currentModal.attr('tabindex', '-1');
        currentModal.find(Identifiers.title).text(configuration.title);
        currentModal.find(Identifiers.close).on('click', () => {
            currentModal.modal('hide');
        });
        if (configuration.type === 'ajax') {
            const contentTarget = configuration.ajaxTarget ? configuration.ajaxTarget : Identifiers.body;
            const $loaderTarget = currentModal.find(contentTarget);
            Icons.getIcon('spinner-circle', Icons.sizes.default, null, null, Icons.markupIdentifiers.inline).then((icon) => {
                $loaderTarget.html('<div class="modal-loading">' + icon + '</div>');
                new AjaxRequest(configuration.content).get().then(async (response) => {
                    this.currentModal.find(contentTarget)
                        .empty()
                        .append(await response.raw().text());
                    if (configuration.ajaxCallback) {
                        configuration.ajaxCallback();
                    }
                    this.currentModal.trigger('modal-loaded');
                });
            });
        }
        else if (configuration.type === 'iframe') {
            currentModal.find(Identifiers.body).append(jQuery('<iframe />', {
                src: configuration.content,
                'name': 'modal_frame',
                'class': 'modal-iframe t3js-modal-iframe',
            }));
            currentModal.find(Identifiers.iframe).on('load', () => {
                currentModal.find(Identifiers.title).text(currentModal.find(Identifiers.iframe).get(0).contentDocument.title);
            });
        }
        else {
            if (typeof configuration.content === 'string') {
                configuration.content = jQuery('<p />').html(this.securityUtility.encodeHtml(configuration.content));
            }
            currentModal.find(Identifiers.body).append(configuration.content);
        }
        currentModal.on('shown.bs.modal', (e) => {
            const $me = jQuery(e.currentTarget);
            // focus the button which was configured as active button
            $me.find(Identifiers.footer).find('.t3js-active').first().focus();
            // Get Icons
            $me.find(Identifiers.iconPlaceholder).each((index, elem) => {
                Icons.getIcon(jQuery(elem).data('icon'), Icons.sizes.small, null, null, Icons.markupIdentifiers.inline).then((icon) => {
                    this.currentModal.find(Identifiers.iconPlaceholder + '[data-icon=' + jQuery(icon).data('identifier') + ']').replaceWith(icon);
                });
            });
        });
        // Remove modal from Modal.instances when hidden
        currentModal.on('hidden.bs.modal', (e) => {
            if (this.instances.length > 0) {
                const lastIndex = this.instances.length - 1;
                this.instances.splice(lastIndex, 1);
                this.currentModal = this.instances[lastIndex - 1];
            }
            currentModal.trigger('modal-destroyed');
            jQuery(e.currentTarget).remove();
            // Keep class modal-open on body tag as long as open modals exist
            if (this.instances.length > 0) {
                jQuery('body').addClass('modal-open');
            }
        });
        // When modal is opened/shown add it to Modal.instances and make it Modal.currentModal
        currentModal.on('show.bs.modal', (e) => {
            this.currentModal = jQuery(e.currentTarget);
            // Add buttons
            this.setButtons(configuration.buttons);
            this.instances.push(this.currentModal);
        });
        currentModal.on('modal-dismiss', (e) => {
            // Hide modal, the bs.modal events will clean up Modal.instances
            jQuery(e.currentTarget).modal('hide');
        });
        if (configuration.callback) {
            configuration.callback(currentModal);
        }
        return currentModal.modal();
    }
}
let modalObject = null;
try {
    if (parent && parent.window.TYPO3 && parent.window.TYPO3.Modal) {
        // fetch from parent
        // we need to trigger the event capturing again, in order to make sure this works inside iframes
        parent.window.TYPO3.Modal.initializeMarkupTrigger(document);
        modalObject = parent.window.TYPO3.Modal;
    }
    else if (top && top.TYPO3.Modal) {
        // fetch object from outer frame
        // we need to trigger the event capturing again, in order to make sure this works inside iframes
        top.TYPO3.Modal.initializeMarkupTrigger(document);
        modalObject = top.TYPO3.Modal;
    }
}
catch (_a) {
    // This only happens if the opener, parent or top is some other url (eg a local file)
    // which loaded the current window. Then the browser's cross domain policy jumps in
    // and raises an exception.
    // For this case we are safe and we can create our global object below.
}
if (!modalObject) {
    modalObject = new Modal(new SecurityUtility());
    // expose as global object
    TYPO3.Modal = modalObject;
}
var Modal$1 = modalObject;

export default Modal$1;
