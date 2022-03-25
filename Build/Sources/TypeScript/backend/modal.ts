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

import {Modal as BootstrapModal} from 'bootstrap';
import {html, css, nothing, LitElement, TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators';
import {unsafeHTML} from 'lit/directives/unsafe-html';
import {until} from 'lit/directives/until';
import {styleMap} from 'lit/directives/style-map';
import RegularEvent from '@typo3/core/event/regular-event';
import '@typo3/backend/element/icon-element';
import '@typo3/backend/element/spinner-element';
import $ from 'jquery';
import {AjaxResponse} from '@typo3/core/ajax/ajax-response';
import {AbstractAction} from './action-button/abstract-action';
import {ModalResponseEvent} from '@typo3/backend/modal-interface';
import {SeverityEnum} from './enum/severity';
import AjaxRequest from '@typo3/core/ajax/ajax-request';
import SecurityUtility from '@typo3/core/security-utility';
import Icons from './icons';
import Severity from './severity';

enum Identifiers {
  modal = '.t3js-modal',
  content = '.t3js-modal-content',
  close = '.t3js-modal-close',
  body = '.t3js-modal-body',
  footer = '.t3js-modal-footer',
  //iframe = '.t3js-modal-iframe',
}

enum Sizes {
  small = 'small',
  default = 'default',
  medium = 'medium',
  large = 'large',
  full = 'full',
}

enum Styles {
  default = 'default',
  light = 'light',
  dark = 'dark',
}

enum Types {
  default = 'default',
  ajax = 'ajax',
  iframe = 'iframe',
}

interface Button {
  text: string;
  active: boolean;
  btnClass: string;
  name: string;
  // breaking
  trigger: (e: Event) => {};
  dataAttributes: { [key: string]: string };
  // new
  customIdentifier: string;
  icon: string;
  action: AbstractAction;
}

interface Configuration {
  type: Types;
  title: string;
  // @todo remove/replace JQuery
  content: string | JQuery;
  severity: SeverityEnum;
  buttons: Array<Button>;
  style: Styles;
  size: Sizes;
  additionalCssClasses: Array<string>;
  callback: Function;
  ajaxCallback: Function;
  // @todo deprecate
  ajaxTarget: string;
}

const securityUtility: SecurityUtility = new SecurityUtility();

@customElement('typo3-backend-modal')
export class ModalElement extends LitElement {
  @property({type: String, reflect: true}) title: string = '';
  @property({type: String, reflect: true}) type: Types = Types.default;
  @property({type: String, reflect: true}) severity: SeverityEnum = SeverityEnum.notice;
  @property({type: String, reflect: true}) variant: Styles = Styles.default;
  @property({type: String, reflect: true}) size: Sizes = Sizes.default;
  @property({type: Number, reflect: true}) zindex: Number = null;
  @property({type: Array}) additionalCssClasses: Array<string> = [];
  @property({type: Array, attribute: false}) buttons: Array<Button> = [];

  @property({type: String, attribute: false}) content: string = '';

  @state() activeButton: Button = null;

  public bootstrapModal: BootstrapModal = null;
  public ajaxCallback: Function = null;
  public userData: { [key: string]: any } = {};

  public hideModal(): void {
    if (this.bootstrapModal) {
      this.bootstrapModal.hide();
    }
  }

  public trigger(event: string): void {
    this.dispatchEvent(new CustomEvent(event, {bubbles: true}));
  }

  public createRenderRoot(): HTMLElement | ShadowRoot {
    // @todo Switch to Shadow DOM once Bootstrap CSS style can be applied correctly
    // const renderRoot = this.attachShadow({mode: 'open'});
    return this;
  }

  protected firstUpdated(): void {
    this.bootstrapModal = new BootstrapModal(this.renderRoot.querySelector('.t3js-modal'), {});
    this.bootstrapModal.show();
  }

  protected render(): TemplateResult {
    const styles: any = {};
    if (this.zindex !== null) {
      styles.zIndex = this.zindex;
    }
    return html`
      <div style=${styleMap(styles)} class="t3js-modal modal fade ${additionalCssClasses.join(' ')} modal-type-${this.type} modal-severity-${Severity.getCssClass(this.severity)} modal-style-${this.variant} modal-size-${this.size}" tabindex="-1">
          <div class="modal-dialog">
              <div class="t3js-modal-content modal-content">
                  <div class="modal-header">
                      <h4 class="t3js-modal-title modal-title">${this.title}</h4>
                      <button class="t3js-modal-close close" @click=${() => this.bootstrapModal.hide()}>
                          <span aria-hidden="true">
                              <typo3-backend-icon identifier="close"></typo3-backend-icon>
                          </span>
                          <span class="sr-only"></span>
                      </button>
                  </div>
                  <div class="t3js-modal-body modal-body">${this.renderModalBody()}</div>
                  ${this.buttons.length === 0 ? nothing : html`
                    <div class="t3js-modal-footer modal-footer">
                      ${this.buttons.map(button => this.renderModalButton(button))}
                    </div>
                  `}
              </div>
          </div>
      </div>
    `;
  }

  private _buttonClick(event: Event, button: Button): void {
    if (button.action) {
      this.activeButton = button;
      button.action.execute(event.currentTarget).then((): void => this.bootstrapModal.hide());
    } else if (button.trigger) {
      button.trigger(event);
    }
    (event.currentTarget as HTMLButtonElement).dispatchEvent(new CustomEvent('button.clicked', {bubbles: true}));
  }

  private renderAjaxBody(): TemplateResult {
    const htmlResponse = new AjaxRequest(this.content as string).get()
      .then(async (response: AjaxResponse): Promise<TemplateResult> => {
        const htmlResponse = await response.raw().text();
        if (this.ajaxCallback) {
          this.ajaxCallback();
        }
        this.updateComplete.then(() => this.dispatchEvent(new CustomEvent('modal-loaded')));
        return html`${unsafeHTML(htmlResponse)}`;
      })
      .catch(async (response: AjaxResponse): Promise<TemplateResult> => {
        const htmlResponse = await response.raw().text();
        if (htmlResponse) {
          return html`${unsafeHTML(htmlRespoonse)}`;
        } else {
          return html`<p><strong>Oops, received a ${response.response.status} response from </strong> <span class="text-break">${this.content as string}</span>.</p>`;
        }
      });
    return html`${until(htmlResponse, html`<typo3-backend-spinner></typo3-backend-spinner>`)}`;
  }

  private renderModalBody(): TemplateResult {
    if (this.type === 'ajax') {
      return this.renderAjaxBody();
    }

    if (this.type === 'iframe') {
      return html`<iframe src="${this.content}" name="modal_frame" class="modal-iframe t3js-modal-iframe" @load=${(e) => this.title = e.currentTarget.contentDocument.title}></iframe>`;
    }

    if (this.type === 'string') {
      return html`<p>${unsafeHTML(securityUtility.encodeHtml(this.content))}</p>`;
    }

    //return nothing;
    return html``;
  }

  private renderModalButton(button: Button): TemplateResult {
    return html`
      <!-- @todo: this breaks buttons.dataAttributes -->
      <button
          class="btn ${button.btnClass} ${button.active ? 't3js-active' : ''} ${this.activeButton && this.activeButton !== button ? 'disabled' : ''}"
          ?name=${button.name || null}
          @click=${(e: Event) => this._buttonClick(e, button)}>

          <!-- @todo: why have button texts been added with this.securityUtility.encodeHtml(button.text, false) instead of .textContent? -->
          ${button.icon ? html`<typo3-backend-icon identifier="${button.icon}"></typo3-backend-icon>` : nothing}
          <span>${button.text}</span>

      </button>
    `;
  }
}

/**
 * Module: @typo3/backend/modal
 * API for modal windows powered by Twitter Bootstrap.
 */
class Modal {
  public readonly sizes: any = Sizes;
  public readonly styles: any = Styles;
  public readonly types: any = Types;
  public currentModal: ModalElement = null;
  private instances: Array<ModalElement> = [];

  private defaultConfiguration: Configuration = {
    type: Types.default,
    title: 'Information',
    content: 'No content provided, please check your <code>Modal</code> configuration.',
    severity: SeverityEnum.notice,
    buttons: [],
    style: Styles.default,
    size: Sizes.default,
    additionalCssClasses: [],
    callback: $.noop(),
    ajaxCallback: $.noop(),
    ajaxTarget: null,
  };

  private static resolveEventNameTargetElement(evt: Event): HTMLElement | null {
    const target = evt.target as HTMLElement;
    const currentTarget = evt.currentTarget as HTMLElement;
    if (target.dataset && target.dataset.eventName) {
      return target;
    } else if (currentTarget.dataset && currentTarget.dataset.eventName) {
      return currentTarget;
    }
    return null;
  }

  private static createModalResponseEventFromElement(element: HTMLElement, result: boolean): ModalResponseEvent | null {
    if (!element || !element.dataset.eventName) {
      return null;
    }
    return new CustomEvent(
      element.dataset.eventName, {
        bubbles: true,
        detail: { result, payload: element.dataset.eventPayload || null }
      });
  }

  constructor() {
    document.addEventListener('modal-dismiss', this.dismiss);
    this.initializeMarkupTrigger(document);
  }

  /**
   * Close the current open modal
   */
  public dismiss(): void {
    if (this.currentModal) {
      this.currentModal.bootstrapModal.hide();
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
   * @returns {ModalElement}
   */
  public confirm(
    title: string,
    content: string | JQuery,
    severity: SeverityEnum = SeverityEnum.warning,
    buttons: Array<Object> = [],
    additionalCssClasses?: Array<string>,
  ): ModalElement {
    if (buttons.length === 0) {
      buttons.push(
        {
          text: $(this).data('button-close-text') || TYPO3.lang['button.cancel'] || 'Cancel',
          active: true,
          btnClass: 'btn-default',
          name: 'cancel',
        },
        {
          text: $(this).data('button-ok-text') || TYPO3.lang['button.ok'] || 'OK',
          btnClass: 'btn-' + Severity.getCssClass(severity),
          name: 'ok',
        },
      );
    }

    return this.advanced({
      title,
      content,
      severity,
      buttons,
      additionalCssClasses,
      callback: (currentModal: ModalElement): void => {
        currentModal.addEventListener('button.clicked', (e: Event): void => {
          if (e.target.getAttribute('name') === 'cancel') {
            currentModal.dispatchEvent(new CustomEvent('confirm.button.cancel', {bubbles: true}));
          } else if (e.target.getAttribute('name') === 'ok') {
            currentModal.dispatchEvent(new CustomEvent('confirm.button.ok', {bubbles: true}));
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
   * @returns {ModalElement}
   */
  public loadUrl(
    title: string,
    severity: SeverityEnum = SeverityEnum.info,
    buttons: Array<Object>,
    url: string,
    callback?: Function,
    target?: string,
  ): ModalElement {
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
   * @returns {ModalElement}
   */
  public show(
    title: string,
    content: string | JQuery,
    severity: SeverityEnum = SeverityEnum.info,
    buttons?: Array<Object>,
    additionalCssClasses?: Array<string>,
  ): ModalElement {
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
  public advanced(configuration: { [key: string]: any }): ModalElement {
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
    configuration.buttons = <Array<Button>>configuration.buttons || this.defaultConfiguration.buttons;
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

    return this.generate(<Configuration>configuration);
  }

  public setButtons(buttons: Array<Button>): ModalElement {
    this.currentModal.buttons = buttons;
    return this.currentModal;
  }

  /**
   * Initialize markup with data attributes
   *
   * @param {HTMLDocument} theDocument
   */
  private initializeMarkupTrigger(theDocument: HTMLDocument): void {
    const modalTrigger = (evt: Event, element: HTMLElement): void => {
      evt.preventDefault();
      const content = element.dataset.bsContent || 'Are you sure?';
      const severity = typeof SeverityEnum[element.dataset.severity] !== 'undefined'
        ? SeverityEnum[element.dataset.severity]
        : SeverityEnum.info;
      let url = element.dataset.url || null;
      if (url !== null) {
        const separator = url.includes('?') ? '&' : '?';
        // @todo: issue with dash-style to camelCase because of element.dataset?
        // @todo: replace $.param
        const params = $.param({data: element.dataset});
        url = url + separator + params;
      }
      this.advanced({
        type: url !== null ? Types.ajax : Types.default,
        title: element.dataset.title || 'Alert',
        content: url !== null ? url : content,
        severity,
        buttons: [
          {
            text: element.dataset.buttonCloseText || TYPO3.lang['button.close'] || 'Close',
            active: true,
            btnClass: 'btn-default',
            trigger: (): void => {
              this.currentModal.hideModal();
              const eventNameTarget = Modal.resolveEventNameTargetElement(evt);
              const event = Modal.createModalResponseEventFromElement(eventNameTarget, false);
              if (event !== null) {
                // dispatch event at the element having `data-event-name` declared
                eventNameTarget.dispatchEvent(event);
              }
            },
          },
          {
            text: element.dataset.buttonOkText || TYPO3.lang['button.ok'] || 'OK',
            btnClass: 'btn-' + Severity.getCssClass(severity),
            trigger: (): void => {
              this.currentModal.hideModal();
              const eventNameTarget = Modal.resolveEventNameTargetElement(evt);
              const event = Modal.createModalResponseEventFromElement(eventNameTarget, true);
              if (event !== null) {
                // dispatch event at the element having `data-event-name` declared
                eventNameTarget.dispatchEvent(event);
              }
              let targetLocation = element.dataset.uri || element.dataset.href || element.getAttribute('href');
              if (targetLocation && targetLocation !== '#') {
                (evt.target as HTMLElement).ownerDocument.location.href = targetLocation;
              }
              if (element.getAttribute('type') === 'submit') {
                // Submit a possible form in case the trigger has type=submit and is child of a form
                (element.closest('form') as HTMLFormElement)?.submit();
                if (element.tagName === 'BUTTON' && element.hasAttribute('form')) {
                  // Submit a possible form in case the trigger is a BUTTON, having a
                  // form attribute set to a valid form identifier in the ownerDocument.
                  ((evt.target as HTMLElement).ownerDocument.querySelector('form#' + element.getAttribute('form')) as HTMLFormElement)?.submit();
                }
              }
              if (element.dataset.targetForm) {
                // Submit a possible form in case the trigger has the data-target-form
                // attribute set to a valid form identifier in the ownerDocument.
                ((evt.target as HTMLElement).ownerDocument.querySelector('form#' + element.dataset.targetForm) as HTMLFormElement)?.submit();
              }
            },
          },
        ],
      });
    };
    new RegularEvent('click', modalTrigger).delegateTo(theDocument, '.t3js-modal-trigger');
  }

  /**
   * @param {Configuration} configuration
   */
  private generate(configuration: Configuration): ModalElement {
    const currentModal = document.createElement('typo3-backend-modal') as ModalElement;

    currentModal.type = configuration.type;
    currentModal.severity = configuration.severity;
    currentModal.variant = configuration.style;
    currentModal.size = configuration.size;
    currentModal.additionalCssClasses = configuration.additionalCssClasses;
    currentModal.buttons = configuration.buttons;

    currentModal.addEventListener('shown.bs.modal', (e: Event): void => {
      const me = <HTMLElement> e.currentTarget;
      //const $backdrop = $me.prev('.modal-backdrop');

      // We use 1000 as the overall base to circumvent a stuttering UI as Bootstrap uses a z-index of 1040 for backdrops
      // on initial rendering - this will clash again when at least four modals are open, which is fine and should never happen
      const baseZIndex = 1000 + (10 * this.instances.length);
      const backdropZIndex = baseZIndex - 10;
      currentModal.zindex = baseZIndex;
      // @todo
      //$backdrop.css('z-index', backdropZIndex);

      // focus the button which was configured as active button
      (currentModal.querySelector(`${Identifiers.footer} .t3js-active`) as HTMLInputElement)?.focus();
    });

    // Remove modal from Modal.instances when hidden
    currentModal.addEventListener('hide.bs.modal', (): void => {
      if (this.instances.length > 0) {
        const lastIndex = this.instances.length - 1;
        this.instances.splice(lastIndex, 1);
        this.currentModal = this.instances[lastIndex - 1];
      }
    });

    currentModal.addEventListener('hidden.bs.modal', (e: Event): void => {
      currentModal.trigger('modal-destroyed');
      $(e.currentTarget).remove();
      // Keep class modal-open on body tag as long as open modals exist
      if (this.instances.length > 0) {
        $('body').addClass('modal-open');
      }
    });

    // @todo: when should the modal be attached?
    document.body.appendChild(currentModal);

    console.log(currentModal);

    // When modal is opened/shown add it to Modal.instances and make it Modal.currentModal
    currentModal.addEventListener('show.bs.modal', (e: Event): void => {
      this.currentModal = (e.currentTarget as Element).parentNode;
      // Add buttons
      //this.setButtons(configuration.buttons);
      this.instances.push(this.currentModal);
    });
    currentModal.addEventListener('modal-dismiss', (): void => {
      // Hide modal, the bs.modal events will clean up Modal.instances
      currentModal.hideModal();
    });


    if (configuration.callback) {
      configuration.callback(currentModal);
    }

    return currentModal;
  }
}

let modalObject: Modal = null;
try {
  if (parent && parent.window.TYPO3 && parent.window.TYPO3.Modal) {
    // fetch from parent
    // we need to trigger the event capturing again, in order to make sure this works inside iframes
    parent.window.TYPO3.Modal.initializeMarkupTrigger(document);
    modalObject = parent.window.TYPO3.Modal;
  } else if (top && top.TYPO3.Modal) {
    // fetch object from outer frame
    // we need to trigger the event capturing again, in order to make sure this works inside iframes
    top.TYPO3.Modal.initializeMarkupTrigger(document);
    modalObject = top.TYPO3.Modal;
  }
} catch {
  // This only happens if the opener, parent or top is some other url (eg a local file)
  // which loaded the current window. Then the browser's cross domain policy jumps in
  // and raises an exception.
  // For this case we are safe and we can create our global object below.
}

if (!modalObject) {
  modalObject = new Modal();

  // expose as global object
  TYPO3.Modal = modalObject;
}

export default modalObject;
