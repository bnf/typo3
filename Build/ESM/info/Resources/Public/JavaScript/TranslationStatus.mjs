import jQuery from '../../../../core/Resources/Public/JavaScript/Contrib/jquery.mjs';

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
 * Module: TYPO3/CMS/Info/TranslationStatus
 */
class TranslationStatus {
    constructor() {
        this.registerEvents();
    }
    registerEvents() {
        jQuery('input[type="checkbox"][data-lang]').on('change', this.toggleNewButton);
    }
    /**
     * @param {JQueryEventObject} e
     */
    toggleNewButton(e) {
        const $me = jQuery(e.currentTarget);
        const languageId = parseInt($me.data('lang'), 10);
        const $newButton = jQuery('.t3js-language-new-' + languageId);
        const $selected = jQuery('input[type="checkbox"][data-lang="' + languageId + '"]:checked');
        const additionalArguments = [];
        $selected.each((index, element) => {
            additionalArguments.push('cmd[pages][' + element.dataset.uid + '][localize]=' + languageId);
        });
        const updatedHref = $newButton.data('editUrl') + '&' + additionalArguments.join('&');
        $newButton.attr('href', updatedHref);
        $newButton.toggleClass('disabled', $selected.length === 0);
    }
}
var TranslationStatus$1 = new TranslationStatus();

export default TranslationStatus$1;
