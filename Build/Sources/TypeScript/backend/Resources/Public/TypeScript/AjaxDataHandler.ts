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

import {
  AjaxDataHandlerRecord,
  AjaxDataHandlerInstruction,
  AjaxDataHandlerProcessMessage,
  AjaxDataHandlerProcessEventDict
} from './AjaxDataHandler/Interfaces';
import {BroadcastMessage} from 'TYPO3/CMS/Backend/BroadcastMessage';
import {AjaxResponse} from 'TYPO3/CMS/Core/Ajax/AjaxResponse';
import AjaxRequest = require('TYPO3/CMS/Core/Ajax/AjaxRequest');
import {SeverityEnum} from './Enum/Severity';
import MessageInterface from './AjaxDataHandler/MessageInterface';
import ResponseInterface from './AjaxDataHandler/ResponseInterface';
import $ from 'jquery';
import broadcastService = require('TYPO3/CMS/Backend/BroadcastService');
import Icons = require('./Icons');
import Modal = require('./Modal');
import Notification = require('./Notification');
import Viewport = require('./Viewport');
import SecurityUtility = require('TYPO3/CMS/Core/SecurityUtility');
import {GenericKeyValue} from 'TYPO3/CMS/Core/Ajax/InputTransformer';

enum Identifiers {
  hide = '.t3js-record-hide',
  delete = '.t3js-record-delete',
  icon = '.t3js-icon',
}

/**
 * Module: TYPO3/CMS/Backend/AjaxDataHandler
 * Javascript functions to work with AJAX and interacting with Datahandler
 * through \TYPO3\CMS\Backend\Controller\SimpleDataHandlerController->processAjaxRequest (record_process route)
 */
class AjaxDataHandler {
  private readonly securityUtility: SecurityUtility;
  private readonly processToken: string;

  private isInitialized = false;

  /**
   * Refresh the page tree
   */
  private static refreshPageTree(): void {
    if (Viewport.NavigationContainer && Viewport.NavigationContainer.PageTree) {
      Viewport.NavigationContainer.PageTree.refreshTree();
    }
  }

  /**
   * AJAX call to record_process route (SimpleDataHandlerController->processAjaxRequest)
   * returns a jQuery Promise to work with
   *
   * @param {string | Array<string>} params
   * @returns {Promise<AjaxResponse>}
   */
  private static call(params: string | Array<string> | GenericKeyValue): Promise<AjaxResponse> {
    return (new AjaxRequest(TYPO3.settings.ajaxUrls.record_process))
      .withQueryArguments(params)
      .get();
  }

  private static resolveElementReference($table: JQuery<HTMLElement>, $row: JQuery<HTMLElement>): AjaxDataHandlerRecord {
    return {
      table: $table.data('table'),
      uid: $row.data('uid')
    };
  }

  private static broadcastProcessSucceeded(message: AjaxDataHandlerProcessMessage): void {
    broadcastService.post(
      new BroadcastMessage('ajax-data-handler', 'process-succeeded', message)
    );
  }

  private static broadcastProcessFailed(message: AjaxDataHandlerProcessMessage): void {
    broadcastService.post(
      new BroadcastMessage('ajax-data-handler', 'process-failed', message)
    );
  }

  constructor() {
    broadcastService.listen();
    $((): void => {
      this.initialize();
    });
    this.securityUtility = new SecurityUtility();
    this.processToken = this.securityUtility.getRandomHexValue(16);
    document.addEventListener(
      'typo3:ajax-data-handler:instruction@' + this.processToken,
      this.onInstruction.bind(this)
    );
  }

  /**
   * Generic function to call from the outside the script and validate directly showing errors
   *
   * @param {string | Array<string> | GenericKeyValue} parameters
   * @param {AjaxDataHandlerProcessEventDict} eventDict Dictionary used as event detail. This is private API yet.
   * @returns {Promise<any>}
   */
  public process(parameters: string | Array<string> | GenericKeyValue, eventDict?: AjaxDataHandlerProcessEventDict): Promise<ResponseInterface> {
    const promise = AjaxDataHandler.call(parameters);
    return promise
      .then(async (response: AjaxResponse): Promise<ResponseInterface> => {
        const result = await response.resolve('json') as ResponseInterface;
        if (result.hasErrors) {
          // show error messages as notifications
          this.handleErrors(result);
        }
        AjaxDataHandler.broadcastProcessSucceeded({
          ...eventDict,
          parameters,
          processToken: this.processToken,
          response: await response.dereference(),
          hasErrors: result.hasErrors,
          result,
        });
        return result;
      })
      .catch(async (response: AjaxResponse) => {
        AjaxDataHandler.broadcastProcessFailed({
          ...eventDict,
          parameters,
          processToken: this.processToken,
          response: await response.dereference(),
          hasErrors: true
        });
        // allow consuming components to catch and handle it again
        throw response;
      });
  }

