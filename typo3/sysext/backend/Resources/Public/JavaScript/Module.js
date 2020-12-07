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
<<<<<<< HEAD
define(["require","exports"],(function(t,e){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.getRecordFromName=void 0,e.getRecordFromName=function(t){const e=document.getElementById(t);return e?{name:t,component:e.dataset.component,navigationComponentId:e.dataset.navigationcomponentid,navigationFrameScript:e.dataset.navigationframescript,navigationFrameScriptParam:e.dataset.navigationframescriptparameters,link:e.getAttribute("href")}:{name:t,component:"",navigationComponentId:"",navigationFrameScript:"",navigationFrameScriptParam:"",link:""}}}));
=======
define((function(){"use strict";return{getRecordFromName:function(n){const a=document.getElementById(n);return a?{name:n,component:a.dataset.component,navigationComponentId:a.dataset.navigationcomponentid,navigationFrameScript:a.dataset.navigationframescript,navigationFrameScriptParam:a.dataset.navigationframescriptparameters,link:a.dataset.link}:{name:n,component:"",navigationComponentId:"",navigationFrameScript:"",navigationFrameScriptParam:"",link:""}}}}));
>>>>>>> 8b6510d860 ([POC][WIP][TASK] TypeScript: Do only use ES6 exports, no pseudo imports)
