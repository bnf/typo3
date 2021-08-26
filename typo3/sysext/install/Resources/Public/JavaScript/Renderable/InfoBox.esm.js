import jQuery from '../../../../../core/Resources/Public/JavaScript/Contrib/jquery/jquery.esm.js';
import Severity from './Severity.esm.js';

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
 * Module: TYPO3/CMS/Install/Module/InfoBox
 */
class InfoBox {
    constructor() {
        this.template = jQuery('<div class="t3js-infobox callout callout-sm">' +
            '<h4 class="callout-title"></h4>' +
            '<div class="callout-body"></div>' +
            '</div>');
    }
    render(severity, title, message) {
        let infoBox = this.template.clone();
        infoBox.addClass('callout-' + Severity.getCssClass(severity));
        if (title) {
            infoBox.find('h4').text(title);
        }
        if (message) {
            infoBox.find('.callout-body').text(message);
        }
        else {
            infoBox.find('.callout-body').remove();
        }
        return infoBox;
    }
}
var InfoBox$1 = new InfoBox();

export default InfoBox$1;