  // TODO: Many extensions rely on this behavior but it's misplaced in AjaxDataHandler. Move into Recordlist.ts and deprecate in v11.
  // (extract visual/DOM-related parts to Recordlist or any other new component; keep processing flow in this class)
  private initialize(): void {
    if (this.isInitialized) {
      return;
    }
    this.isInitialized = true;
    // HIDE/UNHIDE: click events for all action icons to hide/unhide
    $(document).on('click', Identifiers.hide, (evt: JQueryEventObject): void => {
      evt.preventDefault();
      const $anchorElement = $(evt.currentTarget);
      this.processToggleRecord($anchorElement);
    });

    // DELETE: click events for all action icons to delete
    $(document).on('click', Identifiers.delete, (evt: JQueryEventObject): void => {
      evt.preventDefault();
      const $anchorElement = $(evt.currentTarget);
      $anchorElement.tooltip('hide');
      this.confirmDeleteRecord($anchorElement);
    });
  }

  /**
   * Event handler for instructions handed in to this component.
   * Thus, other external, 3rd party components can respond to events
   * they subscribed to without actually depending on or importing the
   * specific implementation of AjaxDataHandler.
   *
   * `processToken` is used as weak security precaution, ensuring these
   * instructions are actually a response to previous events AjaxDataHandler
   * dispatched.
   *
   * @param {CustomEvent} evt
   */
  private onInstruction(evt: CustomEvent): void {
    const message: AjaxDataHandlerInstruction = evt.detail.payload;
    // ignore instruction in case it's not for this instance orl
    // corresponding element could not be determined
    if (message.processToken !== this.processToken) {
      return;
    }
    const parameters = message.parameters;
    const element = this.findElement(message.elementIdentifier);
    switch (message.action) {
      case 'delete':
        if (element) {
          this.processDeleteRecord($(element));
        } else if (parameters) {
          this.process(parameters);
        }
        break;
      case 'toggle':
        if (element) {
          this.processToggleRecord($(element));
        } else  if (parameters) {
          this.process(parameters);
        }
        break;
      case 'revert':
        // @todo Add possibility to revert to previous state (stop spinning icon)
        break;
      default:
    }
  }

  /**
   * Toggle row visibility after record has been changed
   *
   * @param {JQuery} $rowElement
   */
  private toggleRow($rowElement: JQuery): void {
    const $anchorElement = $rowElement.find(Identifiers.hide);
    const table = $anchorElement.closest('table[data-table]').data('table');
    const params = $anchorElement.data('params');
    let nextParams;
    let nextState;
    let iconName;

    if ($anchorElement.data('state') === 'hidden') {
      nextState = 'visible';
      nextParams = params.replace('=0', '=1');
      iconName = 'actions-edit-hide';
    } else {
      nextState = 'hidden';
      nextParams = params.replace('=1', '=0');
      iconName = 'actions-edit-unhide';
    }
    $anchorElement.data('state', nextState).data('params', nextParams);

    // Update tooltip title
    $anchorElement.tooltip('hide').one('hidden.bs.tooltip', (): void => {
      const nextTitle = $anchorElement.data('toggleTitle');
      // Bootstrap Tooltip internally uses only .attr('data-original-title')
      $anchorElement
        .data('toggleTitle', $anchorElement.attr('data-original-title'))
        .attr('data-original-title', nextTitle);
    });

    const $iconElement = $anchorElement.find(Identifiers.icon);
    Icons.getIcon(iconName, Icons.sizes.small).then((icon: string): void => {
      $iconElement.replaceWith(icon);
    });

    // Set overlay for the record icon
    const $recordIcon = $rowElement.find('.col-icon ' + Identifiers.icon);
    if (nextState === 'hidden') {
      Icons.getIcon('miscellaneous-placeholder', Icons.sizes.small, 'overlay-hidden').then((icon: string): void => {
        $recordIcon.append($(icon).find('.icon-overlay'));
      });
    } else {
      $recordIcon.find('.icon-overlay').remove();
    }

    $rowElement.fadeTo('fast', 0.4, (): void => {
      $rowElement.fadeTo('fast', 1);
    });
    if (table === 'pages') {
      AjaxDataHandler.refreshPageTree();
    }
  }

  /**
   * Toggle record by given element (icon in table)
   *
   * @param {JQuery} $anchorElement
   */
  private processToggleRecord($anchorElement: JQuery): void {
    const params = $anchorElement.data('params');
    const $table = $anchorElement.closest('table[data-table]');
    const $rowElement = $anchorElement.closest('tr[data-uid]');
    const elementReference = AjaxDataHandler.resolveElementReference($table, $rowElement);

    // add a spinner
    const $iconElement = $anchorElement.find(Identifiers.icon);
    this._showSpinnerIcon($iconElement);

    // make the AJAX call to toggle the visibility
    const eventData = {
      ...elementReference,
      action: 'toggle',
      component: 'ajax-data-handler',
      elementIdentifier: this.identifyElement($anchorElement.get(0)),
    };
    this.process(params, eventData)
      .then((result: ResponseInterface): void => {
        if (result.hasErrors) {
          return;
        }
        // adjust overlay icon
        this.toggleRow($rowElement);
      })
      .catch(async (response: AjaxResponse): Promise<void> => {
        // @todo maybe stop spinner?
      });
  }

