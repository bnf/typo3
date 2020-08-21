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
define(["jquery","./Storage/BrowserSession","./Storage/Client","bootstrap"],(function(t,e,s){"use strict";return new class{constructor(){this.storeLastActiveTab=!0;const e=this;t(()=>{t(".t3js-tabs").each((function(){const s=t(this);e.storeLastActiveTab=1===s.data("storeLastTab");const a=e.receiveActiveTab(s.attr("id"));a&&s.find('a[href="'+a+'"]').tab("show"),s.on("show.bs.tab",t=>{if(e.storeLastActiveTab){const s=t.currentTarget.id,a=t.target.hash;e.storeActiveTab(s,a)}})}))}),s.unsetByPrefix("tabs-")}static getTimestamp(){return Math.round((new Date).getTime()/1e3)}receiveActiveTab(t){return e.get(t)||""}storeActiveTab(t,s){e.set(t,s)}}}));