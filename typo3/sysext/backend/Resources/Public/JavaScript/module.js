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
var n;!function(n){n.link="[data-moduleroute-identifier]"}(n||(n={}));class e{static getRouteFromElement(n){return{identifier:n.dataset.modulerouteIdentifier,params:n.dataset.modulerouteParams}}static getFromName(n){const e=function(n){const e=function(){if(null===t){const n=String(document.querySelector("[data-modulemenu]")?.dataset.modulesInformation||"");if(""!==n)try{t=JSON.parse(n)}catch{console.error("Invalid modules information provided."),t=null}}return t}();if(null!==e)for(const[t,o]of Object.entries(e))if(n===t||o.aliases.includes(n))return e[t];return null}(n);return null===e?{name:n,aliases:[],component:"",navigationComponentId:"",parent:"",link:""}:{name:n,aliases:e.aliases||[],component:e.component||"",navigationComponentId:e.navigationComponentId||"",parent:e.parent||"",link:e.link||""}}}let t=null;function o(){t=null}export{n as ModuleSelector,e as ModuleUtility,o as flushModuleCache};