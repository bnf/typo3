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
 * Module: TYPO3/CMS/Backend/Toolbar
 * Toolbar component of the TYPO3 backend
 * @exports TYPO3/CMS/Backend/Toolbar
 */
class Toolbar {
    static initialize() {
        Toolbar.initializeEvents();
    }
    static initializeEvents() {
        new RegularEvent('click', () => {
            const scaffold = document.querySelector('.scaffold');
            scaffold.classList.remove('scaffold-modulemenu-expanded', 'scaffold-search-expanded');
            scaffold.classList.toggle('scaffold-toolbar-expanded');
        }).bindTo(document.querySelector('.t3js-topbar-button-toolbar'));
        new RegularEvent('click', () => {
            const scaffold = document.querySelector('.scaffold');
            scaffold.classList.remove('scaffold-modulemenu-expanded', 'scaffold-toolbar-expanded');
            scaffold.classList.toggle('scaffold-search-expanded');
        }).bindTo(document.querySelector('.t3js-topbar-button-search'));
    }
}
documentService.ready().then(Toolbar.initialize);
