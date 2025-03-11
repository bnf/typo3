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
"use strict"
if(document.currentScript){const scriptElement=document.currentScript,textContent=scriptElement.textContent.replace(/^\s*\/\*\s*|\s*\*\/\s*/g,""),items=JSON.parse(textContent)
import("@typo3/core/java-script-item-processor.js").then((({JavaScriptItemProcessor})=>{(new JavaScriptItemProcessor).processItems(items)}))}