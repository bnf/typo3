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
import t from"tablesort"
import"tablesort.dotsep.js"
import"tablesort.number.js"
import{IconElement as e}from"@typo3/backend/element/icon-element.js"
import{Sizes as o}from"@typo3/backend/enum/icon-types.js"
class n extends t{init(t,n){let r,d
if(this.table=t,this.thead=!1,this.options=n,t.rows&&t.rows.length>0)if(t.tHead&&t.tHead.rows.length>0){for(let e=0;e<t.tHead.rows.length;e++)if("thead"===t.tHead.rows[e].getAttribute("data-sort-method")){r=t.tHead.rows[e]
break}r||(r=t.tHead.rows[t.tHead.rows.length-1]),this.thead=!0}else r=t.rows[0]
if(!r)return
const a=t=>{t.preventDefault(),t.stopImmediatePropagation()
const e=t.currentTarget.dataset.sortDirection,o=t.currentTarget.closest("th, td")
this.current===o&&this.current.ariaSort===e||(o.ariaSort="ascending"===e?"descending":"ascending",this.current&&this.current!==o&&this.current.removeAttribute("aria-sort"),this.current=o,this.sortTable(o))}
for(let t=0;t<r.cells.length;t++){const n=r.cells[t]
if(n.setAttribute("role","columnheader"),"none"!==n.getAttribute("data-sort-method")){const t=document.createElement("button")
t.classList.add("dropdown-toggle","dropdown-toggle-link"),t.dataset.bsToggle="dropdown",t.dataset.sortingToggle="true",t.type="button",t.ariaExpanded="false",t.textContent=n.textContent
const r=new e
r.identifier="empty-empty",r.size=o.small
const s=document.createElement("div")
s.appendChild(r),t.appendChild(s),n.replaceChildren(t)
const i=document.createElement("div")
i.classList.add("dropdown-menu")
const c=top.TYPO3.lang["labels.sorting.asc"]||"Sort ascending",l=document.createElement("button")
l.classList.add("dropdown-item"),l.type="button",l.title=c,l.ariaLabel=c,l.dataset.sortDirection="ascending",l.addEventListener("click",a,!1)
const p=document.createElement("span")
p.classList.add("dropdown-item-columns"),l.appendChild(p)
const m=document.createElement("span")
m.classList.add("dropdown-item-column","dropdown-item-column-icon","text-primary"),p.appendChild(m)
const u=new e
u.identifier="empty-empty",u.size=o.small,m.appendChild(u)
const g=document.createElement("span")
g.classList.add("dropdown-item-column","dropdown-item-column-title"),g.textContent=c,p.appendChild(g),i.appendChild(l)
const h=top.TYPO3.lang["labels.sorting.desc"]||"Sort descending",y=document.createElement("button")
y.classList.add("dropdown-item"),y.type="button",y.title=h,y.ariaLabel=h,y.dataset.sortDirection="descending",y.addEventListener("click",a,!1)
const w=document.createElement("span")
w.classList.add("dropdown-item-columns"),y.appendChild(w)
const b=document.createElement("span")
b.classList.add("dropdown-item-column","dropdown-item-column-icon","text-primary"),w.appendChild(b)
const f=new e
f.identifier="empty-empty",f.size=o.small,b.appendChild(f)
const C=document.createElement("span")
C.classList.add("dropdown-item-column","dropdown-item-column-title"),C.textContent=h,w.appendChild(C),i.appendChild(y),n.appendChild(i),null!==n.getAttribute("data-sort-default")&&(d=n)}}d&&(this.current=d,this.sortTable(d))}}export default class r{constructor(t){t.addEventListener("afterSort",(t=>{const e=t.target
e.tHead.querySelectorAll(".dropdown-toggle[data-sorting-toggle]").forEach((t=>{t.querySelector(":scope > div").classList.remove("text-primary")
const e=t.querySelector("typo3-backend-icon")
e.identifier="empty-empty",e.classList.remove("text-primary")}))
e.tHead.querySelectorAll(".dropdown-toggle[data-sorting-toggle] + .dropdown-menu typo3-backend-icon").forEach((t=>{t.identifier="empty-empty"}))
const o=e.tHead.querySelector("th[aria-sort]"),n=o.querySelector(".dropdown-toggle[data-sorting-toggle]")
n.querySelector(":scope > div").classList.add("text-primary")
const r=n.querySelector("typo3-backend-icon"),d=o.querySelector(".dropdown-menu")
"ascending"===o.ariaSort?r.identifier="actions-sort-amount-up":r.identifier="actions-sort-amount-down"
d.querySelectorAll(".dropdown-item").forEach((t=>{const e=t.dataset.sortDirection,n=t.querySelector("typo3-backend-icon")
e===o.ariaSort?n.identifier="actions-dot":n.identifier="empty-empty"}))})),new n(t)}}