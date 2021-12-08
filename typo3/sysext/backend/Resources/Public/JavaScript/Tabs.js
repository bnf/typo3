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
var __importDefault=this&&this.__importDefault||function(t){return t&&t.__esModule?t:{default:t}};define(["require","exports","jquery","TYPO3/CMS/Backend/Storage/BrowserSession","TYPO3/CMS/Backend/Storage/Client","bootstrap"],(function(t,e,a,s,r){"use strict";a=__importDefault(a);return new class{constructor(){this.storeLastActiveTab=!0;const t=this;a.default(()=>{a.default(".t3js-tabs").each((function(){const e=a.default(this);t.storeLastActiveTab=1===e.data("storeLastTab");const s=t.receiveActiveTab(e.attr("id"));s&&e.find('a[href="'+s+'"]').tab("show"),e.on("show.bs.tab",e=>{if(t.storeLastActiveTab){const a=e.currentTarget.id,s=e.target.hash;t.storeActiveTab(a,s)}})}))}),r.unsetByPrefix("tabs-")}static getTimestamp(){return Math.round((new Date).getTime()/1e3)}receiveActiveTab(t){return s.get(t)||""}storeActiveTab(t,e){s.set(t,e)}}}));