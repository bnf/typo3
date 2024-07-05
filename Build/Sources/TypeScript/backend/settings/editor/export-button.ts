import DocumentService from '@typo3/core/document-service';
import AjaxRequest from '@typo3/core/ajax/ajax-request';
import { copyToClipboard } from '@typo3/backend/copy-to-clipboard';
import Notification from '@typo3/backend/notification';
import { lll } from '@typo3/core/lit-helper';

class ExportButton {
  constructor() {
    this.registerEvents();
  }

  protected async registerEvents() {
    await DocumentService.ready();

    document.querySelectorAll('.t3js-sitesettings-export').forEach(
      (link: HTMLLinkElement) => link.addEventListener('click', async (e) => {
        const form = (document.getElementsByName(link.dataset.form)[0] || null) as HTMLFormElement;
        if (!form) {
          return;
        }

        e.preventDefault();
        const formData = new FormData(form);
        const response = await new AjaxRequest(link.getAttribute('href')).post(formData);

        const result = await response.resolve();
        if (typeof result.yaml === 'string') {
          copyToClipboard(result.yaml);
        } else {
          console.warn('Value can not be copied to clipboard.', typeof result.yaml);
          Notification.error(lll('copyToClipboard.error'));
        }
      })
    );
  }
}

export default new ExportButton();
