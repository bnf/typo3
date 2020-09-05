define(['../../../../core/Resources/Public/JavaScript/Contrib/jquery/jquery', '../../../../backend/Resources/Public/JavaScript/Notification'], function (jquery, Notification) { 'use strict';

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
            jquery('.' + prefix).each((index, element) => {
                if (jquery(element).prop('checked')) {
                    buttonDisable = false;
                }
            });
            if (prefix === 'check') {
                jquery('#updateLinkList').prop('disabled', buttonDisable);
            }
            else {
                jquery('#refreshLinkList').prop('disabled', buttonDisable);
            }
        }
        /**
         * Registers listeners
         */
        initializeEvents() {
            jquery('.refresh').on('click', () => {
                this.toggleActionButton('refresh');
            });
            jquery('.check').on('click', () => {
                this.toggleActionButton('check');
            });
            jquery('.t3js-update-button').on('click', (e) => {
                const $element = jquery(e.currentTarget);
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
