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
define(["../Enum/Viewport/ScaffoldIdentifier","./AbstractContainer","jquery","../Event/ClientRequest","../Event/InteractionRequest","./Loader","../Utility","../Event/TriggerRequest"],(function(e,t,r,n,o,l,i,s){"use strict";class c extends t.AbstractContainer{get(){return r(e.ScaffoldIdentifierEnum.contentModuleIframe)[0].contentWindow}beforeSetUrl(e){return this.consumerScope.invoke(new s("typo3.beforeSetUrl",e))}setUrl(t,i){let c;return null===this.resolveIFrameElement()?(c=r.Deferred(),c.reject(),c):(i instanceof o||(i=new n("typo3.setUrl",null)),c=this.consumerScope.invoke(new s("typo3.setUrl",i)),c.then(()=>{l.start(),r(e.ScaffoldIdentifierEnum.contentModuleIframe).attr("src",t).one("load",()=>{l.finish()})}),c)}getUrl(){return r(e.ScaffoldIdentifierEnum.contentModuleIframe).attr("src")}refresh(e){let t;const n=this.resolveIFrameElement();return null===n?(t=r.Deferred(),t.reject(),t):(t=this.consumerScope.invoke(new s("typo3.refresh",e)),t.then(()=>{n.contentWindow.location.reload()}),t)}getIdFromUrl(){return this.getUrl?parseInt(i.getParameterFromUrl(this.getUrl(),"id"),10):0}resolveIFrameElement(){const t=r(e.ScaffoldIdentifierEnum.contentModuleIframe+":first");return 0===t.length?null:t.get(0)}}return c}));