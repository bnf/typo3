import jQuery from '../../../../core/Resources/Public/JavaScript/Contrib/jquery.mjs';
import Client from './Storage/Client.mjs';
import '../../../../core/Resources/Public/JavaScript/Contrib/bootstrap.mjs';
import BrowserSession from './Storage/BrowserSession.mjs';

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
 * Module: TYPO3/CMS/Backend/Tabs
 * @exports TYPO3/CMS/Backend/Tabs
 */
class Tabs {
    constructor() {
        this.storeLastActiveTab = true;
        const that = this;
        jQuery(() => {
            jQuery('.t3js-tabs').each(function () {
                const $tabContainer = jQuery(this);
                that.storeLastActiveTab = $tabContainer.data('storeLastTab') === 1;
                const currentActiveTab = that.receiveActiveTab($tabContainer.attr('id'));
                if (currentActiveTab) {
                    $tabContainer.find('a[href="' + currentActiveTab + '"]').tab('show');
                }
                $tabContainer.on('show.bs.tab', (e) => {
                    if (that.storeLastActiveTab) {
                        const id = e.currentTarget.id;
                        const target = e.target.hash;
                        that.storeActiveTab(id, target);
                    }
                });
            });
        });
        // Remove legacy values from localStorage
        Client.unsetByPrefix('tabs-');
    }
    /**
     * Resolve timestamp
     */
    static getTimestamp() {
        return Math.round((new Date()).getTime() / 1000);
    }
    /**
     * Receive active tab from storage
     *
     * @param {string} id
     * @returns {string}
     */
    receiveActiveTab(id) {
        return BrowserSession.get(id) || '';
    }
    /**
     * Set active tab to storage
     *
     * @param {string} id
     * @param {string} target
     */
    storeActiveTab(id, target) {
        BrowserSession.set(id, target);
    }
}
var Tabs$1 = new Tabs();

export default Tabs$1;
