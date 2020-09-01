import $ from 'jquery';
import 'bootstrap';

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
 * The main tooltip object
 *
 * Hint: Due to the current usage of tooltips, this class can't be static right now
 */
class Tooltip {
    constructor() {
        $(() => {
            this.initialize('[data-toggle="tooltip"]');
        });
    }
    initialize(selector, options) {
        options = options || {};
        $(selector).tooltip(options);
    }
    /**
     * Show tooltip on $element
     *
     * @param {Object} $element
     * @param {String} title
     */
    show($element, title) {
        $element
            .attr('data-placement', 'auto')
            .attr('data-title', title)
            .tooltip('show');
    }
    /**
     * Hide tooltip on $element
     *
     * @param {Object} $element
     */
    hide($element) {
        $element.tooltip('hide');
    }
}
const tooltipObject = new Tooltip();
// expose as global object
TYPO3.Tooltip = tooltipObject;

export default tooltipObject;
