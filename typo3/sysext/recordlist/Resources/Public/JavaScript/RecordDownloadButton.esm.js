import { SeverityEnum } from '../../../../backend/Resources/Public/JavaScript/Enum/Severity.esm.js';
import Severity from '../../../../backend/Resources/Public/JavaScript/Severity.esm.js';
import Modal from '../../../../backend/Resources/Public/JavaScript/Modal.esm.js';
import { __decorate } from '../../../../core/Resources/Public/JavaScript/Contrib/tslib.esm.js';
import { html as T } from '../../../../core/Resources/Public/JavaScript/Contrib/lit-html/lit-html.esm.js';
import { LitElement as h } from '../../../../core/Resources/Public/JavaScript/Contrib/lit-element/lit-element.esm.js';
import '../../../../core/Resources/Public/JavaScript/Contrib/lit/index.esm.js';
import { customElement as n } from '../../../../core/Resources/Public/JavaScript/Contrib/@lit/reactive-element/decorators/custom-element.esm.js';
import { property as e } from '../../../../core/Resources/Public/JavaScript/Contrib/@lit/reactive-element/decorators/property.esm.js';
import '../../../../core/Resources/Public/JavaScript/Contrib/lit/decorators.esm.js';
import { lll } from '../../../../core/Resources/Public/JavaScript/lit-helper.esm.js';

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
var Selectors;
(function (Selectors) {
    Selectors["formatSelector"] = ".t3js-record-download-format-selector";
    Selectors["formatOptions"] = ".t3js-record-download-format-option";
})(Selectors || (Selectors = {}));
/**
 * Module: TYPO3/CMS/Recordlist/RecordDownloadButton
 *
 * @example
 * <typo3-recordlist-record-download-button url="/url/to/configuration/form" title="Download records" ok="Download" close="Cancel">
 *   <button>Download records/button>
 * </typo3-recordlist-record-download-button>
 */
let RecordDownloadButton = class RecordDownloadButton extends h {
    constructor() {
        super();
        this.addEventListener('click', (e) => {
            e.preventDefault();
            this.showDownloadConfigurationModal();
        });
    }
    render() {
        return T `<slot></slot>`;
    }
    showDownloadConfigurationModal() {
        if (!this.url) {
            // Don't render modal in case no url is given
            return;
        }
        Modal.advanced({
            content: this.url,
            title: this.title || 'Download records',
            severity: SeverityEnum.notice,
            size: Modal.sizes.small,
            type: Modal.types.ajax,
            buttons: [
                {
                    text: this.close || lll('button.close') || 'Close',
                    active: true,
                    btnClass: 'btn-default',
                    name: 'cancel',
                    trigger: () => Modal.dismiss(),
                },
                {
                    text: this.ok || lll('button.ok') || 'Download',
                    btnClass: 'btn-' + Severity.getCssClass(SeverityEnum.info),
                    name: 'download',
                    trigger: () => {
                        const form = Modal.currentModal[0].querySelector('form');
                        form && form.submit();
                        Modal.dismiss();
                    }
                }
            ],
            ajaxCallback: () => {
                const formatSelect = Modal.currentModal[0].querySelector(Selectors.formatSelector);
                const formatOptions = Modal.currentModal[0].querySelectorAll(Selectors.formatOptions);
                if (formatSelect === null || !formatOptions.length) {
                    // Return in case elements do not exist in the ajax loaded modal content
                    return;
                }
                formatSelect.addEventListener('change', (e) => {
                    const selectetFormat = e.target.value;
                    formatOptions.forEach((option) => {
                        if (option.dataset.formatname !== selectetFormat) {
                            option.classList.add('hide');
                        }
                        else {
                            option.classList.remove('hide');
                        }
                    });
                });
            }
        });
    }
};
__decorate([
    e({ type: String })
], RecordDownloadButton.prototype, "url", void 0);
__decorate([
    e({ type: String })
], RecordDownloadButton.prototype, "title", void 0);
__decorate([
    e({ type: String })
], RecordDownloadButton.prototype, "ok", void 0);
__decorate([
    e({ type: String })
], RecordDownloadButton.prototype, "close", void 0);
RecordDownloadButton = __decorate([
    n('typo3-recordlist-record-download-button')
], RecordDownloadButton);
