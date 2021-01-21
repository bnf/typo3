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
define(["require","exports","./Viewport/ContentContainer","./Event/ConsumerScope","./Viewport/Loader","./Viewport/NavigationContainer","./Viewport/Topbar"],(function(e,t,o,n,i,l,r){"use strict";class a{constructor(){this.Loader=i,this.NavigationContainer=null,this.ContentContainer=null,this.consumerScope=n,this.initializeEvents(),this.Topbar=new r,this.NavigationContainer=new l(this.consumerScope),this.ContentContainer=new o(this.consumerScope)}initializeEvents(){document.addEventListener("typo3-module-load",e=>{var t;console.log("catched typo3-module-load",e);let o=e.detail.url,n=o.split("token=");if(n.length<2)return;if(n[0].includes("/install/backend-user-confirmation"))return;let i=n[0]+(null!==(t=n[1].split("&",2)[1])&&void 0!==t?t:"");i=i.replace(/\?$/,"");const l=e.detail.decorate,r=e.detail.module||null;l?(window.history.replaceState({module:r,url:o},"TYPO3 Backend",i),console.error("replacing state in load: "+i)):(window.history.pushState({module:r,url:o},"TYPO3 Backend",i),console.error("pushing state in load: "+i))}),document.addEventListener("typo3-module-loaded",e=>{console.log("catched typo3-module-loaded",e);const t=e.detail.module||null,o=e.detail.url||null;(t||o)&&(window.history.replaceState({module:t,url:o},"TYPO3 Backend"),console.error("replacing state in loaded"))})}}let d;return top.TYPO3.Backend?d=top.TYPO3.Backend:(d=new a,top.TYPO3.Backend=d),d}));