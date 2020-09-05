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
 * Module: TYPO3/CMS/Backend/SiteInlineActions
 * Site configuration backend module FormEngine inline:
 * Override inline 'create' and 'details' route to point to SiteInlineAjaxController
 */
class SiteInlineActions {
    constructor() {
        documentService.ready().then(() => {
            TYPO3.settings.ajaxUrls.record_inline_details = TYPO3.settings.ajaxUrls.site_configuration_inline_details;
            TYPO3.settings.ajaxUrls.record_inline_create = TYPO3.settings.ajaxUrls.site_configuration_inline_create;
        });
    }
}
var SiteInlineActions$1 = new SiteInlineActions();

export default SiteInlineActions$1;
