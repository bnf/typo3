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
var __importDefault=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};define(["require","exports","jquery","./Viewport/ContentContainer","./Event/ConsumerScope","./Viewport/Loader","./Viewport/NavigationContainer","./Viewport/Topbar","TYPO3/CMS/Core/Event/ThrottleEvent"],(function(e,t,o,n,i,a,l,r,d){"use strict";o=__importDefault(o);class s{constructor(){this.Loader=a,this.NavigationContainer=null,this.ContentContainer=null,this.consumerScope=i,o.default(()=>this.initialize()),this.initializeEvents(),this.Topbar=new r,this.NavigationContainer=new l(this.consumerScope),this.ContentContainer=new n(this.consumerScope)}doLayout(){this.NavigationContainer.cleanup(),this.NavigationContainer.calculateScrollbar(),o.default(".t3js-topbar-header").css("padding-right",o.default(".t3js-scaffold-toolbar").outerWidth())}initializeEvents(){document.addEventListener("typo3-module-load",e=>{var t;console.log("catched typo3-module-load",e);let o=e.detail.url,n=o.split("token=");if(n.length<2)return;if(n[0].includes("/install/backend-user-confirmation"))return;let i=n[0]+(null!==(t=n[1].split("&",2)[1])&&void 0!==t?t:"");i=i.replace(/\?$/,"");const a=e.detail.decorate,l=e.detail.module||null;a?(window.history.replaceState({module:l,url:o},"TYPO3 Backend",i),console.error("replacing state in load: "+i)):(window.history.pushState({module:l,url:o},"TYPO3 Backend",i),console.error("pushing state in load: "+i))}),document.addEventListener("typo3-module-loaded",e=>{console.log("catched typo3-module-loaded",e);const t=e.detail.module||null,o=e.detail.url||null;(t||o)&&(window.history.replaceState({module:t,url:o},"TYPO3 Backend"),console.error("replacing state in loaded"))})}initialize(){this.doLayout(),new d("resize",()=>{this.doLayout()},100).bindTo(window)}}let u;return top.TYPO3.Backend?u=top.TYPO3.Backend:(u=new s,top.TYPO3.Backend=u),u}));