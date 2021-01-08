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

import {UpdatingElement} from 'lit-element';

type UpdatingElementConstructor = new (...args: any[]) => UpdatingElement;

/**
 * Module: TYPO3/CMS/Backend/Module/IframeShim
 *
 * Provides iframe shim for elements that replace a former iframe,
 * providing a certain level of backwards compatibility for certain
 * iframe APIs.
 *
 * Usage:
 *
 * class MyElement extends IframeShim(LitElement) {
 *   …
 * }
 */
export function IframeShim<T extends UpdatingElementConstructor>(
  constructor: T
): T {
  return class IframeShim extends constructor {
    public contentWindow: { location: { href: string, reload: Function }, parent: Window };

    private _iframeShimUrl: HTMLAnchorElement;

    constructor(...args: any[]) {
      super(...args);

      // Setup iframe.contentWindow.location backwards compatibility, e.g.
      // for code that uses `top.list_frame.location.href = '…'`
      // see PHP method goto_altDoc()
      this.classList.add('t3js-scaffold-content-module-iframe');
      this.setAttribute('id', 'typo3-contentIframe');
      this.setAttribute('name', 'list_frame');
      this._iframeShimUrl = document.createElement('a');
      (window as any).list_frame = this.contentWindow = Object.create(Object.prototype, {
        location: {
          value: Object.create(Object.prototype, {
            href: {
              get: () => this.getAttribute('src'),
              set: (val) => {
                this.setAttribute('src', val);
                this.removeAttribute('module');
              }
            },
            reload: {
              value: () => {
                this.requestUpdate();
                //this.setAttribute('src', this.getAttribute('src'));
              }
            },
            replace: {
              value: (value: string) => {
                this.setAttribute('src', value);
                // iframe.contentWindow.location.replace() does not push
                // browser state automatically, therefore this change
                // should use pushState. @todo: Test code, where
                // this is actually used. (seems not to be used
                // for iframes in core)
                // @todo: this is a custom ModuleRouter property – decouple this somehow
                (this as any).decorate = true;
              }
            },
            hash: { get: () => this._iframeShimUrl.hash },
            host: { get: () => this._iframeShimUrl.host },
            hostname: { get: () => this._iframeShimUrl.hostname },
            origin: { get: () => this._iframeShimUrl.origin },
            password: { get: () => this._iframeShimUrl.password },
            pathname: { get: () => this._iframeShimUrl.pathname },
            port: { get: () => this._iframeShimUrl.port },
            protocol: { get: () => this._iframeShimUrl.protocol },
            search: { get: () => this._iframeShimUrl.search },
            username: { get: () => this._iframeShimUrl.username },
            toString: { value: () => this.getAttribute('src') },
          })
        },
        // For file list context menu actions, which use
        // `list_frame.document.location`
        document: {
          value: Object.create(Object.prototype, {
            location: {
              get: () => this.contentWindow.location
            }
          })
        },
        parent: {
          get: (): Window => window
        },
        // Used by IRRE ElementBrowser when inserting new elements
        postMessage: {
          value: (message: any, targetOrigin: string, transfer?: Transferable[]) => {
            const iframeModule = this.querySelector('typo3-iframe-module');
            let target = null;
            if (iframeModule) {
              target = iframeModule.shadowRoot.querySelector('iframe');
            }
            if (target) {
              target.contentWindow.postMessage(message, targetOrigin, transfer);
            } else {
              console.log('could not route postmessage', message, this);
            }
          }
        },
        focus: {
          value: () => {
            const iframeModule = this.querySelector('typo3-iframe-module');
            let target = null;
            if (iframeModule) {
              target = iframeModule.shadowRoot.querySelector('iframe');
            }
            if (target) {
              target.contentWindow.focus();
            }
          }
        },
      });
    }

    public attributeChangedCallback(name: string, oldval: string, newval: string): void {
      super.attributeChangedCallback(name, oldval, newval);
      if (name === 'src') {
        this._iframeShimUrl.href = newval;
      }
    }
  }
}
