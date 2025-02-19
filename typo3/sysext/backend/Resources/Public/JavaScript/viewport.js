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
import o from"@typo3/backend/viewport/content-container.js";import t from"@typo3/backend/event/consumer-scope.js";import n from"@typo3/backend/viewport/loader.js";import e from"@typo3/backend/viewport/navigation-container.js";import r from"@typo3/backend/viewport/topbar.js";class i{constructor(){this.Loader=n,this.NavigationContainer=null,this.ContentContainer=null,this.consumerScope=t,this.Topbar=new r,this.NavigationContainer=new e(this.consumerScope),this.ContentContainer=new o(this.consumerScope)}}let a;top.TYPO3&&top.TYPO3.Backend?a=top.TYPO3.Backend:(a=new i,void 0!==top.TYPO3&&(top.TYPO3.Backend=a));var p=a;export{p as default};