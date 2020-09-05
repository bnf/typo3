define(function () { 'use strict';

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
     * Module: TYPO3/CMS/Install/Module/Severity
     */
    class Severity {
        constructor() {
            this.loading = -3;
            this.notice = -2;
            this.info = -1;
            this.ok = 0;
            this.warning = 1;
            this.error = 2;
        }
        getCssClass(severity) {
            let severityClass;
            switch (severity) {
                case this.loading:
                    severityClass = 'notice alert-loading';
                    break;
                case this.notice:
                    severityClass = 'notice';
                    break;
                case this.ok:
                    severityClass = 'success';
                    break;
                case this.warning:
                    severityClass = 'warning';
                    break;
                case this.error:
                    severityClass = 'danger';
                    break;
                case this.info:
                default:
                    severityClass = 'info';
            }
            return severityClass;
        }
    }
    var Severity$1 = new Severity();

    return Severity$1;

});
