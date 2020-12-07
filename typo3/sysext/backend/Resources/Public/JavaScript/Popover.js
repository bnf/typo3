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
define(["jquery","bootstrap"],(function(t,o){"use strict";return new class{constructor(){this.DEFAULT_SELECTOR='[data-bs-toggle="popover"]',this.initialize()}initialize(e){e=e||this.DEFAULT_SELECTOR,t(e).each((e,a)=>{const s=new o.Popover(a);t(a).data("typo3.bs.popover",s)})}popover(e){e.each((e,a)=>{const s=new o.Popover(a);t(a).data("typo3.bs.popover",s)})}setOptions(o,e){const a=(e=e||{}).title||o.data("title")||"",s=e.content||o.data("bs-content")||"";o.attr("data-bs-original-title",a).attr("data-bs-content",s).attr("data-bs-placement","auto"),t.each(e,(t,e)=>{this.setOption(o,t,e)})}setOption(o,e,a){"content"===e?o.attr("data-bs-content",a):o.each((o,s)=>{const n=t(s).data("typo3.bs.popover");n&&(n.config[e]=a)})}show(o){o.each((o,e)=>{const a=t(e).data("typo3.bs.popover");a&&a.show()})}hide(o){o.each((o,e)=>{const a=t(e).data("typo3.bs.popover");a&&a.hide()})}destroy(o){o.each((o,e)=>{const a=t(e).data("typo3.bs.popover");a&&a.dispose()})}toggle(o){o.each((o,e)=>{const a=t(e).data("typo3.bs.popover");a&&a.toggle()})}}}));