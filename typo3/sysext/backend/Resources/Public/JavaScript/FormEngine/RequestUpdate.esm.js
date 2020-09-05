import { __decorate } from '../../../../../core/Resources/Public/JavaScript/Contrib/tslib.esm.js';
import { LitElement as h } from '../../../../../core/Resources/Public/JavaScript/Contrib/lit-element/lit-element.esm.js';
import '../../../../../core/Resources/Public/JavaScript/Contrib/lit/index.esm.js';
import { customElement as n } from '../../../../../core/Resources/Public/JavaScript/Contrib/@lit/reactive-element/decorators/custom-element.esm.js';
import { property as e } from '../../../../../core/Resources/Public/JavaScript/Contrib/@lit/reactive-element/decorators/property.esm.js';
import '../../../../../core/Resources/Public/JavaScript/Contrib/lit/decorators.esm.js';
import FormEngine from '../FormEngine.esm.js';

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
var UpdateMode;
(function (UpdateMode) {
    UpdateMode["ask"] = "ask";
    UpdateMode["enforce"] = "enforce";
})(UpdateMode || (UpdateMode = {}));
const selectorConverter = {
    fromAttribute(selector) {
        return document.querySelectorAll(selector);
    }
};
let RequestUpdate = class RequestUpdate extends h {
    constructor() {
        super(...arguments);
        this.mode = UpdateMode.ask;
        this.requestFormEngineUpdate = () => {
            const askForUpdate = this.mode === UpdateMode.ask;
            FormEngine.requestFormEngineUpdate(askForUpdate);
        };
    }
    connectedCallback() {
        super.connectedCallback();
        for (let field of this.fields) {
            field.addEventListener('change', this.requestFormEngineUpdate);
        }
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        for (let field of this.fields) {
            field.removeEventListener('change', this.requestFormEngineUpdate);
        }
    }
};
__decorate([
    e({ type: String, attribute: 'mode' })
], RequestUpdate.prototype, "mode", void 0);
__decorate([
    e({ attribute: 'field', converter: selectorConverter })
], RequestUpdate.prototype, "fields", void 0);
RequestUpdate = __decorate([
    n('typo3-formengine-updater')
], RequestUpdate);
