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
define(["jquery","bootstrap"],(function(t,o){"use strict";return new class{constructor(){this.DEFAULT_SELECTOR='[data-bs-toggle="popover"]',this.initialize()}initialize(a){a=a||this.DEFAULT_SELECTOR,t(a).each((a,e)=>{const s=new o(e);t(e).data("typo3.bs.popover",s)})}popover(a){a.each((a,e)=>{const s=new o(e);t(e).data("typo3.bs.popover",s)})}setOptions(o,a){const e=(a=a||{}).title||o.data("title")||"",s=a.content||o.data("bs-content")||"";o.attr("data-bs-original-title",e).attr("data-bs-content",s).attr("data-bs-placement","auto"),t.each(a,(t,a)=>{this.setOption(o,t,a)})}setOption(o,a,e){"content"===a?o.attr("data-bs-content",e):o.each((o,s)=>{const n=t(s).data("typo3.bs.popover");n&&(n.config[a]=e)})}show(o){o.each((o,a)=>{const e=t(a).data("typo3.bs.popover");e&&e.show()})}hide(o){o.each((o,a)=>{const e=t(a).data("typo3.bs.popover");e&&e.hide()})}destroy(o){o.each((o,a)=>{const e=t(a).data("typo3.bs.popover");e&&e.dispose()})}toggle(o){o.each((o,a)=>{const e=t(a).data("typo3.bs.popover");e&&e.toggle()})}}}));