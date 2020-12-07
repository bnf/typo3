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
define(["TYPO3/CMS/Core/Ajax/AjaxRequest","./Storage/Client","./Enum/IconTypes"],(function(e,i,t){"use strict";class s{constructor(){this.sizes=t.Sizes,this.states=t.States,this.markupIdentifiers=t.MarkupIdentifiers,this.promiseCache={}}getIcon(e,s,r,c,n){const o=[e,s=s||t.Sizes.default,r,c=c||t.States.default,n=n||t.MarkupIdentifiers.default],a=o.join("_");return this.getIconRegistryCache().then(e=>(i.isset("icon_registry_cache_identifier")&&i.get("icon_registry_cache_identifier")===e||(i.unsetByPrefix("icon_"),i.set("icon_registry_cache_identifier",e)),this.fetchFromLocal(a).then(null,()=>this.fetchFromRemote(o,a))))}getIconRegistryCache(){return this.isPromiseCached("icon_registry_cache_identifier")||this.putInPromiseCache("icon_registry_cache_identifier",new e(TYPO3.settings.ajaxUrls.icons_cache).get().then(async e=>await e.resolve())),this.getFromPromiseCache("icon_registry_cache_identifier")}fetchFromRemote(t,s){if(!this.isPromiseCached(s)){const r={icon:JSON.stringify(t)};this.putInPromiseCache(s,new e(TYPO3.settings.ajaxUrls.icons).withQueryArguments(r).get().then(async e=>{const t=await e.resolve();return t.includes("t3js-icon")&&t.includes('<span class="icon-markup">')&&i.set("icon_"+s,t),t}))}return this.getFromPromiseCache(s)}fetchFromLocal(e){return i.isset("icon_"+e)?Promise.resolve(i.get("icon_"+e)):Promise.reject()}isPromiseCached(e){return void 0!==this.promiseCache[e]}getFromPromiseCache(e){return this.promiseCache[e]}putInPromiseCache(e,i){this.promiseCache[e]=i}}let r;return r||(r=new s,TYPO3.Icons=r),r}));