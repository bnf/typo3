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
import i from"@typo3/core/ajax/ajax-request.js"
import e from"@typo3/backend/storage/client.js"
import{Sizes as t,States as o,MarkupIdentifiers as s}from"@typo3/backend/enum/icon-types.js"
import{css as n}from"lit"
import{DedupeAsyncTask as r}from"@typo3/core/cache/dedupe-async-task.js"
export class IconStyles{static getStyles(){return[n`:host{align-items:center;display:inline-flex;height:var(--icon-size,1em);justify-content:center;line-height:var(--icon-size,1em);vertical-align:-22%;width:var(--icon-size,1em)}:host([raw]) .icon-size-default,:host([size=default]){--icon-size:1em}:host([raw]) .icon-size-small,:host([size=small]){--icon-size:var(--icon-size-small,16px)}:host([raw]) .icon-size-medium,:host([size=medium]){--icon-size:var(--icon-size-medium,32px)}:host([raw]) .icon-size-large,:host([size=large]){--icon-size:var(--icon-size-large,48px)}:host([raw]) .icon-size-mega,:host([size=mega]){--icon-size:var(--icon-size-mega,64px)}.icon{color:var(--icon-color-primary,currentColor);display:flex;flex-shrink:0;height:var(--icon-size,1em);line-height:var(--icon-size,1em);overflow:hidden;position:relative;white-space:nowrap;width:var(--icon-size,1em)}.icon img,.icon svg{display:block;height:100%;width:100%}.icon *{display:block;line-height:inherit}.icon-markup{display:block;left:0;top:0}.icon-markup,.icon-overlay{bottom:0;position:absolute;right:0;text-align:center}.icon-overlay{height:68.75%;width:68.75%}.icon-spin .icon-markup{animation:icon-spin 2s linear infinite}@keyframes icon-spin{0%{transform:rotate(0)}to{transform:rotate(1turn)}}.icon-state-disabled .icon-markup{opacity:var(--icon-opacity-disabled,.5)}.icon-unify{font-size:calc(var(--icon-size, 1em)*var(--icon-unify-modifier, .86));line-height:var(--icon-size,1em)}.icon-overlay .icon-unify{font-size:calc((var(--icon-size, 1em)/1.6)*var(--icon-unify-modifier, .86));line-height:calc(var(--icon-size, 1em)/1.6)}`]}}class c{constructor(){this.sizes=t,this.states=o,this.markupIdentifiers=s,this.promiseCache=new r}getIcon(i,n,r,c,a,l){const h=[i,n=n||t.default,r,c=c||o.default,a=a||s.default],m=h.join("_")
return this.getIconRegistryCache().then((i=>(e.isset("icon_registry_cache_identifier")&&e.get("icon_registry_cache_identifier")===i||(e.unsetByPrefix("icon_"),e.set("icon_registry_cache_identifier",i)),this.fetchFromLocal(m).then(null,(()=>this.fetchFromRemote(h,m,l))))))}getIconRegistryCache(){return this.promiseCache.get("icon_registry_cache_identifier",(async e=>{const t=await new i(TYPO3.settings.ajaxUrls.icons_cache).get({signal:e})
return await t.resolve()}))}fetchFromRemote(t,o,s){return this.promiseCache.get(o,(async s=>{const n=await new i(TYPO3.settings.ajaxUrls.icons).withQueryArguments({icon:JSON.stringify(t)}).get({signal:s}),r=await n.resolve()
return!n.response.redirected&&r.startsWith("<span")&&r.includes("t3js-icon")&&r.includes('<span class="icon-markup">')&&e.set("icon_"+o,r),r}),s)}fetchFromLocal(i){return e.isset("icon_"+i)?Promise.resolve(e.get("icon_"+i)):Promise.reject()}}let a
a||(a=new c,"undefined"!=typeof TYPO3&&(TYPO3.Icons=a))
export default a
