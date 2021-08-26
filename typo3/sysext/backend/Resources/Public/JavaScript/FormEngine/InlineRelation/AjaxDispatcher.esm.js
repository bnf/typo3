import AjaxRequest from '../../../../../../core/Resources/Public/JavaScript/Ajax/AjaxRequest.esm.js';
import NotificationService from '../../Notification.esm.js';
import Utility from '../../Utility.esm.js';

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
class AjaxDispatcher {
    constructor(objectGroup) {
        this.objectGroup = null;
        this.objectGroup = objectGroup;
    }
    newRequest(endpoint) {
        return new AjaxRequest(endpoint);
    }
    /**
     * @param {String} routeName
     */
    getEndpoint(routeName) {
        if (typeof TYPO3.settings.ajaxUrls[routeName] !== 'undefined') {
            return TYPO3.settings.ajaxUrls[routeName];
        }
        throw 'Undefined endpoint for route "' + routeName + '"';
    }
    send(request, params) {
        const sentRequest = request.post(this.createRequestBody(params)).then(async (response) => {
            return this.processResponse(await response.resolve());
        });
        sentRequest.catch((reason) => {
            NotificationService.error('Error ' + reason.message);
        });
        return sentRequest;
    }
    createRequestBody(input) {
        const body = {};
        for (let i = 0; i < input.length; i++) {
            body['ajax[' + i + ']'] = input[i];
        }
        body['ajax[context]'] = JSON.stringify(this.getContext());
        return body;
    }
    getContext() {
        let context;
        if (typeof TYPO3.settings.FormEngineInline.config[this.objectGroup] !== 'undefined'
            && typeof TYPO3.settings.FormEngineInline.config[this.objectGroup].context !== 'undefined') {
            context = TYPO3.settings.FormEngineInline.config[this.objectGroup].context;
        }
        return context;
    }
    processResponse(json) {
        if (json.hasErrors) {
            for (const message of json.messages) {
                NotificationService.error(message.title, message.message);
            }
        }
        // If there are elements they should be added to the <HEAD> tag (e.g. for RTEhtmlarea):
        if (json.stylesheetFiles) {
            for (const [index, stylesheetFile] of json.stylesheetFiles.entries()) {
                if (!stylesheetFile) {
                    break;
                }
                const element = document.createElement('link');
                element.rel = 'stylesheet';
                element.type = 'text/css';
                element.href = stylesheetFile;
                document.querySelector('head').appendChild(element);
                delete json.stylesheetFiles[index];
            }
        }
        if (typeof json.inlineData === 'object') {
            TYPO3.settings.FormEngineInline = Utility.mergeDeep(TYPO3.settings.FormEngineInline, json.inlineData);
        }
        if (typeof json.requireJsModules === 'object') {
            for (let requireJsModule of json.requireJsModules) {
                new Function(requireJsModule)();
            }
        }
        // TODO: This is subject to be removed
        if (json.scriptCall && json.scriptCall.length > 0) {
            for (const scriptCall of json.scriptCall) {
                // eslint-disable-next-line no-eval
                eval(scriptCall);
            }
        }
        return json;
    }
}

export { AjaxDispatcher };
