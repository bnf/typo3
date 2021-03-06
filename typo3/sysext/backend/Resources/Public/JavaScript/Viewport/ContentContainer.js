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
var __importDefault=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};define(["require","exports","../Enum/Viewport/ScaffoldIdentifier","./AbstractContainer","jquery","../Event/ClientRequest","../Event/InteractionRequest","./Loader","../Utility","../Event/TriggerRequest"],(function(e,t,r,n,o,u,l,i,s,d){"use strict";o=__importDefault(o);class f extends n.AbstractContainer{get(){return o.default(r.ScaffoldIdentifierEnum.contentModuleIframe)[0].contentWindow}beforeSetUrl(e){return this.consumerScope.invoke(new d("typo3.beforeSetUrl",e))}setUrl(e,t,n){let s;return null===this.resolveRouterElement()?(s=o.default.Deferred(),s.reject(),s):(t instanceof l||(t=new u("typo3.setUrl",null)),s=this.consumerScope.invoke(new d("typo3.setUrl",t)),s.then(()=>{i.start(),o.default(r.ScaffoldIdentifierEnum.contentModuleRouter).attr("endpoint",e).attr("module",n||null).one("load",()=>{i.finish()})}),s)}getUrl(){return o.default(r.ScaffoldIdentifierEnum.contentModuleRouter).attr("endpoint")}refresh(e){let t;const r=this.resolveRouterElement();return null===r?(t=o.default.Deferred(),t.reject(),t):(t=this.consumerScope.invoke(new d("typo3.refresh",e)),t.then(()=>{r.setAttribute("endpoint",r.getAttribute("endpoint"))}),t)}getIdFromUrl(){return this.getUrl?parseInt(s.getParameterFromUrl(this.getUrl(),"id"),10):0}resolveRouterElement(){return document.querySelector(r.ScaffoldIdentifierEnum.contentModuleRouter)}}return f}));