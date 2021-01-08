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
    //const iFrame = this.resolveIFrameElement();
    /*
    // abort, if no IFRAME can be found
    if (iFrame === null) {
      deferred = $.Deferred();
      deferred.reject();
      return deferred;
    }
   */
    if (!(interactionRequest instanceof InteractionRequest)) {
      interactionRequest = new ClientRequest('typo3.setUrl', null);
    }
    deferred = this.consumerScope.invoke(
      new TriggerRequest('typo3.setUrl', interactionRequest),
    );
    deferred.then((): void => {
      Loader.start();

      /*
      const el = document.createElement('typo3-iframe-module');
      //el.setAttribute('params', params);
      el.setAttribute('moduleData', JSON.stringify({link: urlToLoad}));
      el.setAttribute('name', 'list_frame');

      console.log('content container.setUrl', el);
      (window as any).list_frame = el;

      $(ScaffoldIdentifierEnum.contentModule)
        .children().remove();
      $(ScaffoldIdentifierEnum.contentModule).get(0).appendChild(el);
      */

      $(ScaffoldIdentifierEnum.contentModuleIframe)
        .attr('src', urlToLoad)
        .one('load', (): void => {
          Loader.finish();
        });
      // @todo use module event
      Loader.finish();
      //});
    });
    return deferred;
  }

  /**
   * @returns {string}
   */
  public getUrl(): string {
    return $(ScaffoldIdentifierEnum.contentModuleIframe).attr('src');
  }

  public unloadHandler(url: string): void {
    // @todo: Find a better, short name for describing that the
    // browser already pushed a new (internal) state into the
    // history (HEADS UP: which will *not* fire a popstate event!),
    // which mean sthat users of this event should not use
    // pushState(), but rather replaceState)(.
    const decorate = true;
    const event = new CustomEvent(
      'typo3-module-load',
      { detail: { url, decorate } }
    );

    console.log('sending out an url change ' + url);
    document.dispatchEvent(event);
  }

  public loadHandler(url: string, module: string | null): void {
    const event = new CustomEvent(
      'typo3-module-loaded',
      { detail: { url, module } }
    );

    const moduleExists = module !== null && $('#' + module + '.t3js-modulemenu-action').length > 0;
    console.log('sending out a module change ' + url + ' module: ' + module + ' module-exists: ' + (moduleExists ? 'yes' : 'no'));
    document.dispatchEvent(event);
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
      this.addUnloadHandler(iframe, this.unloadHandler);
      this.addLoadHandler(iframe, this.loadHandler);
      this.isInitialized = true;
    }
    return iframe;
  }

  private addUnloadHandler(iframe: HTMLIFrameElement, callback: Function): void {
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

    iframe.addEventListener('load', () => attachUnload());
    attachUnload();
  }

  private addLoadHandler(iframe: HTMLIFrameElement, callback: Function): void {
    // Load handler to notify about module change
    iframe.addEventListener('load', () => {
      const module = iframe.contentDocument.body.querySelector('.module[data-module-name]');
      const moduleName = module ? ( module.getAttribute('data-module-name') || null) : null;
      callback(iframe.contentWindow.location.href, moduleName);
    });
  }
}

export = ContentContainer;
