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
import e from"@typo3/core/document-service.js"
import t from"@typo3/core/event/regular-event.js"
import n from"@typo3/core/event/debounce-event.js"
e.ready().then((()=>{const e=document.getElementById("search-field"),o=document.getElementById("t3js-filter-container")
new t("click",((t,n)=>{t.preventDefault(),e.value=n.dataset.filter,o.dispatchEvent(new CustomEvent("typo3:styleguide:update-icons",{detail:{searchValue:e.value}}))})).delegateTo(document,".t3js-filter-buttons button"),new n("input",(e=>{o.dispatchEvent(new CustomEvent("typo3:styleguide:update-icons",{detail:{searchValue:e.target.value}}))})).bindTo(e),new t("typo3:styleguide:update-icons",(e=>{const t=e.detail.searchValue,n=Array.from(o.querySelectorAll("[data-icon-identifier]"))
if(""===t)n.map((e=>e.hidden=!1))
else if(t.includes("type:")){const[,e]=t.split(":")
switch(e.toLowerCase()){case"bitmap":n.forEach((e=>{const t=null!==e.querySelector('img:not([src$=".svg"])')
e.hidden=!t}))
break
case"font":n.forEach((e=>{const t=null!==e.querySelector("i.fa")
e.hidden=!t}))
break
case"vector":n.forEach((e=>{const t=null!==e.querySelector('img[src$=".svg"]')
e.hidden=!t}))}}else n.forEach((e=>{e.hidden=!e.matches('[data-icon-identifier*="'+t+'"]')}))})).bindTo(o)}))
