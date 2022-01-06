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
"use strict";!function(){if(!document.currentScript)return;const t=document.currentScript.textContent.replace(/^\s*\/\*\s*|\s*\*\/\s*/g,""),r=JSON.parse(t);var e;(e="TYPO3/CMS/Core/JavaScriptItemProcessor.js",import(e).catch(()=>window.importShim(e))).then(({JavaScriptItemProcessor:t})=>{new t(["loadRequireJs","globalAssignment","javaScriptModuleInstruction"]).processItems(r)})}();