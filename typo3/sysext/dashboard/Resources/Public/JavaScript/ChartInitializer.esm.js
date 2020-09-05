import RegularEvent from '../../../../core/Resources/Public/JavaScript/Event/RegularEvent.esm.js';
import Chart from './Contrib/chartjs.esm.js';

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
            new Chart(context, config.graphConfig);
        }).delegateTo(document, this.selector);
    }
}
var ChartInitializer$1 = new ChartInitializer();

export default ChartInitializer$1;
