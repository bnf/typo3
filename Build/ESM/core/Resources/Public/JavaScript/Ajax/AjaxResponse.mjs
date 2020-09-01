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
class AjaxResponse {
    constructor(response) {
        this.response = response;
    }
    async resolve() {
        if (this.response.headers.has('Content-Type') && this.response.headers.get('Content-Type').includes('application/json')) {
            return await this.response.json();
        }
        return await this.response.text();
    }
    raw() {
        return this.response;
    }
}

export { AjaxResponse };
