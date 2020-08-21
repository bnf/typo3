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
define(["TYPO3/CMS/Core/Event/RegularEvent"],(function(t){"use strict";return new class{constructor(){this.registerEvents()}registerEvents(){new t("click",(function(){const t=this.dataset.filelistClickTarget;document.querySelector(t).click()})).delegateTo(document.body,'[data-filelist-click-target]:not([data-filelist-click-target=""]'),new t("change",(function(){const t=this.dataset.filelistChangeTarget;document.querySelector(t).value=this.value})).delegateTo(document.body,'[data-filelist-change-target]:not([data-filelist-change-target=""])')}}}));