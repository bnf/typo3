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
import{ScaffoldIdentifierEnum as t}from"@typo3/backend/enum/viewport/scaffold-identifier.js"
import{AbstractContainer as e}from"@typo3/backend/viewport/abstract-container.js"
import n from"@typo3/backend/event/trigger-request.js"
import{selector as o}from"@typo3/core/literals.js"
export default class extends e{constructor(t){super(t),this.activeComponentId=""}get parent(){return document.querySelector(t.scaffold)}get container(){return document.querySelector(t.contentNavigation)}showComponent(t){const e=this.container
if(this.show(t),t===this.activeComponentId)return
if(""!==this.activeComponentId){const n=e.querySelector("#navigationComponent-"+this.activeComponentId.replace(/[/@]/g,"_"))
n&&(n.style.display="none")}const a="navigationComponent-"+t.replace(/[/@]/g,"_")
if(1===e.querySelectorAll(o`[data-component="${t}"]`).length)return this.show(t),void(this.activeComponentId=t)
import(t+".js").then((n=>{if("string"==typeof n.navigationComponentName){const o=n.navigationComponentName,i=document.createElement(o)
i.setAttribute("id",a),i.classList.add("scaffold-content-navigation-component"),i.dataset.component=t,e.append(i)}else{e.insertAdjacentHTML("beforeend",'<div class="scaffold-content-navigation-component" data-component="'+t+'" id="'+a+'"></div>'),Object.values(n)[0].initialize("#"+a)}this.show(t),this.activeComponentId=t}))}hide(){const t=this.parent
t.classList.remove("scaffold-content-navigation-expanded"),t.classList.remove("scaffold-content-navigation-available")}show(e){const n=this.parent,o=this.container
o.querySelectorAll(t.contentNavigationDataComponent).forEach((t=>t.style.display="none")),n.classList.add("scaffold-content-navigation-expanded"),n.classList.add("scaffold-content-navigation-available")
const a=o.querySelector('[data-component="'+e+'"]')
a&&(a.style.display=null)}setUrl(t,e){const o=this.consumerScope.invoke(new n("typo3.setUrl",e))
return o.then((()=>{this.parent.classList.add("scaffold-content-navigation-expanded")})),o}}