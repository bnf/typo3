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
define(["jquery","./Viewport/ContentContainer","./Event/ConsumerScope","./Viewport/Loader","./Viewport/NavigationContainer","./Viewport/Topbar","TYPO3/CMS/Core/Event/ThrottleEvent"],(function(t,n,o,e,i,a,r){"use strict";class s{constructor(){this.Loader=e,this.NavigationContainer=null,this.ContentContainer=null,this.consumerScope=o,t(()=>this.initialize()),this.Topbar=new a,this.NavigationContainer=new i(this.consumerScope),this.ContentContainer=new n(this.consumerScope)}doLayout(){this.NavigationContainer.cleanup(),this.NavigationContainer.calculateScrollbar(),t(".t3js-topbar-header").css("padding-right",t(".t3js-scaffold-toolbar").outerWidth())}initialize(){this.doLayout(),new r("resize",()=>{this.doLayout()},100).bindTo(window)}}let c;return top.TYPO3.Backend?c=top.TYPO3.Backend:(c=new s,top.TYPO3.Backend=c),c}));