  /**
   * Show confirmation dialog before actually deleting a record.
   *
   * @param {JQuery} $anchorElement
   */
  private confirmDeleteRecord($anchorElement: JQuery): void {
    const $modal = Modal.confirm($anchorElement.data('title'), $anchorElement.data('message'), SeverityEnum.warning, [
      {
        text: $anchorElement.data('button-close-text') || TYPO3.lang['button.cancel'] || 'Cancel',
        active: true,
        btnClass: 'btn-default',
        name: 'cancel',
      },
      {
        text: $anchorElement.data('button-ok-text') || TYPO3.lang['button.delete'] || 'Delete',
        btnClass: 'btn-warning',
        name: 'delete',
      },
    ]);
    $modal.on('button.clicked', (e: JQueryEventObject): void => {
      if (e.target.getAttribute('name') === 'cancel') {
        Modal.dismiss();
      } else if (e.target.getAttribute('name') === 'delete') {
        Modal.dismiss();
        this.processDeleteRecord($anchorElement);
      }
    });
  }

  /**
   * Delete record by given element (icon in table)
   *
   * @param {JQuery} $anchorElement
   */
  private processDeleteRecord($anchorElement: JQuery): void {
    const params = $anchorElement.data('params');

    // add a spinner
    let $iconElement = $anchorElement.find(Identifiers.icon);
    this._showSpinnerIcon($iconElement);

    const $table = $anchorElement.closest('table[data-table]');
    let $rowElements = $anchorElement.closest('tr[data-uid]');
    const elementReference = AjaxDataHandler.resolveElementReference($table, $rowElements);

    // make the AJAX call to toggle the visibility
    const eventData = {
      ...elementReference,
      action: 'delete',
      component: 'ajax-data-handler',
      elementIdentifier: this.identifyElement($anchorElement.get(0)),
    };
    this.process(params, eventData)
      .then((result: ResponseInterface): void => {
        // revert to the old class
        Icons.getIcon('actions-edit-delete', Icons.sizes.small).then((icon: string): void => {
          $iconElement = $anchorElement.find(Identifiers.icon);
          $iconElement.replaceWith(icon);
        });
        if (result.hasErrors) {
          return;
        }
        const $panel = $anchorElement.closest('.panel');
        const $panelHeading = $panel.find('.panel-heading');
        const $translatedRowElements = $table
          .find('[data-l10nparent=' + elementReference.uid + ']')
          .closest('tr[data-uid]');
        $rowElements = $rowElements.add($translatedRowElements);

        $rowElements.fadeTo('slow', 0.4, (): void => {
          $rowElements.slideUp('slow', (): void => {
            $rowElements.remove();
            if ($table.find('tbody tr').length === 0) {
              $panel.slideUp('slow');
            }
          });
        });
        if ($anchorElement.data('l10parent') === '0' || $anchorElement.data('l10parent') === '') {
          const count = Number($panelHeading.find('.t3js-table-total-items').html());
          $panelHeading.find('.t3js-table-total-items').text(count - 1);
        }
        if (elementReference.table === 'pages') {
          AjaxDataHandler.refreshPageTree();
        }
      })
      .catch(async (response: AjaxResponse): Promise<void> => {
        // @todo maybe stop spinner?
      });
  }

  /**
   * Handle the errors from result object
   *
   * @param {ResponseInterface} result
   */
  private handleErrors(result: ResponseInterface): void {
    $.each(result.messages, (position: number, message: MessageInterface): void => {
      Notification.error(message.title, message.message);
    });
  }

  /**
   * Replace the given icon with a spinner icon
   *
   * @param {Object} $iconElement
   * @private
   *
   * @todo Add possibility to revert to previous non-spinning state
   */
  private _showSpinnerIcon($iconElement: JQuery): void {
    Icons.getIcon('spinner-circle-dark', Icons.sizes.small).then((icon: string): void => {
      $iconElement.replaceWith(icon);
    });
  }

  private identifyElement(element: HTMLElement): string {
    const name = 'identifier' + this.processToken;
    let identifier: string = element.dataset[name];
    if (!identifier) {
      identifier = this.securityUtility.getRandomHexValue(16);
      element.dataset[name] = identifier;
    }
    return identifier;
  }

  private findElement(identifier: string): HTMLElement | null {
    if (!identifier) {
      return null;
    }
    const selector = '[data-identifier' + this.processToken + '="' + identifier + '"]';
    return document.querySelector(selector);
  }
}

export = new AjaxDataHandler();
