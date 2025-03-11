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
if(this.table=t,this.thead=!1,this.options=n,t.rows&&t.rows.length>0)if(t.tHead&&t.tHead.rows.length>0){for(let a=0;a<t.tHead.rows.length;a++)if("thead"===t.tHead.rows[a].getAttribute("data-sort-method")){r=t.tHead.rows[a]
break}r||(r=t.tHead.rows[t.tHead.rows.length-1]),this.thead=!0}else r=t.rows[0]
if(!r)return
const s=t=>{t.preventDefault(),t.stopImmediatePropagation()
const e=t.currentTarget.dataset.sortDirection,o=t.currentTarget.closest("th, td")
this.current===o&&this.current.ariaSort===e||(o.ariaSort="ascending"===e?"descending":"ascending",this.current&&this.current!==o&&this.current.removeAttribute("aria-sort"),this.current=o,this.sortTable(o))}
for(a=0;a<r.cells.length;a++){const i=r.cells[a]
if(i.setAttribute("role","columnheader"),"none"!==i.getAttribute("data-sort-method")){const c=document.createElement("button")
c.classList.add("dropdown-toggle","dropdown-toggle-link"),c.dataset.bsToggle="dropdown",c.dataset.sortingToggle="true",c.type="button",c.ariaExpanded="false",c.textContent=i.textContent
const l=new e
l.identifier="empty-empty",l.size=o.small
const p=document.createElement("div")
p.appendChild(l),c.appendChild(p),i.replaceChildren(c)
const m=document.createElement("div")
m.classList.add("dropdown-menu")
const u=top.TYPO3.lang["labels.sorting.asc"]||"Sort ascending",g=document.createElement("button")
g.classList.add("dropdown-item"),g.type="button",g.title=u,g.ariaLabel=u,g.dataset.sortDirection="ascending",g.addEventListener("click",s,!1)
const h=document.createElement("span")
h.classList.add("dropdown-item-columns"),g.appendChild(h)
const y=document.createElement("span")
y.classList.add("dropdown-item-column","dropdown-item-column-icon","text-primary"),h.appendChild(y)
const w=new e
w.identifier="empty-empty",w.size=o.small,y.appendChild(w)
const b=document.createElement("span")
b.classList.add("dropdown-item-column","dropdown-item-column-title"),b.textContent=u,h.appendChild(b),m.appendChild(g)
const f=top.TYPO3.lang["labels.sorting.desc"]||"Sort descending",S=document.createElement("button")
S.classList.add("dropdown-item"),S.type="button",S.title=f,S.ariaLabel=f,S.dataset.sortDirection="descending",S.addEventListener("click",s,!1)
const C=document.createElement("span")
C.classList.add("dropdown-item-columns"),S.appendChild(C)
const E=document.createElement("span")
E.classList.add("dropdown-item-column","dropdown-item-column-icon","text-primary"),C.appendChild(E)
const L=new e
L.identifier="empty-empty",L.size=o.small,E.appendChild(L)
const x=document.createElement("span")
x.classList.add("dropdown-item-column","dropdown-item-column-title"),x.textContent=f,C.appendChild(x),m.appendChild(S),i.appendChild(m),null!==i.getAttribute("data-sort-default")&&(d=i)}}d&&(this.current=d,this.sortTable(d))}}export default class SortableTable{constructor(t){t.addEventListener("afterSort",(t=>{const e=t.target
e.tHead.querySelectorAll(".dropdown-toggle[data-sorting-toggle]").forEach((t=>{t.querySelector(":scope > div").classList.remove("text-primary")
const e=t.querySelector("typo3-backend-icon")
e.identifier="empty-empty",e.classList.remove("text-primary")})),e.tHead.querySelectorAll(".dropdown-toggle[data-sorting-toggle] + .dropdown-menu typo3-backend-icon").forEach((t=>{t.identifier="empty-empty"}))
const o=e.tHead.querySelector("th[aria-sort]"),n=o.querySelector(".dropdown-toggle[data-sorting-toggle]")
n.querySelector(":scope > div").classList.add("text-primary")
const r=n.querySelector("typo3-backend-icon"),d=o.querySelector(".dropdown-menu")
"ascending"===o.ariaSort?r.identifier="actions-sort-amount-up":r.identifier="actions-sort-amount-down",d.querySelectorAll(".dropdown-item").forEach((t=>{const e=t.dataset.sortDirection,n=t.querySelector("typo3-backend-icon")
e===o.ariaSort?n.identifier="actions-dot":n.identifier="empty-empty"}))})),new n(t)}}