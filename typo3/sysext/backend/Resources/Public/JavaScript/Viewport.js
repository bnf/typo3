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
define(["require","exports","./Viewport/ContentContainer","./Event/ConsumerScope","./Viewport/Loader","./Viewport/NavigationContainer","./Viewport/Topbar"],(function(e,t,n,i,o,r,a){"use strict";class s{constructor(){this.Loader=o,this.NavigationContainer=null,this.ContentContainer=null,this.consumerScope=i,this.initializeEvents(),this.Topbar=new a,this.NavigationContainer=new r(this.consumerScope),this.ContentContainer=new n(this.consumerScope)}initializeEvents(){document.addEventListener("typo3-module-load",e=>{var t;let n=e.detail.url.split("token=");if(n.length<2)return;if(n[0].includes("/install/backend-user-confirmation"))return;let i=n[0]+(null!==(t=n[1].split("&",2)[1])&&void 0!==t?t:"");i=i.replace(/\?$/,"");if(e.detail.decorate)window.history.replaceState({},"TYPO3 Backend",i);else{const t=e.detail.module||null;window.history.pushState({module:t},"TYPO3 Backend",i)}})}}let l;return top.TYPO3.Backend?l=top.TYPO3.Backend:(l=new s,top.TYPO3.Backend=l),l}));