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
import e from"@typo3/backend/link-browser.js"
import t from"@typo3/core/event/regular-event.js"
export default new class{constructor(){new t("submit",((t,o)=>{t.preventDefault()
const n=o.querySelector('[name="lemail"]').value,r=new URLSearchParams
for(const a of["subject","cc","bcc","body"]){const l=o.querySelector('[data-mailto-part="'+a+'"]')
l?.value.length&&r.set(a,encodeURIComponent(l.value))}let c="mailto:"+n;[...r].length>0&&(c+="?"+r.toString()),e.finalizeFunction(c)})).delegateTo(document,"#lmailform")}}
