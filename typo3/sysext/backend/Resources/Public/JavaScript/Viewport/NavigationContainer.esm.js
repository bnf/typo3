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
import{ScaffoldIdentifierEnum}from"TYPO3/CMS/Backend/Enum/Viewport/ScaffoldIdentifier";import{AbstractContainer}from"TYPO3/CMS/Backend/Viewport/AbstractContainer";import TriggerRequest from"TYPO3/CMS/Backend/Event/TriggerRequest";class NavigationContainer extends AbstractContainer{constructor(t){super(t),this.switcher=null,this.activeComponentId="",this.parent=document.querySelector(ScaffoldIdentifierEnum.scaffold),this.container=document.querySelector(ScaffoldIdentifierEnum.contentNavigation),this.switcher=document.querySelector(ScaffoldIdentifierEnum.contentNavigationSwitcher)}showComponent(t){if(this.show(t),t===this.activeComponentId)return;if(""!==this.activeComponentId){let t=this.container.querySelector("#navigationComponent-"+this.activeComponentId.replace(/[/]/g,"_"));t&&(t.style.display="none")}const e="navigationComponent-"+t.replace(/[/]/g,"_");if(1===this.container.querySelectorAll('[data-component="'+t+'"]').length)return this.show(t),void(this.activeComponentId=t);import(t).then(({default:n})=>{if("string"==typeof n.navigationComponentName){const i=n.navigationComponentName,o=document.createElement(i);o.setAttribute("id",e),o.classList.add("scaffold-content-navigation-component"),o.dataset.component=t,this.container.append(o)}else{this.container.insertAdjacentHTML("beforeend",'<div class="scaffold-content-navigation-component" data-component="'+t+'" id="'+e+'"></div>');Object.values(n)[0].initialize("#"+e)}this.show(t),this.activeComponentId=t})}hide(t){this.parent.classList.remove("scaffold-content-navigation-expanded"),this.parent.classList.remove("scaffold-content-navigation-available"),t&&this.switcher&&(this.switcher.style.display="none")}show(t){if(this.container.querySelectorAll(ScaffoldIdentifierEnum.contentNavigationDataComponent).forEach(t=>t.style.display="none"),void 0!==typeof t){this.parent.classList.add("scaffold-content-navigation-expanded"),this.parent.classList.add("scaffold-content-navigation-available");const e=this.container.querySelector('[data-component="'+t+'"]');e&&(e.style.display=null)}this.switcher&&(this.switcher.style.display=null)}setUrl(t,e){const n=this.consumerScope.invoke(new TriggerRequest("typo3.setUrl",e));return n.then(()=>{this.parent.classList.add("scaffold-content-navigation-expanded")}),n}}export default NavigationContainer;