define(['./Enum/Severity'], function (Severity$2) { 'use strict';

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
     * Module: TYPO3/CMS/Backend/Severity
     * Severity for the TYPO3 backend
     */
    class Severity {
        /**
         * Gets the CSS class for the severity
         *
         * @param {SeverityEnum} severity
         * @returns {string}
         */
        static getCssClass(severity) {
            let severityClass;
            switch (severity) {
                case Severity$2.SeverityEnum.notice:
                    severityClass = 'notice';
                    break;
                case Severity$2.SeverityEnum.ok:
                    severityClass = 'success';
                    break;
                case Severity$2.SeverityEnum.warning:
                    severityClass = 'warning';
                    break;
                case Severity$2.SeverityEnum.error:
                    severityClass = 'danger';
                    break;
                case Severity$2.SeverityEnum.info:
                default:
                    severityClass = 'info';
            }
            return severityClass;
        }
    }
    Severity.notice = Severity$2.SeverityEnum.notice;
    Severity.info = Severity$2.SeverityEnum.info;
    Severity.ok = Severity$2.SeverityEnum.ok;
    Severity.warning = Severity$2.SeverityEnum.warning;
    Severity.error = Severity$2.SeverityEnum.error;
    let severityObject;
    try {
        // fetch from opening window
        if (window.opener && window.opener.TYPO3 && window.opener.TYPO3.Severity) {
            severityObject = window.opener.TYPO3.Severity;
        }
        // fetch from parent
        if (parent && parent.window.TYPO3 && parent.window.TYPO3.Severity) {
            severityObject = parent.window.TYPO3.Severity;
        }
        // fetch object from outer frame
        if (top && top.TYPO3 && top.TYPO3.Severity) {
            severityObject = top.TYPO3.Severity;
        }
    }
    catch (_a) {
        // This only happens if the opener, parent or top is some other url (eg a local file)
        // which loaded the current window. Then the browser's cross domain policy jumps in
        // and raises an exception.
        // For this case we are safe and we can create our global object below.
    }
    if (!severityObject) {
        severityObject = Severity;
        // attach to global frame
        if (typeof TYPO3 !== 'undefined') {
            TYPO3.Severity = severityObject;
        }
    }
    var Severity$1 = severityObject;

    return Severity$1;

});
