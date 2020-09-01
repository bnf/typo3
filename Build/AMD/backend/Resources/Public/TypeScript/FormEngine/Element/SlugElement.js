define(['jquery', '../../../../../../core/Resources/Public/TypeScript/Ajax/AjaxRequest'], function ($, AjaxRequest) { 'use strict';

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
        Selectors["toggleButton"] = ".t3js-form-field-slug-toggle";
        Selectors["recreateButton"] = ".t3js-form-field-slug-recreate";
        Selectors["inputField"] = ".t3js-form-field-slug-input";
        Selectors["readOnlyField"] = ".t3js-form-field-slug-readonly";
        Selectors["hiddenField"] = ".t3js-form-field-slug-hidden";
    })(Selectors || (Selectors = {}));
    var ProposalModes;
    (function (ProposalModes) {
        ProposalModes["AUTO"] = "auto";
        ProposalModes["RECREATE"] = "recreate";
        ProposalModes["MANUAL"] = "manual";
    })(ProposalModes || (ProposalModes = {}));

});
