define(['jquery', 'TYPO3/CMS/Backend/FormEngine', 'TYPO3/CMS/Backend/FormEngineValidation', '../../../../../../core/Resources/Public/TypeScript/Ajax/AjaxRequest', '../../Icons', '../../Severity', '../../Modal', '../../Notification', 'nprogress', 'Sortable', '../../InfoWindow'], function ($, FormEngine, FormEngineValidation, AjaxRequest, Icons, Severity, Modal, Notification, NProgress, Sortable, InfoWindow) { 'use strict';

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
    var Selectors;
    (function (Selectors) {
        Selectors["toggleSelector"] = "[data-toggle=\"formengine-inline\"]";
        Selectors["controlSectionSelector"] = ".t3js-formengine-irre-control";
        Selectors["createNewRecordButtonSelector"] = ".t3js-create-new-button";
        Selectors["createNewRecordBySelectorSelector"] = ".t3js-create-new-selector";
        Selectors["deleteRecordButtonSelector"] = ".t3js-editform-delete-inline-record";
        Selectors["enableDisableRecordButtonSelector"] = ".t3js-toggle-visibility-button";
        Selectors["infoWindowButton"] = "[data-action=\"infowindow\"]";
        Selectors["synchronizeLocalizeRecordButtonSelector"] = ".t3js-synchronizelocalize-button";
        Selectors["uniqueValueSelectors"] = "select.t3js-inline-unique";
        Selectors["revertUniqueness"] = ".t3js-revert-unique";
        Selectors["controlContainerButtons"] = ".t3js-inline-controls";
    })(Selectors || (Selectors = {}));
    var States;
    (function (States) {
        States["new"] = "inlineIsNewRecord";
        States["visible"] = "panel-visible";
        States["collapsed"] = "panel-collapsed";
        States["notLoaded"] = "t3js-not-loaded";
    })(States || (States = {}));
    var Separators;
    (function (Separators) {
        Separators["structureSeparator"] = "-";
    })(Separators || (Separators = {}));
    var SortDirections;
    (function (SortDirections) {
        SortDirections["DOWN"] = "down";
        SortDirections["UP"] = "up";
    })(SortDirections || (SortDirections = {}));

});
