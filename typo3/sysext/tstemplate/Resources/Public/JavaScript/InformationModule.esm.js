import RegularEvent from '../../../../core/Resources/Public/JavaScript/Event/RegularEvent.esm.js';

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
class InformationModule {
    constructor() {
        this.registerEventListeners();
    }
    registerEventListeners() {
        new RegularEvent('typo3:datahandler:process', (e) => {
            const payload = e.detail.payload;
            if (payload.action === 'delete' && !payload.hasErrors) {
                document.location.reload();
            }
        }).bindTo(document);
    }
}
var InformationModule$1 = new InformationModule();

export default InformationModule$1;
