import jQuery from '../../../../core/Resources/Public/JavaScript/Contrib/jquery/jquery.esm.js';

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
 * Module: TYPO3/CMS/Recordlist/LinkBrowser
 * @exports TYPO3/CMS/Recordlist/LinkBrowser
 */
class LinkBrowser {
    constructor() {
        this.urlParameters = {};
        this.parameters = {};
        this.additionalLinkAttributes = {};
        this.loadTarget = (evt) => {
            const $element = jQuery(evt.currentTarget);
            jQuery('.t3js-linkTarget').val($element.val());
            $element.get(0).selectedIndex = 0;
        };
        jQuery(() => {
            const data = jQuery('body').data();
            this.urlParameters = data.urlParameters;
            this.parameters = data.parameters;
            this.linkAttributeFields = data.linkAttributeFields;
            jQuery('.t3js-targetPreselect').on('change', this.loadTarget);
            jQuery('form.t3js-dummyform').on('submit', (evt) => {
                evt.preventDefault();
            });
        });
    }
    getLinkAttributeValues() {
        const attributeValues = {};
        jQuery.each(this.linkAttributeFields, (index, fieldName) => {
            const val = jQuery('[name="l' + fieldName + '"]').val();
            if (val) {
                attributeValues[fieldName] = val;
            }
        });
        jQuery.extend(attributeValues, this.additionalLinkAttributes);
        return attributeValues;
    }
    /**
     * Encode objects to GET parameter arrays in PHP notation
     */
    encodeGetParameters(obj, prefix, url) {
        const str = [];
        for (const entry of Object.entries(obj)) {
            const [p, v] = entry;
            const k = prefix ? prefix + '[' + p + ']' : p;
            if (!url.includes(k + '=')) {
                str.push(typeof v === 'object'
                    ? this.encodeGetParameters(v, k, url)
                    : encodeURIComponent(k) + '=' + encodeURIComponent(v));
            }
        }
        return '&' + str.join('&');
    }
    /**
     * Set an additional attribute for the link
     */
    setAdditionalLinkAttribute(name, value) {
        this.additionalLinkAttributes[name] = value;
    }
    /**
     * Stores the final link
     *
     * This method MUST be overridden in the actual implementation of the link browser.
     * The function is responsible for encoding the link (and possible link attributes) and
     * returning it to the caller (e.g. FormEngine, RTE, etc)
     *
     * @param {String} link The select element or anything else which identifies the link (e.g. "page:<pageUid>" or "file:<uid>")
     */
    finalizeFunction(link) {
        throw 'The link browser requires the finalizeFunction to be set. Seems like you discovered a major bug.';
    }
}
var LinkBrowser$1 = new LinkBrowser();

export default LinkBrowser$1;
