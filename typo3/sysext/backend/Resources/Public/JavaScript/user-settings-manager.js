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
import{BroadcastMessage as e}from"@typo3/backend/broadcast-message.js"
import t from"@typo3/backend/broadcast-service.js"
var a
!function(e){e.colorSchemeSwitch="typo3-backend-color-scheme-switch"}(a||(a={}))
export default new class{constructor(){document.addEventListener("typo3:color-scheme:update",(e=>this.onColorSchemeUpdate(e.detail))),document.addEventListener("typo3:theme:update",(e=>this.onThemeUpdate(e.detail))),document.addEventListener("typo3:title-format:update",(e=>this.onTitleFormatUpdate(e.detail))),document.addEventListener("typo3:backend-language:update",(e=>this.onBackendLanguageFormatUpdate(e.detail))),document.addEventListener("typo3:color-scheme:broadcast",(e=>this.activateColorScheme(e.detail.payload.colorScheme))),document.addEventListener("typo3:theme:broadcast",(e=>this.activateTheme(e.detail.payload.theme))),document.addEventListener("typo3:title-format:broadcast",(e=>this.activateTitleFormat(e.detail.payload.format))),document.addEventListener("typo3:backend-language:broadcast",(e=>this.updateBackendLanguage(e.detail.payload.language,e.detail.payload.direction)))}onColorSchemeUpdate(a){const{colorScheme}=a
this.activateColorScheme(colorScheme),t.post(new e("color-scheme","broadcast",{colorScheme}))}onThemeUpdate(a){const{theme}=a
this.activateTheme(theme),t.post(new e("theme","broadcast",{theme}))}onTitleFormatUpdate(a){const{format}=a
this.activateTitleFormat(format),t.post(new e("title-format","broadcast",{format}))}onBackendLanguageFormatUpdate(a){const{language,direction}=a
this.updateBackendLanguage(language,direction),t.post(new e("language-update","broadcast",{language,direction}))}activateColorScheme(e){const t=document.querySelector(a.colorSchemeSwitch)
t&&(t.activeColorScheme=e),this.setStyleChangingDocumentAttribute("data-color-scheme",e)}activateTheme(e){this.setStyleChangingDocumentAttribute("data-theme",e)}activateTitleFormat(e){"sitenameFirst"===e?document.querySelector("typo3-backend-module-router")?.setAttribute("sitename-first",""):document.querySelector("typo3-backend-module-router")?.removeAttribute("sitename-first")}updateBackendLanguage(e,t){const a=document.documentElement,o=window.frames.list_frame?.document.documentElement
a.setAttribute("lang",e),o?.setAttribute("lang",e),null!==t?(a.setAttribute("dir",t),o?.setAttribute("dir",t)):(a.removeAttribute("dir"),o?.removeAttribute("dir"))}async setStyleChangingDocumentAttribute(e,t){const a=document.documentElement,o=window.frames.list_frame?.document.documentElement,i=()=>{a.classList.add("t3js-disable-transitions"),o?.classList.add("t3js-disable-transitions"),a.setAttribute(e,t),o?.setAttribute(e,t)},n=()=>{a.classList.remove("t3js-disable-transitions"),o?.classList.remove("t3js-disable-transitions")}
if(window.matchMedia("(prefers-reduced-motion: reduce)").matches||!("startViewTransition"in document)||"function"!=typeof document.startViewTransition)return i(),await new Promise((e=>requestAnimationFrame(e))),o&&await new Promise((e=>window.frames.list_frame.requestAnimationFrame(e))),void n()
await document.startViewTransition(i).finished,n()}}
