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
import{ContextRoot as t,ContextEvent as n}from"@lit/context";window===top||window.name==="typo3-backend"?new t().attach(document.documentElement):window.frameElement&&document.documentElement.addEventListener("context-request",e=>{window.frameElement.dispatchEvent(new n(e.context,e.contextTarget,e.callback,e.subscribe))});
