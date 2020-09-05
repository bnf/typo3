import jQuery from '../../../../core/Resources/Public/JavaScript/Contrib/jquery/jquery.esm.js';
import { Popover as Popover$2 } from '../../../../core/Resources/Public/JavaScript/Contrib/bootstrap.esm.js';

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
 * Module: TYPO3/CMS/Backend/Popover
 * API for popover windows powered by Twitter Bootstrap.
 * @exports TYPO3/CMS/Backend/Popover
 */
class Popover {
    constructor() {
        /**
         * Default selector string.
         *
         * @return {string}
         */
        this.DEFAULT_SELECTOR = '[data-bs-toggle="popover"]';
        this.initialize();
    }
    /**
     * Initialize
     */
    initialize(selector) {
        selector = selector || this.DEFAULT_SELECTOR;
        jQuery(selector).each((i, el) => {
            const popover = new Popover$2(el);
            jQuery(el).data('typo3.bs.popover', popover);
        });
    }
    // noinspection JSMethodCanBeStatic
    /**
     * Popover wrapper function
     *
     * @param {JQuery} $element
     */
    popover($element) {
        $element.each((i, el) => {
            const popover = new Popover$2(el);
            jQuery(el).data('typo3.bs.popover', popover);
        });
    }
    // noinspection JSMethodCanBeStatic
    /**
     * Set popover options on $element
     *
     * @param {JQuery} $element
     * @param {PopoverOptions} options
     */
    setOptions($element, options) {
        options = options || {};
        options.html = true;
        const title = options.title || $element.data('title') || '';
        const content = options.content || $element.data('bs-content') || '';
        $element
            .attr('data-bs-original-title', title)
            .attr('data-bs-content', content)
            .attr('data-bs-placement', 'auto');
        jQuery.each(options, (key, value) => {
            this.setOption($element, key, value);
        });
    }
    // noinspection JSMethodCanBeStatic
    /**
     * Set popover option on $element
     *
     * @param {JQuery} $element
     * @param {String} key
     * @param {String} value
     */
    setOption($element, key, value) {
        if (key === 'content') {
            const popover = $element.data('typo3.bs.popover');
            popover._config.content = value;
            popover.setContent(popover.tip);
        }
        else {
            $element.each((i, el) => {
                const popover = jQuery(el).data('typo3.bs.popover');
                if (popover) {
                    popover._config[key] = value;
                }
            });
        }
    }
    // noinspection JSMethodCanBeStatic
    /**
     * Show popover with title and content on $element
     *
     * @param {JQuery} $element
     */
    show($element) {
        $element.each((i, el) => {
            const popover = jQuery(el).data('typo3.bs.popover');
            if (popover) {
                popover.show();
            }
        });
    }
    // noinspection JSMethodCanBeStatic
    /**
     * Hide popover on $element
     *
     * @param {JQuery} $element
     */
    hide($element) {
        $element.each((i, el) => {
            const popover = jQuery(el).data('typo3.bs.popover');
            if (popover) {
                popover.hide();
            }
        });
    }
    // noinspection JSMethodCanBeStatic
    /**
     * Destroy popover on $element
     *
     * @param {Object} $element
     */
    destroy($element) {
        $element.each((i, el) => {
            const popover = jQuery(el).data('typo3.bs.popover');
            if (popover) {
                popover.dispose();
            }
        });
    }
    // noinspection JSMethodCanBeStatic
    /**
     * Toggle popover on $element
     *
     * @param {Object} $element
     */
    toggle($element) {
        $element.each((i, el) => {
            const popover = jQuery(el).data('typo3.bs.popover');
            if (popover) {
                popover.toggle();
            }
        });
    }
    // noinspection JSMethodCanBeStatic
    /**
     * Update popover with new content
     *
     * @param $element
     */
    update($element) {
        $element.data('typo3.bs.popover')._popper.update();
    }
}
var Popover$1 = new Popover();

export default Popover$1;
