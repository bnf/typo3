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
define(["../Enum/Viewport/ScaffoldIdentifier","./AbstractContainer","jquery","../Event/ClientRequest","../Event/InteractionRequest","./Loader","../Utility","../Event/TriggerRequest"],(function(e,t,r,n,o,l,i,s){"use strict";class u extends t.AbstractContainer{get(){return r(e.ScaffoldIdentifierEnum.contentModuleIframe)[0].contentWindow}beforeSetUrl(e){return this.consumerScope.invoke(new s("typo3.beforeSetUrl",e))}setUrl(e,t,i){let u;const c=this.resolveRouterElement();return null===c?(u=r.Deferred(),u.reject(),u):(t instanceof o||(t=new n("typo3.setUrl",null)),u=this.consumerScope.invoke(new s("typo3.setUrl",t)),u.then(()=>{l.start(),c.setAttribute("endpoint",e),c.setAttribute("module",i||null),c.parentElement.addEventListener("typo3-module-loaded",()=>l.finish(),{once:!0})}),u)}getUrl(){return this.resolveRouterElement().getAttribute("endpoint")}refresh(e){let t;const n=this.resolveIFrameElement();return null===n?(t=r.Deferred(),t.reject(),t):(t=this.consumerScope.invoke(new s("typo3.refresh",e)),t.then(()=>{n.contentWindow.location.reload()}),t)}getIdFromUrl(){return this.getUrl?parseInt(i.getParameterFromUrl(this.getUrl(),"id"),10):0}resolveIFrameElement(){const t=r(e.ScaffoldIdentifierEnum.contentModuleIframe+":first");return 0===t.length?null:t.get(0)}resolveRouterElement(){return document.querySelector(e.ScaffoldIdentifierEnum.contentModuleRouter)}}return u}));