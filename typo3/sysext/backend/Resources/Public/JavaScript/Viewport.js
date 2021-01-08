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
define(["require","exports","./Viewport/ContentContainer","./Event/ConsumerScope","./Viewport/Loader","./Viewport/NavigationContainer","./Viewport/Topbar"],(function(e,t,n,o,i,l,a){"use strict";class r{constructor(){this.Loader=i,this.NavigationContainer=null,this.ContentContainer=null,this.consumerScope=o,this.initializeEvents(),this.Topbar=new a,this.NavigationContainer=new l(this.consumerScope),this.ContentContainer=new n(this.consumerScope)}initializeEvents(){document.addEventListener("typo3-module-load",e=>{var t;console.log("catched typo3-module-load",e);let n=e.detail.url,o=n.split("token=");if(o.length<2)return;if(o[0].includes("/install/backend-user-confirmation"))return;let i=o[0]+(null!==(t=o[1].split("&",2)[1])&&void 0!==t?t:"");i=i.replace(/\?$/,"");const l=e.detail.decorate,a=e.detail.module||null;l?window.history.replaceState({module:a,url:n},"TYPO3 Backend",i):window.history.pushState({module:a,url:n},"TYPO3 Backend",i)}),document.addEventListener("typo3-module-loaded",e=>{console.log("catched typo3-module-loaded",e);const t=e.detail.module||null,n=e.detail.url||null;(t||n)&&window.history.replaceState({module:t,url:n},"TYPO3 Backend")})}}let d;return top.TYPO3.Backend?d=top.TYPO3.Backend:(d=new r,top.TYPO3.Backend=d),d}));