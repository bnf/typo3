import JQueryNativePromises from '../BackwardCompat/JQueryNativePromises.esm.js';
import { AjaxResponse } from './AjaxResponse.esm.js';
import { ResponseError } from './ResponseError.esm.js';
import { InputTransformer } from './InputTransformer.esm.js';

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
class AjaxRequest {
    constructor(url) {
        this.queryArguments = '';
        this.url = url;
        this.abortController = new AbortController();
        JQueryNativePromises.support();
    }
    /**
     * Clones the AjaxRequest object, generates the final query string and uses it for the request
     *
     * @param {string|array|GenericKeyValue} data
     * @return {AjaxRequest}
     */
    withQueryArguments(data) {
        const clone = this.clone();
        clone.queryArguments = (clone.queryArguments !== '' ? '&' : '') + InputTransformer.toSearchParams(data);
        return clone;
    }
    /**
     * Executes a regular GET request
     *
     * @param {RequestInit} init
     * @return {Promise<Response>}
     */
    async get(init = {}) {
        const localDefaultOptions = {
            method: 'GET',
        };
        const response = await this.send(Object.assign(Object.assign({}, localDefaultOptions), init));
        return new AjaxResponse(response);
    }
    /**
     * Executes a (by default uncached) POST request
     *
     * @param {string | GenericKeyValue} data
     * @param {RequestInit} init
     * @return {Promise<Response>}
     */
    async post(data, init = {}) {
        const localDefaultOptions = {
            body: typeof data === 'string' ? data : InputTransformer.byHeader(data, init === null || init === void 0 ? void 0 : init.headers),
            cache: 'no-cache',
            method: 'POST',
        };
        const response = await this.send(Object.assign(Object.assign({}, localDefaultOptions), init));
        return new AjaxResponse(response);
    }
    /**
     * Executes a (by default uncached) PUT request
     *
     * @param {string | GenericKeyValue} data
     * @param {RequestInit} init
     * @return {Promise<Response>}
     */
    async put(data, init = {}) {
        const localDefaultOptions = {
            body: typeof data === 'string' ? data : InputTransformer.byHeader(data, init === null || init === void 0 ? void 0 : init.headers),
            cache: 'no-cache',
            method: 'PUT',
        };
        const response = await this.send(Object.assign(Object.assign({}, localDefaultOptions), init));
        return new AjaxResponse(response);
    }
    /**
     * Executes a regular DELETE request
     *
     * @param {string | GenericKeyValue} data
     * @param {RequestInit} init
     * @return {Promise<Response>}
     */
    async delete(data = {}, init = {}) {
        const localDefaultOptions = {
            cache: 'no-cache',
            method: 'DELETE',
        };
        if (typeof data === 'object' && Object.keys(data).length > 0) {
            localDefaultOptions.body = InputTransformer.byHeader(data, init === null || init === void 0 ? void 0 : init.headers);
        }
        else if (typeof data === 'string' && data.length > 0) {
            localDefaultOptions.body = data;
        }
        const response = await this.send(Object.assign(Object.assign({}, localDefaultOptions), init));
        return new AjaxResponse(response);
    }
    /**
     * Aborts the current request by using the AbortController
     */
    abort() {
        this.abortController.abort();
    }
    /**
     * Clones the current AjaxRequest object
     *
     * @return {AjaxRequest}
     */
    clone() {
        return Object.assign(Object.create(this), this);
    }
    /**
     * Sends the requests by using the fetch API
     *
     * @param {RequestInit} init
     * @return {Promise<Response>}
     */
    async send(init = {}) {
        const response = await fetch(this.composeRequestUrl(), this.getMergedOptions(init));
        if (!response.ok) {
            throw new ResponseError(response);
        }
        return response;
    }
    composeRequestUrl() {
        let url = this.url;
        if (url.charAt(0) === '?') {
            // URL is a search string only, prepend current location
            url = window.location.origin + window.location.pathname + url;
        }
        url = new URL(url, window.location.origin).toString();
        if (this.queryArguments !== '') {
            const delimiter = !this.url.includes('?') ? '?' : '&';
            url += delimiter + this.queryArguments;
        }
        return url;
    }
    /**
     * Merge the incoming RequestInit object with the pre-defined default options
     *
     * @param {RequestInit} init
     * @return {RequestInit}
     */
    getMergedOptions(init) {
        return Object.assign(Object.assign(Object.assign({}, AjaxRequest.defaultOptions), init), { signal: this.abortController.signal });
    }
}
AjaxRequest.defaultOptions = {
    credentials: 'same-origin'
};

export default AjaxRequest;
