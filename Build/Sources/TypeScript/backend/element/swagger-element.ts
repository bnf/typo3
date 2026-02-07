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

import { html, css, LitElement, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { SwaggerUIBundle /*, SwaggerUIStandalonePreset */ } from 'swagger-ui-dist';

@customElement('typo3-backend-swagger')
export class SwaggerElement extends LitElement {

  // Ugly way to fix dark-mode support, shamelessy copied from
  // https://github.com/go-gitea/gitea/blob/b95fd7e13ed4063d123b488df74a98cbfcfed85b/web_src/css/standalone/swagger.css#L32
  // Explanation:
  //  * invert() inverts black and white *and* colors (applies hue rotation to colors)
  //  * hue-rotate(180deg) "reverts" the color rotation applied by the invert, but preserves
  //    the black/white switch
  static override styles = css`
    @media (prefers-color-scheme: dark) {
      .swagger-ui {
        filter: invert(88%) hue-rotate(180deg);
      }
      .swagger-ui .microlight {
        filter: invert(100%) hue-rotate(180deg);
      }
    }
    .swagger-ui button.json-schema-2020-12-accordion,
    .swagger-ui button.json-schema-2020-12-expand-deep-button {
      background: none;
    }
  `;

  @property({ type: String }) url: string;

  protected override firstUpdated(): void {
    const ui = SwaggerUIBundle({
      url: this.url,
      requestInterceptor: req => ({
        ...req,
        headers: {
          ...(req.headers ?? {}),
          Authorization: 'Bearer ' + top.document.body.dataset.apiToken,
        },
      }),
      showMutatedRequest: false,
      domNode: this.renderRoot.firstElementChild as HTMLElement,
      oauth2RedirectUrl: 'TODO',
      presets: [
        SwaggerUIBundle.presets.apis,
      ],
      plugins: [
        SwaggerUIBundle.plugins.DownloadUrl
      ],
      layout: 'BaseLayout',
    });

    ui.initOAuth({
      clientId: 'd099d1dd-11f2-4914-aa94-df0b1dbe1dc8',
      clientSecret: '',
      realm: 'realm',
      appName: 'app',
      scopeSeparator: ' ',
      additionalQueryStringParams: {},
      usePkceWithAuthorizationCodeGrant: true,
    });
  }

  protected override render(): TemplateResult {
    return html`
      <div></div>
      <link rel="stylesheet" href=${import.meta.url.replace('JavaScript/element/swagger-element.js', 'Css/Contrib/swagger-ui.css')} media="all" nonce=${(window as any).litNonce as string}>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'typo3-backend-swagger': SwaggerElement;
  }
}
