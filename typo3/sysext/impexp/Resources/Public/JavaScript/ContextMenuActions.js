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
var __importDefault=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};define(["require","exports","jquery"],(function(e,t,r){"use strict";r=__importDefault(r);return new class{exportT3d(e,t){const a=r.default(this).data("action-url");"pages"===e?top.TYPO3.Backend.ContentContainer.setUrl(a+"&id="+t+"&tx_impexp[pagetree][id]="+t+"&tx_impexp[pagetree][levels]=0&tx_impexp[pagetree][tables][]=_ALL"):top.TYPO3.Backend.ContentContainer.setUrl(a+"&tx_impexp[record][]="+e+":"+t+"&tx_impexp[external_ref][tables][]=_ALL")}importT3d(e,t){const a=r.default(this).data("action-url");top.TYPO3.Backend.ContentContainer.setUrl(a+"&id="+t+"&table="+e)}}}));
=======
define((function(){"use strict";return new class{exportT3d(t,e){"pages"===t?top.TYPO3.Backend.ContentContainer.setUrl(top.TYPO3.settings.ImportExport.exportModuleUrl+"&id="+e+"&tx_impexp[pagetree][id]="+e+"&tx_impexp[pagetree][levels]=0&tx_impexp[pagetree][tables][]=_ALL"):top.TYPO3.Backend.ContentContainer.setUrl(top.TYPO3.settings.ImportExport.exportModuleUrl+"&tx_impexp[record][]="+t+":"+e+"&tx_impexp[external_ref][tables][]=_ALL")}importT3d(t,e){top.TYPO3.Backend.ContentContainer.setUrl(top.TYPO3.settings.ImportExport.importModuleUrl+"&id="+e+"&table="+t)}}}));
>>>>>>> 8b6510d860 ([POC][WIP][TASK] TypeScript: Do only use ES6 exports, no pseudo imports)
