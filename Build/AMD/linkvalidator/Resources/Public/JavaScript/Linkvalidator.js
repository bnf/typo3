define(['jquery', '../../../../backend/Resources/Public/JavaScript/Notification'], function ($, Notification) { 'use strict';

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
    /**
     * Module: TYPO3/CMS/Linkvalidator/Linkvalidator
     */
    class Linkvalidator {
        constructor() {
            this.initializeEvents();
        }
        toggleActionButton(prefix) {
            let buttonDisable = true;
            $__default['default']('.' + prefix).each((index, element) => {
                if ($__default['default'](element).prop('checked')) {
                    buttonDisable = false;
                }
            });
            if (prefix === 'check') {
                $__default['default']('#updateLinkList').prop('disabled', buttonDisable);
            }
            else {
                $__default['default']('#refreshLinkList').prop('disabled', buttonDisable);
            }
        }
        /**
         * Registers listeners
         */
        initializeEvents() {
            $__default['default']('.refresh').on('click', () => {
                this.toggleActionButton('refresh');
            });
            $__default['default']('.check').on('click', () => {
                this.toggleActionButton('check');
            });
            $__default['default']('.t3js-update-button').on('click', (e) => {
                const $element = $__default['default'](e.currentTarget);
                const name = $element.attr('name');
                let message = 'Event triggered';
                if (name === 'refreshLinkList' || name === 'updateLinkList') {
                    message = $element.data('notification-message');
                }
                Notification.success(message);
            });
        }
    }
    var Linkvalidator$1 = new Linkvalidator();

    return Linkvalidator$1;

});
