import { Resizable } from './Modifier/Resizable.mjs';
import { Tabbable } from './Modifier/Tabbable.mjs';
import documentService from '../../../../../../core/Resources/Public/JavaScript/DocumentService.mjs';

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
class TextTableElement {
    constructor(elementId) {
        this.element = null;
        documentService.ready().then(() => {
            this.element = document.getElementById(elementId);
            Resizable.enable(this.element);
            Tabbable.enable(this.element);
        });
    }
}

export default TextTableElement;
