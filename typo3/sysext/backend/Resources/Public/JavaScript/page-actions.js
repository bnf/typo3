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
import e from"@typo3/core/document-service.js";import t from"@typo3/core/event/regular-event.js";import o from"@typo3/backend/storage/persistent.js";var n;!function(e){e.hiddenElements=".t3js-hidden-record"}(n||(n={}));export default new class{constructor(){e.ready().then((()=>{const e=document.getElementById("pageLayoutToggleShowHidden");null!==e&&new t("click",this.toggleContentElementVisibility).bindTo(e)}))}toggleContentElementVisibility(e){const t=e.target,i=document.querySelectorAll(n.hiddenElements),s="active"!==t.dataset.dropdowntoggleStatus;t.disabled=!0;for(const e of i){e.style.display="flow-root";const t=e.scrollHeight;e.style.overflow="clip",s?(e.addEventListener("transitionend",(()=>{e.style.display="",e.style.overflow="",e.style.height=""}),{once:!0}),e.style.height=t+"px"):(e.addEventListener("transitionend",(()=>{e.style.display="none",e.style.overflow=""}),{once:!0}),requestAnimationFrame((function(){e.style.height=t+"px",requestAnimationFrame((function(){e.style.height="0px"}))})))}t.dataset.dropdowntoggleStatus=s?"active":"inactive",o.set("moduleData.web_layout.showHidden",s?"1":"0").then((()=>{t.disabled=!1}))}};