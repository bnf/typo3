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
 * Module: TYPO3/CMS/Tstemplate/TypoScriptObjectBrowser
 * JavaScript for TypoScript Object Browser
 * @exports TYPO3/CMS/Tstemplate/TypoScriptObjectBrowser
 */
class TypoScriptObjectBrowser {
    constructor() {
        this.searchField = document.querySelector('input[name="search_field"]');
        this.searchResultShown = ('' !== this.searchField.value);
        this.searchField.clearable({
            onClear: (input) => {
                if (this.searchResultShown) {
                    input.closest('form').submit();
                }
            },
        });
        if (self.location.hash) {
            window.scrollTo(window.pageXOffset, window.pageYOffset - 40);
        }
    }
}
var TypoScriptObjectBrowser$1 = new TypoScriptObjectBrowser();

export default TypoScriptObjectBrowser$1;
