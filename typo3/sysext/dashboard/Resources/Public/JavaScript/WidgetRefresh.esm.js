import { __decorate } from '../../../../core/Resources/Public/JavaScript/Contrib/tslib.esm.js';
import { html as T } from '../../../../core/Resources/Public/JavaScript/Contrib/lit-html/lit-html.esm.js';
import { LitElement as h } from '../../../../core/Resources/Public/JavaScript/Contrib/lit-element/lit-element.esm.js';
import '../../../../core/Resources/Public/JavaScript/Contrib/lit/index.esm.js';
import { customElement as n } from '../../../../core/Resources/Public/JavaScript/Contrib/@lit/reactive-element/decorators/custom-element.esm.js';
import '../../../../core/Resources/Public/JavaScript/Contrib/lit/decorators.esm.js';

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
    Selectors["dashboardItem"] = ".dashboard-item";
})(Selectors || (Selectors = {}));
let WidgetRefresh = class WidgetRefresh extends h {
    constructor() {
        super();
        this.addEventListener('click', (e) => {
            e.preventDefault();
            this.closest(Selectors.dashboardItem).dispatchEvent(new Event('widgetRefresh', { bubbles: true }));
            this.querySelector('button').blur();
        });
    }
    render() {
        return T `<slot></slot>`;
    }
};
WidgetRefresh = __decorate([
    n('typo3-dashboard-widget-refresh')
], WidgetRefresh);
