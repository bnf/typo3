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
import e from"@typo3/core/ajax/ajax-request.js";export default new class{constructor(){this.data=null}get(e){return null===this.data&&(this.data=this.loadFromServer()),this.getRecursiveDataByDeepKey(this.data,e.split("."))}set(e,s){return null!==this.data&&(this.data=this.setRecursiveDataByDeepKey(this.data,e.split("."),s)),this.storeOnServer(e,s)}async addToList(s,t){const a=await new e(TYPO3.settings.ajaxUrls.usersettings_process).post({action:"addToList",key:s,value:t});return this.resolveResponse(a)}async removeFromList(s,t){const a=await new e(TYPO3.settings.ajaxUrls.usersettings_process).post({action:"removeFromList",key:s,value:t});return this.resolveResponse(a)}async unset(s){const t=await new e(TYPO3.settings.ajaxUrls.usersettings_process).post({action:"unset",key:s});return this.resolveResponse(t)}clear(){new e(TYPO3.settings.ajaxUrls.usersettings_process).post({action:"clear"}),this.data=null}isset(e){const s=this.get(e);return null!=s}load(e){this.data=e}loadFromServer(){const e=new URL(location.origin+TYPO3.settings.ajaxUrls.usersettings_process);e.searchParams.set("action","getAll");const s=new XMLHttpRequest;if(s.open("GET",e.toString(),!1),s.send(),200===s.status)return JSON.parse(s.responseText);throw`Unexpected response code ${s.status}, reason: ${s.responseText}`}async storeOnServer(s,t){const a=await new e(TYPO3.settings.ajaxUrls.usersettings_process).post({action:"set",key:s,value:t});return this.resolveResponse(a)}getRecursiveDataByDeepKey(e,s){if(1===s.length)return(e||{})[s[0]];const t=s.shift();return this.getRecursiveDataByDeepKey(e[t]||{},s)}setRecursiveDataByDeepKey(e,s,t){if(1===s.length)(e=e||{})[s[0]]=t;else{const a=s.shift();e[a]=this.setRecursiveDataByDeepKey(e[a]||{},s,t)}return e}async resolveResponse(e){const s=await e.resolve();return this.data=s,s}};