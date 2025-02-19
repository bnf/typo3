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
import{Tab as t}from"bootstrap";import e from"@typo3/backend/storage/browser-session.js";import r from"@typo3/backend/storage/client.js";import s from"@typo3/core/document-service.js";class o{constructor(){s.ready().then((()=>{document.querySelectorAll(".t3js-tabs").forEach((e=>{const r=o.receiveActiveTab(e.id);if(r){const e=document.querySelector('[data-bs-target="#'+r+'"]');e&&new t(e).show()}"1"===e.dataset.storeLastTab&&e.addEventListener("show.bs.tab",(t=>{const e=t.currentTarget.id,r=t.target.dataset.bsTarget.slice(1);o.storeActiveTab(e,r)}))}))})),r.unsetByPrefix("tabs-")}static receiveActiveTab(t){return e.get(t)||""}static storeActiveTab(t,r){e.set(t,r)}}var a=new o;export{a as default};