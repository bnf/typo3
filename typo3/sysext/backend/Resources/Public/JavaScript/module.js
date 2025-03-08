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
export var ModuleSelector
!function(e){e.link="[data-moduleroute-identifier]"}(ModuleSelector||(ModuleSelector={}))
export class ModuleUtility{static getRouteFromElement(e){return{identifier:e.dataset.modulerouteIdentifier,params:e.dataset.modulerouteParams}}static getFromName(n){const t=function(n){const t=function(){if(null===e){const n=String(document.querySelector("[data-modulemenu]")?.dataset.modulesInformation||"")
if(""!==n)try{e=JSON.parse(n)}catch{console.error("Invalid modules information provided."),e=null}}return e}()
if(null!==t)for(const[e,o]of Object.entries(t))if(n===e||o.aliases.includes(n))return t[e]
return null}(n)
return null===t?{name:n,aliases:[],component:"",navigationComponentId:"",parent:"",link:""}:{name:n,aliases:t.aliases||[],component:t.component||"",navigationComponentId:t.navigationComponentId||"",parent:t.parent||"",link:t.link||""}}}let e=null
export function flushModuleCache(){e=null}