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

import Modal from '@typo3/backend/modal';
import { SeverityEnum } from '@typo3/backend/enum/severity';
import RegularEvent from '@typo3/core/event/regular-event';

class WidgetRemover {

  private readonly selector: string = '.js-dashboard-remove-widget';

  constructor() {
    this.initialize();
  }

  public initialize(): void {
    new RegularEvent('click', function (this: HTMLButtonElement, e: Event): void {
      e.preventDefault();
      const form = this.form;
      const href = this.getAttribute('href');
      const { modalTitle, modalQuestion, modalCancel, modalOk } = this.dataset;
      if (!href || !modalTitle || !modalQuestion || !modalCancel || !modalOk) {
        throw new Error('Missing "href" or "data-modal-*" attributes on widget-remover.');
      }
      const modal = Modal.confirm(
        modalTitle,
        modalQuestion,
        SeverityEnum.warning, [
          {
            text: modalCancel,
            active: true,
            btnClass: 'btn-default',
            name: 'cancel',
            trigger: (e, modal) => modal.hideModal(),
          },
          {
            text: modalOk,
            btnClass: 'btn-warning',
            name: 'delete',
            trigger: () => window.location.href = href,
          },
        ]
      );

      modal.addEventListener('button.clicked', (e: Event): void => {
        const target = e.target as HTMLButtonElement;
        if (target.getAttribute('name') === 'delete') {
          form.requestSubmit();
        }
        modal.hideModal();
      });
    }).delegateTo(document, this.selector);
  }
}

export default new WidgetRemover();
