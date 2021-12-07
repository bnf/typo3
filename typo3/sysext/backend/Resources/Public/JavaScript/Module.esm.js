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
export function getRecordFromName(t){const a=document.getElementById(t);return a?{name:t,component:a.dataset.component,navigationComponentId:a.dataset.navigationcomponentid,navigationFrameScript:a.dataset.navigationframescript,navigationFrameScriptParam:a.dataset.navigationframescriptparameters,link:a.getAttribute("href")}:{name:t,component:"",navigationComponentId:"",navigationFrameScript:"",navigationFrameScriptParam:"",link:""}}