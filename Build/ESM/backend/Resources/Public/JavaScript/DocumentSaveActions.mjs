import $ from 'jquery';
import Icons from './Icons.mjs';

/*
 * This file is part of the TYPO3 CMS project.
 *
 * It is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License, either version 2
 * of the License, or any later version.
 *
 * For the full copyright and license information, please read the
 * LICENSE.txt file that was distributed with DocumentHeader source code.
 *
 * The TYPO3 project - inspiring people to share!
 */
class DocumentSaveActions {
    constructor() {
        this.preSubmitCallbacks = [];
        $(() => {
            this.initializeSaveHandling();
        });
    }
    static getInstance() {
        if (DocumentSaveActions.instance === null) {
            DocumentSaveActions.instance = new DocumentSaveActions();
        }
        return DocumentSaveActions.instance;
    }
    /**
     * Adds a callback being executed before submit
     *
     * @param {Function} callback
     */
    addPreSubmitCallback(callback) {
        if (typeof callback !== 'function') {
            throw 'callback must be a function.';
        }
        this.preSubmitCallbacks.push(callback);
    }
    /**
     * Initializes the save handling
     */
    initializeSaveHandling() {
        let preventExec = false;
        const elements = [
            'button[form]',
            'button[name^="_save"]',
            'a[data-name^="_save"]',
            'button[name="CMD"][value^="save"]',
            'a[data-name="CMD"][data-value^="save"]',
        ].join(',');
        $('.t3js-module-docheader').on('click', elements, (e) => {
            // prevent doubleclick double submission bug in chrome,
            // see https://forge.typo3.org/issues/77942
            if (!preventExec) {
                preventExec = true;
                const $me = $(e.currentTarget);
                const linkedForm = $me.attr('form') || $me.attr('data-form') || null;
                const $form = linkedForm ? $('#' + linkedForm) : $me.closest('form');
                const name = $me.data('name') || e.currentTarget.getAttribute('name');
                const value = $me.data('value') || e.currentTarget.getAttribute('value');
                const $elem = $('<input />').attr('type', 'hidden').attr('name', name).attr('value', value);
                // Run any preSubmit callbacks
                for (let callback of this.preSubmitCallbacks) {
                    callback(e);
                    if (e.isPropagationStopped()) {
                        preventExec = false;
                        return false;
                    }
                }
                $form.append($elem);
                // Disable submit buttons
                $form.on('submit', () => {
                    if ($form.find('.has-error').length > 0) {
                        preventExec = false;
                        return false;
                    }
                    let $affectedButton;
                    const $splitButton = $me.closest('.t3js-splitbutton');
                    if ($splitButton.length > 0) {
                        $splitButton.find('button').prop('disabled', true);
                        $affectedButton = $splitButton.children().first();
                    }
                    else {
                        $me.prop('disabled', true);
                        $affectedButton = $me;
                    }
                    Icons.getIcon('spinner-circle-dark', Icons.sizes.small).then((markup) => {
                        $affectedButton.find('.t3js-icon').replaceWith(markup);
                    });
                    return true;
                });
                if ((e.currentTarget.tagName === 'A' || $me.attr('form')) && !e.isDefaultPrevented()) {
                    $form.find('[name="doSave"]').val('1');
                    $form.trigger('submit');
                    e.preventDefault();
                }
            }
            return true;
        });
    }
}
DocumentSaveActions.instance = null;

export default DocumentSaveActions;
