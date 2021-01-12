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
define(["require","exports"],(function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.BroadcastMessage=void 0;class a{constructor(e,t,a){if(!e||!t)throw new Error("Properties componentName and eventName have to be defined");this.componentName=e,this.eventName=t,this.payload=a||{}}static fromData(e){return new a(e.componentName,e.eventName,e.payload)}createCustomEvent(e="typo3"){return new CustomEvent([e,this.componentName,this.eventName].join(":"),{detail:this.payload})}}t.BroadcastMessage=a}));