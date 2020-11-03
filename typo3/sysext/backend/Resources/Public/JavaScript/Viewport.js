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
var __importDefault=this&&this.__importDefault||function(t){return t&&t.__esModule?t:{default:t}};define(["require","exports","jquery","./Viewport/ContentContainer","./Event/ConsumerScope","./Viewport/Loader","./Viewport/NavigationContainer","./Viewport/Topbar","TYPO3/CMS/Core/Event/ThrottleEvent"],(function(t,e,i,n,o,a,r,l,s){"use strict";i=__importDefault(i);class u{constructor(){this.Loader=a,this.NavigationContainer=null,this.ContentContainer=null,this.consumerScope=o,i.default(()=>this.initialize()),this.initializeEvents(),this.Topbar=new l,this.NavigationContainer=new r(this.consumerScope),this.ContentContainer=new n(this.consumerScope)}doLayout(){this.NavigationContainer.cleanup(),this.NavigationContainer.calculateScrollbar(),i.default(".t3js-topbar-header").css("padding-right",i.default(".t3js-scaffold-toolbar").outerWidth())}initializeEvents(){document.addEventListener("typo3-module-load",t=>{var e;let i=t.detail.url.split("token=");if(i.length<2)return;if(i[0].includes("/install/backend-user-confirmation"))return;let n=i[0]+(null!==(e=i[1].split("&",2)[1])&&void 0!==e?e:"");n=n.replace(/\?$/,"");if(t.detail.decorate)window.history.replaceState({},"TYPO3 Backend",n);else{const e=t.detail.module||null;window.history.pushState({module:e},"TYPO3 Backend",n)}})}initialize(){this.doLayout(),new s("resize",()=>{this.doLayout()},100).bindTo(window)}}let d;return top.TYPO3.Backend?d=top.TYPO3.Backend:(d=new u,top.TYPO3.Backend=d),d}));