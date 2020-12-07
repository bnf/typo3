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
define(["jquery","bootstrap"],(function(t){"use strict";const i=new class{constructor(){t(()=>{this.initialize('[data-toggle="tooltip"]')})}initialize(i,o){o=o||{},t(i).tooltip(o)}show(t,i){t.attr("data-placement","auto").attr("data-title",i).tooltip("show")}hide(t){t.tooltip("hide")}};return TYPO3.Tooltip=i,i}));