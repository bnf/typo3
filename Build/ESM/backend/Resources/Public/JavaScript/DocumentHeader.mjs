import jQuery from '../../../../core/Resources/Public/JavaScript/Contrib/jquery.mjs';
import ThrottleEvent from '../../../../core/Resources/Public/JavaScript/Event/ThrottleEvent.mjs';
import DebounceEvent from '../../../../core/Resources/Public/JavaScript/Event/DebounceEvent.mjs';

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
 * Calculates the height of the docHeader and hides it upon scrolling
 */
class DocumentHeader {
    constructor() {
        this.$documentHeader = null;
        this.$documentHeaderBars = null;
        this.$documentHeaderNavigationBar = null;
        this.$documentHeaderSearchBar = null;
        this.$moduleBody = null;
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
                moduleDocheaderBar: '.t3js-module-docheader-bar',
                moduleNavigationBar: '.t3js-module-docheader-bar-navigation',
                moduleButtonBar: '.t3js-module-docheader-bar-buttons',
                moduleSearchBar: '.t3js-module-docheader-bar-search',
                moduleBody: '.t3js-module-body',
            },
        };
        /**
         * Reposition
         */
        this.reposition = () => {
            this.$documentHeader.css('height', 'auto');
            this.$documentHeaderBars.css('height', 'auto');
            this.$moduleBody.css('padding-top', this.$documentHeader.outerHeight() + this.settings.margin);
        };
        /**
         * Scroll
         *
         * @param {Event} e
         */
        this.scroll = (e) => {
            this.currentPosition = jQuery(e.target).scrollTop();
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
                this.$documentHeader.css('margin-top', 0);
            }
            if (this.direction === 'down' && (this.changedPosition + this.reactionRange) < this.currentPosition) {
                this.$documentHeader.css('margin-top', (this.$documentHeaderNavigationBar.outerHeight() + 4) * -1);
            }
            this.lastPosition = this.currentPosition;
        };
        jQuery(() => {
            this.initialize();
        });
    }
    /**
     * Initialize
     */
    initialize() {
        this.$documentHeader = jQuery(this.settings.selectors.moduleDocumentHeader);
        if (this.$documentHeader.length > 0) {
            this.$documentHeaderBars = jQuery(this.settings.selectors.moduleDocheaderBar);
            this.$documentHeaderNavigationBar = jQuery(this.settings.selectors.moduleNavigationBar);
            this.$documentHeaderSearchBar = jQuery(this.settings.selectors.moduleSearchBar).remove();
            if (this.$documentHeaderSearchBar.length > 0) {
                this.$documentHeader.append(this.$documentHeaderSearchBar);
            }
            this.$moduleBody = jQuery(this.settings.selectors.moduleBody);
            this.start();
        }
    }
    /**
     * Start
     */
    start() {
        this.reposition();
        new DebounceEvent('resize', this.reposition).bindTo(window);
        new ThrottleEvent('scroll', this.scroll, 100).bindTo(document.querySelector('.t3js-module-docheader + .t3js-module-body'));
    }
}
var DocumentHeader$1 = new DocumentHeader();

export default DocumentHeader$1;
