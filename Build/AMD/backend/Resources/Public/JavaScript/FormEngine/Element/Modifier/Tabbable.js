define(['require', 'exports'], function (require, exports) { 'use strict';

    function _interopNamespace(e) {
        if (e && e.__esModule) { return e; } else {
            var n = Object.create(null);
            if (e) {
                Object.keys(e).forEach(function (k) {
                    if (k !== 'default') {
                        var d = Object.getOwnPropertyDescriptor(e, k);
                        Object.defineProperty(n, k, d.get ? d : {
                            enumerable: true,
                            get: function () {
                                return e[k];
                            }
                        });
                    }
                });
            }
            n['default'] = e;
            return Object.freeze(n);
        }
    }

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
     * Convert textarea to enable tab
     */
    class Tabbable {
        /**
         * @param {HTMLTextAreaElement} textarea
         */
        static enable(textarea) {
            if (textarea.classList.contains('t3js-enable-tab')) {
                new Promise(function (resolve, reject) { require(['taboverride'], function (m) { resolve(/*#__PURE__*/_interopNamespace(m)); }, reject) }).then(({ default: taboverride }) => {
                    taboverride.set(textarea);
                });
            }
        }
    }

    exports.Tabbable = Tabbable;

    Object.defineProperty(exports, '__esModule', { value: true });

});
