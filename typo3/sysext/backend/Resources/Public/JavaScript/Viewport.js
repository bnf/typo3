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
define(["require","exports","TYPO3/CMS/Backend/Viewport/ContentContainer","TYPO3/CMS/Backend/Event/ConsumerScope","TYPO3/CMS/Backend/Viewport/Loader","TYPO3/CMS/Backend/Viewport/NavigationContainer","TYPO3/CMS/Backend/Viewport/Topbar"],(function(n,e,t,o,i,r,a){"use strict";class c{constructor(){this.Loader=i,this.NavigationContainer=null,this.ContentContainer=null,this.consumerScope=o,this.Topbar=new a,this.NavigationContainer=new r(this.consumerScope),this.ContentContainer=new t(this.consumerScope)}}let s;return top.TYPO3.Backend?s=top.TYPO3.Backend:(s=new c,top.TYPO3.Backend=s),s}));