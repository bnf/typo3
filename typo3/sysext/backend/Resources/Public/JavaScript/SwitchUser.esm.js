import AjaxRequest from '../../../../core/Resources/Public/JavaScript/Ajax/AjaxRequest.esm.js';
import { __decorate } from '../../../../core/Resources/Public/JavaScript/Contrib/tslib.esm.js';
import { html as T } from '../../../../core/Resources/Public/JavaScript/Contrib/lit-html/lit-html.esm.js';
import { LitElement as h } from '../../../../core/Resources/Public/JavaScript/Contrib/lit-element/lit-element.esm.js';
import '../../../../core/Resources/Public/JavaScript/Contrib/lit/index.esm.js';
import { customElement as n } from '../../../../core/Resources/Public/JavaScript/Contrib/@lit/reactive-element/decorators/custom-element.esm.js';
import { property as e } from '../../../../core/Resources/Public/JavaScript/Contrib/@lit/reactive-element/decorators/property.esm.js';
import '../../../../core/Resources/Public/JavaScript/Contrib/lit/decorators.esm.js';
import NotificationService from './Notification.esm.js';

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
var Modes;
(function (Modes) {
    Modes["switch"] = "switch";
    Modes["exit"] = "exit";
})(Modes || (Modes = {}));
/**
 * Module: TYPO3/CMS/Backend/SwitchUser
 *
 * @example
 * <typo3-switch-user targetUser="123" mode="switch">
 *   <button>Switch user</button>
 * </typo3-switch-user>
 */
let SwitchUser = class SwitchUser extends h {
    constructor() {
        super();
        this.mode = Modes.switch;
        this.addEventListener('click', (e) => {
            e.preventDefault();
            if (this.mode === Modes.switch) {
                this.handleSwitchUser();
            }
            else if (this.mode === Modes.exit) {
                this.handleExitSwitchUser();
            }
        });
    }
    render() {
        return T `<slot></slot>`;
    }
    handleSwitchUser() {
        if (!this.targetUser) {
            // Invalid request without target user
            NotificationService.error('Switching to user went wrong.');
            return;
        }
        (new AjaxRequest(TYPO3.settings.ajaxUrls.switch_user)).post({
            targetUser: this.targetUser,
        }).then(async (response) => {
            const data = await response.resolve();
            if (data.success === true && data.url) {
                top.window.location.href = data.url;
            }
            else {
                NotificationService.error('Switching to user went wrong.');
            }
        });
    }
    handleExitSwitchUser() {
        (new AjaxRequest(TYPO3.settings.ajaxUrls.switch_user_exit)).post({}).then(async (response) => {
            const data = await response.resolve();
            if (data.success === true && data.url) {
                top.window.location.href = data.url;
            }
            else {
                NotificationService.error('Exiting current user went wrong.');
            }
        });
    }
};
__decorate([
    e({ type: String })
], SwitchUser.prototype, "targetUser", void 0);
__decorate([
    e({ type: Modes })
], SwitchUser.prototype, "mode", void 0);
SwitchUser = __decorate([
    n('typo3-backend-switch-user')
], SwitchUser);
