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
/**
 * Module: TYPO3/CMS/Redirects/RedirectsModule
 * @exports TYPO3/CMS/Redirects/RedirectsModule
 */
class RedirectsModule {
    constructor() {
        const filterForm = document.querySelector('form[data-on-submit="processNavigate"]');
        if (filterForm !== null) {
            new RegularEvent('change', this.executeSubmit.bind(this))
                .delegateTo(document, '[data-on-change="submit"]');
            new RegularEvent('submit', this.processNavigate.bind(this))
                .bindTo(filterForm);
        }
    }
    executeSubmit(evt, target) {
        if (target instanceof HTMLSelectElement || (target instanceof HTMLInputElement && target.type === 'checkbox')) {
            target.form.submit();
        }
    }
    processNavigate(evt, target) {
        if (!(target instanceof HTMLFormElement)) {
            return;
        }
        evt.preventDefault();
        const formField = target.elements.namedItem('paginator-target-page');
        const numberOfPages = parseInt(formField.dataset.numberOfPages, 10);
        let url = formField.dataset.url;
        let page = parseInt(formField.value, 10);
        if (page > numberOfPages) {
            page = numberOfPages;
        }
        else if (page < 1) {
            page = 1;
        }
        url = url.replace('987654322', page.toString());
        self.location.href = url;
    }
}
var RedirectsModule$1 = new RedirectsModule();

export default RedirectsModule$1;
