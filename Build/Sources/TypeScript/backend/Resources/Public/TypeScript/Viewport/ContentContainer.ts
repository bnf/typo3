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

import {ScaffoldIdentifierEnum} from '../Enum/Viewport/ScaffoldIdentifier';
import {AbstractContainer} from './AbstractContainer';
import $ from 'jquery';
import ClientRequest = require('../Event/ClientRequest');
import InteractionRequest = require('../Event/InteractionRequest');
import Loader = require('./Loader');
import Utility = require('../Utility');
import TriggerRequest = require('../Event/TriggerRequest');
import {BroadcastMessage} from 'TYPO3/CMS/Backend/BroadcastMessage';
import BroadcastService = require('TYPO3/CMS/Backend/BroadcastService');

class ContentContainer extends AbstractContainer {
  private isInitialized = false;

  public get(): Window {
    return (<HTMLIFrameElement>$(ScaffoldIdentifierEnum.contentModuleIframe)[0]).contentWindow;
  }

  /**
   * @param {InteractionRequest} interactionRequest
   * @returns {JQueryDeferred<TriggerRequest>}
   */
  public beforeSetUrl(interactionRequest: InteractionRequest): JQueryDeferred<TriggerRequest> {
    return this.consumerScope.invoke(
      new TriggerRequest('typo3.beforeSetUrl', interactionRequest),
    );
  }

  /**
   * @param {String} urlToLoad
   * @param {InteractionRequest} [interactionRequest]
   * @returns {JQueryDeferred<TriggerRequest>}
   */
  public setUrl(urlToLoad: string, interactionRequest?: InteractionRequest): JQueryDeferred<TriggerRequest> {
    let deferred: JQueryDeferred<TriggerRequest>;
    const iFrame = this.resolveIFrameElement();
    // abort, if no IFRAME can be found
    if (iFrame === null) {
      deferred = $.Deferred();
      deferred.reject();
      return deferred;
    }
    if (!(interactionRequest instanceof InteractionRequest)) {
      interactionRequest = new ClientRequest('typo3.setUrl', null);
    }
    deferred = this.consumerScope.invoke(
      new TriggerRequest('typo3.setUrl', interactionRequest),
    );
    deferred.then((): void => {
      Loader.start();
      $(ScaffoldIdentifierEnum.contentModuleIframe)
        .attr('src', urlToLoad)
        .one('load', (): void => {
          Loader.finish();
        });
    });
    return deferred;
  }

  /**
   * @returns {string}
   */
  public getUrl(): string {
    return $(ScaffoldIdentifierEnum.contentModuleIframe).attr('src');
  }

  public loadHandler(url: string): void {
    const message = new BroadcastMessage(
      'navigation',
      'contentchange',
      { url: url }
    );

    console.log('sending out an url change ' + url);
    BroadcastService.post(message, true);
  }

  /**
   * @param {InteractionRequest} interactionRequest
   * @returns {JQueryDeferred<{}>}
   */
  public refresh(interactionRequest?: InteractionRequest): JQueryDeferred<{}> {
    let deferred;
    const iFrame = this.resolveIFrameElement();
    // abort, if no IFRAME can be found
    if (iFrame === null) {
      deferred = $.Deferred();
      deferred.reject();
      return deferred;
    }
    deferred = this.consumerScope.invoke(
      new TriggerRequest('typo3.refresh', interactionRequest),
    );
    deferred.then((): void => {
      iFrame.contentWindow.location.reload();
    });
    return deferred;
  }

  public getIdFromUrl(): number {
    if (this.getUrl) {
      return parseInt(Utility.getParameterFromUrl(this.getUrl(), 'id'), 10);
    }
    return 0;
  }

  private resolveIFrameElement(): HTMLIFrameElement {
    const $iFrame = $(ScaffoldIdentifierEnum.contentModuleIframe + ':first');
    if ($iFrame.length === 0) {
      return null;
    }
    let iframe = <HTMLIFrameElement>$iFrame.get(0);
    if (!this.isInitialized) {
      this.addHandler(iframe, this.loadHandler);
      this.isInitialized = true;
    }
    return iframe;
  }

  private addHandler(iframe: HTMLIFrameElement, callback: Function): void {
    let unloadHandler = function () {
      // Timeout needed because the URL changes immediately after
      // the `unload` event is dispatched.
      setTimeout(function () {
        callback(iframe.contentWindow.location.href);
      }, 0);
    };

    function attachUnload() {
      // Remove the unloadHandler in case it was already attached.
      // Otherwise, the change will be dispatched twice.
      iframe.contentWindow.removeEventListener('unload', unloadHandler);
      iframe.contentWindow.addEventListener('unload', unloadHandler);
    }

    iframe.addEventListener('load', attachUnload);
    attachUnload();
  }
}

export = ContentContainer;
