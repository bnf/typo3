import documentService from '../../../../core/Resources/Public/JavaScript/DocumentService.esm.js';
import ThrottleEvent from '../../../../core/Resources/Public/JavaScript/Event/ThrottleEvent.esm.js';

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
 * Module: TYPO3/CMS/Backend/DocumentHeader
 * Folds docHeader when scrolling down, and reveals when scrollup up
 */
class DocumentHeader {
    constructor() {
        this.documentHeader = null;
        this.direction = 'down';
        this.reactionRange = 300;
        this.lastPosition = 0;
        this.currentPosition = 0;
        this.changedPosition = 0;
        this.settings = {
            margin: 24,
            offset: 100,
            selectors: {
                moduleDocumentHeader: '.t3js-module-docheader',
                moduleSearchBar: '.t3js-module-docheader-bar-search',
            },
        };
        /**
         * Scroll
         *
         * @param {Event} e
         */
        this.scroll = (e) => {
            this.currentPosition = e.target.scrollTop;
            if (this.currentPosition > this.lastPosition) {
                if (this.direction !== 'down') {
                    this.direction = 'down';
                    this.changedPosition = this.currentPosition;
                }
            }
            else if (this.currentPosition < this.lastPosition) {
                if (this.direction !== 'up') {
                    this.direction = 'up';
                    this.changedPosition = this.currentPosition;
                }
            }
            if (this.direction === 'up' && (this.changedPosition - this.reactionRange) < this.currentPosition) {
                this.documentHeader.classList.remove('module-docheader-folded');
            }
            if (this.direction === 'down' && (this.changedPosition + this.reactionRange) < this.currentPosition) {
                this.documentHeader.classList.add('module-docheader-folded');
            }
            this.lastPosition = this.currentPosition;
        };
        documentService.ready().then(() => {
            this.documentHeader = document.querySelector(this.settings.selectors.moduleDocumentHeader);
            if (this.documentHeader === null) {
                return;
            }
            const moduleElement = this.documentHeader.parentElement;
            new ThrottleEvent('scroll', this.scroll, 100).bindTo(moduleElement);
        });
    }
}
var DocumentHeader$1 = new DocumentHeader();

export default DocumentHeader$1;
