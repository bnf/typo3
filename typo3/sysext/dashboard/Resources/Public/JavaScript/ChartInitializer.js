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
define(["TYPO3/CMS/Dashboard/Contrib/chartjs","TYPO3/CMS/Core/Event/RegularEvent"],(function(e,t){"use strict";return new class{constructor(){this.selector=".dashboard-item",this.initialize()}initialize(){new t("widgetContentRendered",(function(t){t.preventDefault();const n=t.detail;if(void 0===n||void 0===n.graphConfig)return;let i,o=this.querySelector("canvas");null!==o&&(i=o.getContext("2d")),void 0!==i&&new e(i,n.graphConfig)})).delegateTo(document,this.selector)}}}));