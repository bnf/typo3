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
define(["jquery","bootstrap"],(function(t,o){"use strict";return new class{constructor(){this.DEFAULT_SELECTOR='[data-bs-toggle="popover"]',this.initialize()}initialize(e){e=e||this.DEFAULT_SELECTOR,t(e).each((e,a)=>{const p=new o.Popover(a);t(a).data("typo3.bs.popover",p)})}popover(e){e.each((e,a)=>{const p=new o.Popover(a);t(a).data("typo3.bs.popover",p)})}setOptions(o,e){(e=e||{}).html=!0;const a=e.title||o.data("title")||"",p=e.content||o.data("bs-content")||"";o.attr("data-bs-original-title",a).attr("data-bs-content",p).attr("data-bs-placement","auto"),t.each(e,(t,e)=>{this.setOption(o,t,e)})}setOption(o,e,a){if("content"===e){const t=o.data("typo3.bs.popover");t._config.content=a,t.setContent(t.tip)}else o.each((o,p)=>{const s=t(p).data("typo3.bs.popover");s&&(s._config[e]=a)})}show(o){o.each((o,e)=>{const a=t(e).data("typo3.bs.popover");a&&a.show()})}hide(o){o.each((o,e)=>{const a=t(e).data("typo3.bs.popover");a&&a.hide()})}destroy(o){o.each((o,e)=>{const a=t(e).data("typo3.bs.popover");a&&a.dispose()})}toggle(o){o.each((o,e)=>{const a=t(e).data("typo3.bs.popover");a&&a.toggle()})}update(t){t.data("typo3.bs.popover")._popper.update()}}}));