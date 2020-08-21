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
define((function(){"use strict";class e{constructor(e,t,n){if(!e||!t)throw new Error("Properties componentName and eventName have to be defined");this.componentName=e,this.eventName=t,this.payload=n||{}}static fromData(t){let n=Object.assign({},t);return delete n.componentName,delete n.eventName,new e(t.componentName,t.eventName,n)}createCustomEvent(e="typo3"){return new CustomEvent([e,this.componentName,this.eventName].join(":"),{detail:this.payload})}}return{BroadcastMessage:e}}));