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
define(["./Viewport/ContentContainer","./Event/ConsumerScope","./Viewport/Loader","./Viewport/NavigationContainer","./Viewport/Topbar"],(function(n,t,e,o,i){"use strict";class r{constructor(){this.Loader=e,this.NavigationContainer=null,this.ContentContainer=null,this.consumerScope=t,this.Topbar=new i,this.NavigationContainer=new o(this.consumerScope),this.ContentContainer=new n(this.consumerScope)}}let a;return top.TYPO3.Backend?a=top.TYPO3.Backend:(a=new r,top.TYPO3.Backend=a),a}));