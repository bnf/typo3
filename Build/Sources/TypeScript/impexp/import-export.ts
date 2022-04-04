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

import $ from 'jquery';
import Modal from '@typo3/backend/modal';

/**
 * Module: @typo3/impexp/import-export
 * JavaScript to handle confirm windows in the Import/Export module
 * @exports @typo3/impexp/import-export
 */
class ImportExport {
  constructor() {
    $((): void => {
      $(document).on('click', '.t3js-confirm-trigger', (e: JQueryEventObject): void => {
        const $button = $(e.currentTarget);
        const modal = Modal.confirm($button.data('title'), $button.data('message'))
        modal.addEventListener('confirm.button.ok', (): void => {
          $('#t3js-submit-field')
            .attr('name', $button.attr('name'))
            .closest('form').trigger('submit');
          modal.hideModal();
        })
        modal.addEventListener('confirm.button.cancel', (): void => {
          modal.hideModal();
        });
      });

      $('.t3js-impexp-toggledisabled').on('click', (): void => {
        const $checkboxes = $('table.t3js-impexp-preview tr[data-active="hidden"] input.t3js-exclude-checkbox');
        if ($checkboxes.length) {
          const $firstCheckbox = $checkboxes.get(0) as HTMLInputElement;
          $checkboxes.prop('checked', !$firstCheckbox.checked);
        }
      });
    });
  }
}

export default new ImportExport();
