import InteractionRequest from './InteractionRequest.esm.js';

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
class TriggerRequest extends InteractionRequest {
    constructor(type, parentRequest = null) {
        super(type, parentRequest);
    }
    concerns(ancestorRequest) {
        if (this === ancestorRequest) {
            return true;
        }
        let request = this;
        while (request.parentRequest instanceof InteractionRequest) {
            request = request.parentRequest;
            if (request === ancestorRequest) {
                return true;
            }
        }
        return false;
    }
    concernsTypes(types) {
        if (types.includes(this.type)) {
            return true;
        }
        let request = this;
        while (request.parentRequest instanceof InteractionRequest) {
            request = request.parentRequest;
            if (types.includes(request.type)) {
                return true;
            }
        }
        return false;
    }
}

export default TriggerRequest;
