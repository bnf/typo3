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
import t from"@typo3/backend/viewport/content-container.js";import e from"@typo3/backend/event/consumer-scope.js";import n from"@typo3/backend/viewport/loader.js";import r from"@typo3/backend/viewport/navigation-container.js";import i from"@typo3/backend/viewport/topbar.js";class a{Loader=n;Topbar;NavigationContainer=null;ContentContainer=null;consumerScope=e;constructor(){this.Topbar=new i,this.NavigationContainer=new r(this.consumerScope),this.ContentContainer=new t(this.consumerScope)}}let o;!top.TYPO3||!top.TYPO3.Backend?(o=new a,typeof top.TYPO3<"u"&&(top.TYPO3.Backend=o)):o=top.TYPO3.Backend;var p=o;export{p as default};
