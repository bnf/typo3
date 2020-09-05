define(['../../../../../core/Resources/Public/JavaScript/Contrib/jquery/jquery', '../Enum/Viewport/ScaffoldIdentifier', './AbstractContainer', '../Event/InteractionRequest', '../Event/ClientRequest', './Loader', '../Utility', '../Event/TriggerRequest'], function (jquery, ScaffoldIdentifier, AbstractContainer, InteractionRequest, ClientRequest, Loader, Utility, TriggerRequest) { 'use strict';

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
    class ContentContainer extends AbstractContainer.AbstractContainer {
        get() {
            return jquery(ScaffoldIdentifier.ScaffoldIdentifierEnum.contentModuleIframe)[0].contentWindow;
        }
        /**
         * @param {InteractionRequest} interactionRequest
         * @returns {JQueryDeferred<TriggerRequest>}
         */
        beforeSetUrl(interactionRequest) {
            return this.consumerScope.invoke(new TriggerRequest('typo3.beforeSetUrl', interactionRequest));
        }
        /**
         * @param {String} urlToLoad
         * @param {InteractionRequest} [interactionRequest]
         * @returns {JQueryDeferred<TriggerRequest>}
         */
        setUrl(urlToLoad, interactionRequest) {
            let deferred;
            const iFrame = this.resolveIFrameElement();
            // abort, if no IFRAME can be found
            if (iFrame === null) {
                deferred = jquery.Deferred();
                deferred.reject();
                return deferred;
            }
            if (!(interactionRequest instanceof InteractionRequest)) {
                interactionRequest = new ClientRequest('typo3.setUrl', null);
            }
            deferred = this.consumerScope.invoke(new TriggerRequest('typo3.setUrl', interactionRequest));
            deferred.then(() => {
                Loader.start();
                jquery(ScaffoldIdentifier.ScaffoldIdentifierEnum.contentModuleIframe)
                    .attr('src', urlToLoad)
                    .one('load', () => {
                    Loader.finish();
                });
            });
            return deferred;
        }
        /**
         * @returns {string}
         */
        getUrl() {
            return jquery(ScaffoldIdentifier.ScaffoldIdentifierEnum.contentModuleIframe).attr('src');
        }
        /**
         * @param {InteractionRequest} interactionRequest
         * @returns {JQueryDeferred<{}>}
         */
        refresh(interactionRequest) {
            let deferred;
            const iFrame = this.resolveIFrameElement();
            // abort, if no IFRAME can be found
            if (iFrame === null) {
                deferred = jquery.Deferred();
                deferred.reject();
                return deferred;
            }
            deferred = this.consumerScope.invoke(new TriggerRequest('typo3.refresh', interactionRequest));
            deferred.then(() => {
                iFrame.contentWindow.location.reload();
            });
            return deferred;
        }
        getIdFromUrl() {
            if (this.getUrl) {
                return parseInt(Utility.getParameterFromUrl(this.getUrl(), 'id'), 10);
            }
            return 0;
        }
        resolveIFrameElement() {
            const $iFrame = jquery(ScaffoldIdentifier.ScaffoldIdentifierEnum.contentModuleIframe + ':first');
            if ($iFrame.length === 0) {
                return null;
            }
            return $iFrame.get(0);
        }
    }

    return ContentContainer;

});
