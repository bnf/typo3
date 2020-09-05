import RegularEvent from '../../../../core/Resources/Public/JavaScript/Event/RegularEvent.esm.js';
import documentService from '../../../../core/Resources/Public/JavaScript/DocumentService.esm.js';

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
        this.searchForm = document.querySelector('#ConfigurationView');
        this.searchField = this.searchForm.querySelector('input[name="searchString"]');
        this.searchResultShown = ('' !== this.searchField.value);
        documentService.ready().then(() => {
            // Respond to browser related clearable event
            new RegularEvent('search', () => {
                if (this.searchField.value === '' && this.searchResultShown) {
                    this.searchForm.submit();
                }
            }).bindTo(this.searchField);
        });
        if (self.location.hash) {
            // scroll page down, so the just opened subtree is visible after reload and not hidden by doc header
            // Determine scrollTo position, either first ".active" (search) or latest clicked element
            let scrollElement = document.querySelector(self.location.hash);
            if (document.querySelector('.list-tree .active ')) {
                scrollElement = document.querySelector('.list-tree .active ');
            }
            else {
                document.querySelector(self.location.hash).parentElement.parentElement.classList.add('active');
            }
            scrollElement.scrollIntoView({ block: 'center' });
        }
    }
}
var ConfigurationView$1 = new ConfigurationView();

export default ConfigurationView$1;
