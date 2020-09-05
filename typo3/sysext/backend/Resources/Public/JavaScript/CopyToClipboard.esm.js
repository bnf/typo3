import { __decorate } from '../../../../core/Resources/Public/JavaScript/Contrib/tslib.esm.js';
import { html as T } from '../../../../core/Resources/Public/JavaScript/Contrib/lit-html/lit-html.esm.js';
import { LitElement as h } from '../../../../core/Resources/Public/JavaScript/Contrib/lit-element/lit-element.esm.js';
import '../../../../core/Resources/Public/JavaScript/Contrib/lit/index.esm.js';
import { customElement as n } from '../../../../core/Resources/Public/JavaScript/Contrib/@lit/reactive-element/decorators/custom-element.esm.js';
import { property as e } from '../../../../core/Resources/Public/JavaScript/Contrib/@lit/reactive-element/decorators/property.esm.js';
import '../../../../core/Resources/Public/JavaScript/Contrib/lit/decorators.esm.js';
import NotificationService from './Notification.esm.js';
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
/**
 * Module: TYPO3/CMS/Backend/CopyToClipboard
 *
 * This module can be used to copy a given text to
 * the operating systems' clipboard.
 *
 * @example
 * <typo3-copy-to-clipboard text="some text">
 *   <button>Copy to clipboard</button>
 * </typo3-copy-to-clipboard>
 */
let CopyToClipboard = class CopyToClipboard extends h {
    constructor() {
        super();
        this.addEventListener('click', (e) => {
            e.preventDefault();
            this.copyToClipboard();
        });
    }
    render() {
        return T `<slot></slot>`;
    }
    copyToClipboard() {
        if (typeof this.text !== 'string' || !this.text.length) {
            console.warn('No text for copy to clipboard given.');
            NotificationService.error(lll('copyToClipboard.error'));
            return;
        }
        if (navigator.clipboard) {
            navigator.clipboard.writeText(this.text).then(() => {
                NotificationService.success(lll('copyToClipboard.success'), '', 1);
            }).catch(() => {
                NotificationService.error(lll('copyToClipboard.error'));
            });
        }
        else {
            const textarea = document.createElement('textarea');
            textarea.value = this.text;
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();
            try {
                document.execCommand('copy')
                    ? NotificationService.success(lll('copyToClipboard.success'), '', 1)
                    : NotificationService.error(lll('copyToClipboard.error'));
            }
            catch (err) {
                NotificationService.error(lll('copyToClipboard.error'));
            }
            document.body.removeChild(textarea);
        }
    }
};
__decorate([
    e({ type: String })
], CopyToClipboard.prototype, "text", void 0);
CopyToClipboard = __decorate([
    n('typo3-copy-to-clipboard')
], CopyToClipboard);
