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
import{topWindow}from"@typo3/backend/utility/top-frame.js";export function topLevelModuleImport(o){const e=new CustomEvent("typo3:import-javascript-module",{detail:{specifier:o,importPromise:null}});return topWindow.document.dispatchEvent(e),e.detail.importPromise?e.detail.importPromise:Promise.reject(new Error("Top level did not respond with a promise."))}