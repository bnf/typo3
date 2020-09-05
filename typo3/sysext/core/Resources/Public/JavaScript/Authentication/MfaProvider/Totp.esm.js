import Modal from '../../../../../../backend/Resources/Public/JavaScript/Modal.esm.js';
import { __decorate } from '../../Contrib/tslib.esm.js';
import { html as T, render as V } from '../../Contrib/lit-html/lit-html.esm.js';
import { LitElement as h } from '../../Contrib/lit-element/lit-element.esm.js';
import '../../Contrib/lit/index.esm.js';
import { customElement as n } from '../../Contrib/@lit/reactive-element/decorators/custom-element.esm.js';
import { property as e } from '../../Contrib/@lit/reactive-element/decorators/property.esm.js';
import '../../Contrib/lit/decorators.esm.js';

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
    Selectors["modalBody"] = ".t3js-modal-body";
})(Selectors || (Selectors = {}));
let MfaTotpUrlButton = class MfaTotpUrlButton extends h {
    constructor() {
        super();
        this.addEventListener('click', (e) => {
            e.preventDefault();
            this.showTotpAuthUrlModal();
        });
    }
    render() {
        return T `<slot></slot>`;
    }
    showTotpAuthUrlModal() {
        Modal.advanced({
            title: this.title,
            buttons: [
                {
                    trigger: () => Modal.dismiss(),
                    text: this.ok || 'OK',
                    active: true,
                    btnClass: 'btn-default',
                    name: 'ok'
                }
            ],
            callback: (currentModal) => {
                V(T `
            <p>${this.description}</p>
            <pre>${this.url}</pre>
          `, currentModal[0].querySelector(Selectors.modalBody));
            }
        });
    }
};
__decorate([
    e({ type: String })
], MfaTotpUrlButton.prototype, "url", void 0);
__decorate([
    e({ type: String })
], MfaTotpUrlButton.prototype, "title", void 0);
__decorate([
    e({ type: String })
], MfaTotpUrlButton.prototype, "description", void 0);
__decorate([
    e({ type: String })
], MfaTotpUrlButton.prototype, "ok", void 0);
MfaTotpUrlButton = __decorate([
    n('typo3-mfa-totp-url-info-button')
], MfaTotpUrlButton);
