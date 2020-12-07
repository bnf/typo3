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
define(["jquery"],(function(t){"use strict";return new class{constructor(){this.registerEvents()}registerEvents(){t('input[type="checkbox"][data-lang]').on("change",this.toggleNewButton)}toggleNewButton(e){const a=t(e.currentTarget),n=parseInt(a.data("lang"),10),s=t(".t3js-language-new-"+n),c=t('input[type="checkbox"][data-lang="'+n+'"]:checked'),g=[];c.each((t,e)=>{g.push("cmd[pages]["+e.dataset.uid+"][localize]="+n)});const r=s.data("editUrl")+"&"+g.join("&");s.attr("href",r),s.toggleClass("disabled",0===c.length)}}}));