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
var __importDefault=this&&this.__importDefault||function(t){return t&&t.__esModule?t:{default:t}};define(["require","exports","jquery","./Viewport/ContentContainer","./Event/ConsumerScope","./Viewport/Loader","./Viewport/NavigationContainer","./Viewport/Topbar","TYPO3/CMS/Core/Event/ThrottleEvent"],(function(t,e,o,i,n,a,l,r,d){"use strict";o=__importDefault(o);class u{constructor(){this.Loader=a,this.NavigationContainer=null,this.ContentContainer=null,this.consumerScope=n,o.default(()=>this.initialize()),this.initializeEvents(),this.Topbar=new r,this.NavigationContainer=new l(this.consumerScope),this.ContentContainer=new i(this.consumerScope)}doLayout(){this.NavigationContainer.cleanup(),this.NavigationContainer.calculateScrollbar(),o.default(".t3js-topbar-header").css("padding-right",o.default(".t3js-scaffold-toolbar").outerWidth())}initializeEvents(){document.addEventListener("typo3-module-load",t=>{var e;console.log("catched typo3-module-load",t);let o=t.detail.url,i=o.split("token=");if(i.length<2)return;if(i[0].includes("/install/backend-user-confirmation"))return;let n=i[0]+(null!==(e=i[1].split("&",2)[1])&&void 0!==e?e:"");n=n.replace(/\?$/,"");const a=t.detail.decorate,l=t.detail.module||null;a?window.history.replaceState({module:l,url:o},"TYPO3 Backend",n):window.history.pushState({module:l,url:o},"TYPO3 Backend",n)}),document.addEventListener("typo3-module-loaded",t=>{console.log("catched typo3-module-loaded",t);const e=t.detail.module||null,o=t.detail.url||null;(e||o)&&window.history.replaceState({module:e,url:o},"TYPO3 Backend")})}initialize(){this.doLayout(),new d("resize",()=>{this.doLayout()},100).bindTo(window)}}let s;return top.TYPO3.Backend?s=top.TYPO3.Backend:(s=new u,top.TYPO3.Backend=s),s}));