define(['../../../../core/Resources/Public/TypeScript/Ajax/AjaxRequest', './Storage/Client'], function (AjaxRequest, Client) { 'use strict';

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
    var Sizes;
    (function (Sizes) {
        Sizes["small"] = "small";
        Sizes["default"] = "default";
        Sizes["large"] = "large";
        Sizes["overlay"] = "overlay";
    })(Sizes || (Sizes = {}));
    var States;
    (function (States) {
        States["default"] = "default";
        States["disabled"] = "disabled";
    })(States || (States = {}));
    var MarkupIdentifiers;
    (function (MarkupIdentifiers) {
        MarkupIdentifiers["default"] = "default";
        MarkupIdentifiers["inline"] = "inline";
    })(MarkupIdentifiers || (MarkupIdentifiers = {}));
    /**
     * Module: TYPO3/CMS/Backend/Icons
     * Uses the icon API of the core to fetch icons via AJAX.
     */
    class Icons {
        constructor() {
            this.sizes = Sizes;
            this.states = States;
            this.markupIdentifiers = MarkupIdentifiers;
            this.promiseCache = {};
        }
        /**
         * Get the icon by its identifier
         *
         * @param {string} identifier
         * @param {Sizes} size
         * @param {string} overlayIdentifier
         * @param {string} state
         * @param {MarkupIdentifiers} markupIdentifier
         * @returns {Promise<string>}
         */
        getIcon(identifier, size, overlayIdentifier, state, markupIdentifier) {
            /**
             * Icon keys:
             *
             * 0: identifier
             * 1: size
             * 2: overlayIdentifier
             * 3: state
             * 4: markupIdentifier
             */
            size = size || Sizes.default;
            state = state || States.default;
            markupIdentifier = markupIdentifier || MarkupIdentifiers.default;
            const describedIcon = [identifier, size, overlayIdentifier, state, markupIdentifier];
            const cacheIdentifier = describedIcon.join('_');
            return this.getIconRegistryCache().then((registryCacheIdentifier) => {
                if (!Client.isset('icon_registry_cache_identifier')
                    || Client.get('icon_registry_cache_identifier') !== registryCacheIdentifier) {
                    Client.unsetByPrefix('icon_');
                    Client.set('icon_registry_cache_identifier', registryCacheIdentifier);
                }
                return this.fetchFromLocal(cacheIdentifier).then(null, () => {
                    return this.fetchFromRemote(describedIcon, cacheIdentifier);
                });
            });
        }
        getIconRegistryCache() {
            const promiseCacheIdentifier = 'icon_registry_cache_identifier';
            if (!this.isPromiseCached(promiseCacheIdentifier)) {
                this.putInPromiseCache(promiseCacheIdentifier, (new AjaxRequest(TYPO3.settings.ajaxUrls.icons_cache)).get()
                    .then(async (response) => {
                    return await response.resolve();
                }));
            }
            return this.getFromPromiseCache(promiseCacheIdentifier);
        }
        /**
         * Performs the AJAX request to fetch the icon
         *
         * @param {Array<string>} icon
         * @param {string} cacheIdentifier
         * @returns {JQueryPromise<any>}
         */
        fetchFromRemote(icon, cacheIdentifier) {
            if (!this.isPromiseCached(cacheIdentifier)) {
                const queryArguments = {
                    icon: JSON.stringify(icon),
                };
                this.putInPromiseCache(cacheIdentifier, (new AjaxRequest(TYPO3.settings.ajaxUrls.icons)).withQueryArguments(queryArguments).get()
                    .then(async (response) => {
                    const markup = await response.resolve();
                    if (markup.includes('t3js-icon') && markup.includes('<span class="icon-markup">')) {
                        Client.set('icon_' + cacheIdentifier, markup);
                    }
                    return markup;
                }));
            }
            return this.getFromPromiseCache(cacheIdentifier);
        }
        /**
         * Gets the icon from localStorage
         * @param {string} cacheIdentifier
         * @returns {Promise<string>}
         */
        fetchFromLocal(cacheIdentifier) {
            if (Client.isset('icon_' + cacheIdentifier)) {
                return Promise.resolve(Client.get('icon_' + cacheIdentifier));
            }
            return Promise.reject();
        }
        /**
         * Check whether icon was fetched already
         *
         * @param {string} cacheIdentifier
         * @returns {boolean}
         */
        isPromiseCached(cacheIdentifier) {
            return typeof this.promiseCache[cacheIdentifier] !== 'undefined';
        }
        /**
         * Get icon from cache
         *
         * @param {string} cacheIdentifier
         * @returns {Promise<string>}
         */
        getFromPromiseCache(cacheIdentifier) {
            return this.promiseCache[cacheIdentifier];
        }
        /**
         * Put icon into cache
         *
         * @param {string} cacheIdentifier
         * @param {Promise<string>} markup
         */
        putInPromiseCache(cacheIdentifier, markup) {
            this.promiseCache[cacheIdentifier] = markup;
        }
    }
    let iconsObject;
    if (!iconsObject) {
        iconsObject = new Icons();
        TYPO3.Icons = iconsObject;
    }
    var Icons$1 = iconsObject;

    return Icons$1;

});
