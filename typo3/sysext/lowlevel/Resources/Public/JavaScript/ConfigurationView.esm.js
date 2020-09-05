import $ from '../../../../core/Resources/Public/JavaScript/Contrib/jquery.esm.js';
import '../../../../backend/Resources/Public/JavaScript/Input/Clearable.esm.js';

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
 * Module: TYPO3/CMS/Lowlevel/ConfigurationView
 * JavaScript for Configuration View
 */
class ConfigurationView {
    constructor() {
        this.searchField = document.querySelector('input[name="searchString"]');
        this.searchResultShown = ('' !== this.searchField.value);
        // make search field clearable
        this.searchField.clearable({
            onClear: (input) => {
                if (this.searchResultShown) {
                    input.closest('form').submit();
                }
            },
        });
        if (self.location.hash) {
            // scroll page down, so the just opened subtree is visible after reload and not hidden by doc header
            $('html, body').scrollTop((document.documentElement.scrollTop || document.body.scrollTop) - 80);
        }
    }
}
var ConfigurationView$1 = new ConfigurationView();

export default ConfigurationView$1;
