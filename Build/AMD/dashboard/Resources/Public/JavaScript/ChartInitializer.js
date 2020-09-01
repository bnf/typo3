define(['../../../../core/Resources/Public/JavaScript/Event/RegularEvent', 'TYPO3/CMS/Dashboard/Contrib/chartjs'], function (RegularEvent, Chart) { 'use strict';

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    var Chart__default = /*#__PURE__*/_interopDefaultLegacy(Chart);

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
    class ChartInitializer {
        constructor() {
            this.selector = '.dashboard-item';
            this.initialize();
        }
        initialize() {
            new RegularEvent('widgetContentRendered', function (e) {
                e.preventDefault();
                const config = e.detail;
                if (undefined === config || undefined === config.graphConfig) {
                    return;
                }
                let _canvas = this.querySelector('canvas');
                let context;
                if (_canvas !== null) {
                    context = _canvas.getContext('2d');
                }
                if (undefined === context) {
                    return;
                }
                new Chart__default['default'](context, config.graphConfig);
            }).delegateTo(document, this.selector);
        }
    }
    var ChartInitializer$1 = new ChartInitializer();

    return ChartInitializer$1;

});
