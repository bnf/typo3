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
import{selector as e}from"@typo3/core/literals.js";class s extends HTMLElement{constructor(){super(...arguments),this.element=null,this.passwordPolicyInfo=null,this.passwordPolicySet=!1}connectedCallback(){const s=this.getAttribute("recordFieldId");null!==s&&(this.element=this.querySelector(e`#${s}`),this.element&&(this.passwordPolicyInfo=this.querySelector(e`#password-policy-info-${this.element.id}`),this.passwordPolicySet=""!==(this.getAttribute("passwordPolicy")||""),this.registerEventHandler()))}registerEventHandler(){this.passwordPolicySet&&null!==this.passwordPolicyInfo&&(this.element.addEventListener("focusin",(()=>{this.passwordPolicyInfo.classList.remove("hidden")})),this.element.addEventListener("focusout",(()=>{this.passwordPolicyInfo.classList.add("hidden")})))}}window.customElements.define("typo3-formengine-element-password",s);