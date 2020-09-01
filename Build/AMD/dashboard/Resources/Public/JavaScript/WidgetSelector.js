define(['../../../../backend/Resources/Public/JavaScript/Enum/Severity', 'jquery', '../../../../backend/Resources/Public/JavaScript/Modal', '../../../../core/Resources/Public/JavaScript/Event/RegularEvent'], function (Severity, $, Modal, RegularEvent) { 'use strict';

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    var $__default = /*#__PURE__*/_interopDefaultLegacy($);

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
    class WidgetSelector {
        constructor() {
            this.selector = '.js-dashboard-addWidget';
            this.initialize();
        }
        initialize() {
            new RegularEvent('click', function (e) {
                e.preventDefault();
                const configuration = {
                    type: Modal.types.default,
                    title: this.dataset.modalTitle,
                    size: Modal.sizes.medium,
                    severity: Severity.SeverityEnum.notice,
                    content: $__default['default'](document.getElementById('widgetSelector').innerHTML),
                    additionalCssClasses: ['dashboard-modal'],
                    callback: (currentModal) => {
                        currentModal.on('click', 'a.dashboard-modal-item-block', (e) => {
                            currentModal.trigger('modal-dismiss');
                        });
                    },
                };
                Modal.advanced(configuration);
            }).delegateTo(document, this.selector);
        }
    }
    var WidgetSelector$1 = new WidgetSelector();

    return WidgetSelector$1;

});
