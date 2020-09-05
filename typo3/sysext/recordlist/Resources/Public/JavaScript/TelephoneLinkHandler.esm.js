import jQuery from '../../../../core/Resources/Public/JavaScript/Contrib/jquery/jquery.esm.js';
import LinkBrowser from './LinkBrowser.esm.js';

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
 * Module: TYPO3/CMS/Recordlist/TelephoneLinkHandler
 * @exports TYPO3/CMS/Recordlist/TelephoneLinkHandler
 * Telephone link interaction
 */
class TelephoneLinkHandler {
    constructor() {
        jQuery(() => {
            jQuery('#ltelephoneform').on('submit', (event) => {
                event.preventDefault();
                let value = jQuery(event.currentTarget).find('[name="ltelephone"]').val();
                if (value === 'tel:') {
                    return;
                }
                if (value.startsWith('tel:')) {
                    value = value.substr(4);
                }
                LinkBrowser.finalizeFunction('tel:' + value);
            });
        });
    }
}
var TelephoneLinkHandler$1 = new TelephoneLinkHandler();

export default TelephoneLinkHandler$1;
