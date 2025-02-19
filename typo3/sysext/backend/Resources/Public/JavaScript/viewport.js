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
import o from"@typo3/backend/viewport/content-container.js";import t from"@typo3/backend/event/consumer-scope.js";import n from"@typo3/backend/viewport/loader.js";import e from"@typo3/backend/viewport/navigation-container.js";import i from"@typo3/backend/viewport/topbar.js";class r{constructor(){this.Loader=n,this.NavigationContainer=null,this.ContentContainer=null,this.consumerScope=t,this.Topbar=new i,this.NavigationContainer=new e(this.consumerScope),this.ContentContainer=new o(this.consumerScope)}}let a;top.TYPO3&&top.TYPO3.Backend?a=top.TYPO3.Backend:(a=new r,void 0!==top.TYPO3&&(top.TYPO3.Backend=a));export default a;