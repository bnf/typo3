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
 * Introduces a polyfill to support jQuery callbacks in native promises.
 */
/*! Based on https://www.promisejs.org/polyfills/promise-done-7.0.4.js */
class JQueryNativePromises {
    static get default() {
        console.warn('The property .default of module JQueryNativePromises has been deprecated, use JQueryNativePromises directly.');
        return this;
    }
    static support() {
        if (typeof Promise.prototype.done !== 'function') {
            Promise.prototype.done = function (onFulfilled) {
                return arguments.length ? this.then.apply(this, arguments) : Promise.prototype.then;
            };
        }
        if (typeof Promise.prototype.fail !== 'function') {
            Promise.prototype.fail = function (onRejected) {
                this.catch(async (err) => {
                    const response = err.response;
                    onRejected(await JQueryNativePromises.createFakeXhrObject(response), 'error', response.statusText);
                });
                return this;
            };
        }
    }
    static async createFakeXhrObject(response) {
        const xhr = {};
        xhr.readyState = 4;
        xhr.responseText = await response.text();
        xhr.responseURL = response.url;
        xhr.status = response.status;
        xhr.statusText = response.statusText;
        if (response.headers.has('Content-Type') && response.headers.get('Content-Type').includes('application/json')) {
            xhr.responseType = 'json';
            xhr.contentJSON = await response.json();
        }
        else {
            xhr.responseType = 'text';
        }
        return xhr;
    }
}

export default JQueryNativePromises;
