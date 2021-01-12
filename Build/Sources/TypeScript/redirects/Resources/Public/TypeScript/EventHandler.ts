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

import {AjaxResponse} from 'TYPO3/CMS/Core/Ajax/AjaxResponse';
import AjaxRequest = require('TYPO3/CMS/Core/Ajax/AjaxRequest');
import NotificationService = require('TYPO3/CMS/Backend/Notification');
import DeferredAction = require('TYPO3/CMS/Backend/ActionButton/DeferredAction');

interface SlugChangedPayload {
  correlations: SlugChangedPayloadCorrelations;
  autoUpdateSlugs: boolean;
  autoCreateRedirects: boolean;
}

interface SlugChangedPayloadCorrelations {
  correlationIdSlugUpdate: string;
  correlationIdRedirectCreation: string;
}

/**
 * Module: TYPO3/CMS/Redirects/EventHandler
 * @exports TYPO3/CMS/Redirects/EventHandler
 */
class EventHandler {
  public constructor() {
    document.addEventListener(
      'typo3:redirects:slugChanged',
      (evt: CustomEvent) => this.onSlugChanged(evt.detail),
    );
  }

  public onSlugChanged(payload: SlugChangedPayload): void {
    let actions: any = [];
    const correlations = payload.correlations;

    if (payload.autoUpdateSlugs) {
      actions.push({
        label: TYPO3.lang['notification.redirects.button.revert_update'],
        action: new DeferredAction(() => this.revert([
          correlations.correlationIdSlugUpdate,
          correlations.correlationIdRedirectCreation,
        ])),
      });
    }
    if (payload.autoCreateRedirects) {
      actions.push({
        label: TYPO3.lang['notification.redirects.button.revert_redirect'],
        action: new DeferredAction(() => this.revert([
          correlations.correlationIdRedirectCreation,
        ])),
      });
    }

    let title = TYPO3.lang['notification.slug_only.title'];
    let message = TYPO3.lang['notification.slug_only.message'];
    if (payload.autoCreateRedirects) {
      title = TYPO3.lang['notification.slug_and_redirects.title'];
      message = TYPO3.lang['notification.slug_and_redirects.message'];
    }
    NotificationService.info(
      title,
      message,
      0,
      actions,
    );
  }

  private revert(correlationIds: string[]): Promise<AjaxResponse> {
    const request = new AjaxRequest(TYPO3.settings.ajaxUrls.redirects_revert_correlation).withQueryArguments({
      correlation_ids: correlationIds
    }).get();

    request.then(async (response: AjaxResponse): Promise<void> => {
      const json = await response.resolve();
      if (json.status === 'ok') {
        NotificationService.success(json.title, json.message);
      }
      if (json.status === 'error') {
        NotificationService.error(json.title, json.message);
      }
    }).catch((): void => {
      NotificationService.error(TYPO3.lang.redirects_error_title, TYPO3.lang.redirects_error_message);
    });
    return request;
  }
}

export = new EventHandler();
