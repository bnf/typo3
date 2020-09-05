define(['../../../../core/Resources/Public/JavaScript/Contrib/jquery'], function (jquery) { 'use strict';

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
    var Identifiers;
    (function (Identifiers) {
        Identifiers["containerSelector"] = ".t3js-newmultiplepages-container";
        Identifiers["addMoreFieldsButtonSelector"] = ".t3js-newmultiplepages-createnewfields";
        Identifiers["doktypeSelector"] = ".t3js-newmultiplepages-select-doktype";
        Identifiers["templateRow"] = ".t3js-newmultiplepages-newlinetemplate";
    })(Identifiers || (Identifiers = {}));
    /**
     * Module: TYPO3/CMS/Backend/NewMultiplePages
     * JavaScript functions for creating multiple pages
     */
    class NewMultiplePages {
        constructor() {
            this.lineCounter = 5;
            jquery(() => {
                this.initializeEvents();
            });
        }
        /**
         * Register listeners
         */
        initializeEvents() {
            jquery(Identifiers.addMoreFieldsButtonSelector).on('click', () => {
                this.createNewFormFields();
            });
            jquery(document).on('change', Identifiers.doktypeSelector, (e) => {
                this.actOnTypeSelectChange(jquery(e.currentTarget));
            });
        }
        /**
         * Add further input rows
         */
        createNewFormFields() {
            for (let i = 0; i < 5; i++) {
                const label = this.lineCounter + i + 1;
                const line = jquery(Identifiers.templateRow).html()
                    .replace(/\[0\]/g, (this.lineCounter + i).toString())
                    .replace(/\[1\]/g, label.toString());
                jquery(line).appendTo(Identifiers.containerSelector);
            }
            this.lineCounter += 5;
        }
        /**
         * @param {JQuery} $selectElement
         */
        actOnTypeSelectChange($selectElement) {
            const $optionElement = $selectElement.find(':selected');
            const $target = jquery($selectElement.data('target'));
            $target.html($optionElement.data('icon'));
        }
    }
    var NewMultiplePages$1 = new NewMultiplePages();

    return NewMultiplePages$1;

});
