import jQuery from '../../../../core/Resources/Public/JavaScript/Contrib/jquery/jquery.esm.js';
import NotificationService from '../../../../backend/Resources/Public/JavaScript/Notification.esm.js';

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
        jQuery('.' + prefix).each((index, element) => {
            if (jQuery(element).prop('checked')) {
                buttonDisable = false;
            }
        });
        if (prefix === 'check') {
            jQuery('#updateLinkList').prop('disabled', buttonDisable);
        }
        else {
            jQuery('#refreshLinkList').prop('disabled', buttonDisable);
        }
    }
    /**
     * Registers listeners
     */
    initializeEvents() {
        jQuery('.refresh').on('click', () => {
            this.toggleActionButton('refresh');
        });
        jQuery('.check').on('click', () => {
            this.toggleActionButton('check');
        });
        jQuery('.t3js-update-button').on('click', (e) => {
            const $element = jQuery(e.currentTarget);
            const name = $element.attr('name');
            let message = 'Event triggered';
            if (name === 'refreshLinkList' || name === 'updateLinkList') {
                message = $element.data('notification-message');
            }
            NotificationService.success(message);
        });
    }
}
var Linkvalidator$1 = new Linkvalidator();

export default Linkvalidator$1;
