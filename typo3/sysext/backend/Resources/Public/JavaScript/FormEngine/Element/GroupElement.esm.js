import documentService from '../../../../../../core/Resources/Public/JavaScript/DocumentService.esm.js';
import { AbstractSortableSelectItems } from './AbstractSortableSelectItems.esm.js';
import FormEngineSuggest from '../../FormEngineSuggest.esm.js';

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
class GroupElement extends AbstractSortableSelectItems {
    constructor(elementId) {
        super();
        this.element = null;
        documentService.ready().then(() => {
            this.element = document.getElementById(elementId);
            this.registerEventHandler();
            this.registerSuggest();
        });
    }
    registerEventHandler() {
        this.registerSortableEventHandler(this.element);
    }
    registerSuggest() {
        let suggestContainer;
        if ((suggestContainer = this.element.closest('.t3js-formengine-field-item').querySelector('.t3-form-suggest')) !== null) {
            // tslint:disable-next-line:no-unused-expression
            new FormEngineSuggest(suggestContainer);
        }
    }
}

export default GroupElement;
