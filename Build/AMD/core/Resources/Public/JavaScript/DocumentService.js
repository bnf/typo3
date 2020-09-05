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
     * Module: TYPO3/CMS/Core/DocumentService
     * @exports TYPO3/CMS/Core/DocumentService
     */
    class DocumentService {
        /**
         * @param {Window} windowRef
         * @param {Document} documentRef
         */
        constructor(windowRef = window, documentRef = document) {
            this.windowRef = windowRef;
            this.documentRef = documentRef;
        }
        ready() {
            return new Promise((resolve, reject) => {
                if (this.documentRef.readyState === 'complete') {
                    resolve(this.documentRef);
                }
                else {
                    // timeout & reject after 30 seconds
                    const timer = window.setTimeout(() => {
                        clearListeners();
                        reject(this.documentRef);
                    }, 30000);
                    const clearListeners = () => {
                        this.windowRef.removeEventListener('load', delegate);
                        this.documentRef.removeEventListener('DOMContentLoaded', delegate);
                    };
                    const delegate = () => {
                        clearListeners();
                        clearTimeout(timer);
                        resolve(this.documentRef);
                    };
                    this.windowRef.addEventListener('load', delegate);
                    this.documentRef.addEventListener('DOMContentLoaded', delegate);
                }
            });
        }
    }
    const documentService = new DocumentService();

    return documentService;

});
