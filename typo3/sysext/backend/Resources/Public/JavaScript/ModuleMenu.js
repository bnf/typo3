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
define(["require","./Enum/Viewport/ScaffoldIdentifier","jquery","./Storage/Persistent","./Viewport","./Event/ClientRequest","./Event/TriggerRequest","TYPO3/CMS/Core/Ajax/AjaxRequest","TYPO3/CMS/Core/Event/RegularEvent"],(function(e,t,n,o,a,i,d,l,r){"use strict";class s{constructor(){this.loadedModule=null,this.loadedNavigationComponentId="",n(()=>this.initialize())}static getCollapsedMainMenuItems(){return o.isset("modulemenu")?JSON.parse(o.get("modulemenu")):{}}static addCollapsedMainMenuItem(e){const t=s.getCollapsedMainMenuItems();t[e]=!0,o.set("modulemenu",JSON.stringify(t))}static removeCollapseMainMenuItem(e){const t=this.getCollapsedMainMenuItems();delete t[e],o.set("modulemenu",JSON.stringify(t))}static includeId(e,t){if(!e.navigationComponentId&&!e.navigationFrameScript)return t;let n="";return n="TYPO3/CMS/Backend/PageTree/PageTreeElement"===e.navigationComponentId?"web":e.name.split("_")[0],top.fsMod.recentIds[n]&&(t="id="+top.fsMod.recentIds[n]+"&"+t),t}static toggleMenu(e){a.NavigationContainer.cleanup();const i=n(t.ScaffoldIdentifierEnum.scaffold);void 0===e&&(e=i.hasClass("scaffold-modulemenu-expanded")),i.toggleClass("scaffold-modulemenu-expanded",!e),e||n(".scaffold").removeClass("scaffold-search-expanded").removeClass("scaffold-toolbar-expanded"),o.set("BackendComponents.States.typo3-module-menu",{collapsed:e}),a.doLayout()}static getRecordFromName(e){const t=n("#"+e);return{name:e,navigationComponentId:t.data("navigationcomponentid"),navigationFrameScript:t.data("navigationframescript"),navigationFrameScriptParam:t.data("navigationframescriptparameters"),link:t.data("link")}}static highlightModuleMenuItem(e){n(".modulemenu-action.modulemenu-action-active").removeClass("modulemenu-action-active"),n("#"+e).addClass("modulemenu-action-active")}refreshMenu(){new l(TYPO3.settings.ajaxUrls.modulemenu).get().then(async e=>{const t=await e.resolve();document.getElementById("modulemenu").outerHTML=t.menu,top.currentModuleLoaded&&s.highlightModuleMenuItem(top.currentModuleLoaded),a.doLayout()})}reloadFrames(){a.NavigationContainer.refresh(),a.ContentContainer.refresh()}showModule(e,t,n=null){t=t||"";const o=s.getRecordFromName(e);return this.loadModuleComponents(o,t,new i("typo3.showModule",n))}initialize(){const e=this;let t=n.Deferred();if(t.resolve(),top.startInModule&&top.startInModule[0]&&n("#"+top.startInModule[0]).length>0)t=this.showModule(top.startInModule[0],top.startInModule[1]);else{const e=n(".t3js-modulemenu-action[data-link]:first");e.attr("id")&&(t=this.showModule(e.attr("id")))}t.then(()=>{e.initializeEvents()})}initializeEvents(){new r("click",(e,t)=>{const o=t.closest(".modulemenu-group"),i=o.querySelector(".modulemenu-group-container"),d="true"===t.attributes.getNamedItem("aria-expanded").value;d?s.addCollapsedMainMenuItem(t.id):s.removeCollapseMainMenuItem(t.id),o.classList.toggle(".modulemenu-group-collapsed",d),o.classList.toggle(".modulemenu-group-expanded",!d),t.attributes.getNamedItem("aria-expanded").value=(!d).toString(),n(i).stop().slideToggle({complete:function(){a.doLayout()}})}).delegateTo(document,".t3js-modulemenu .t3js-modulemenu-collapsible"),new r("click",(e,t)=>{void 0!==t.dataset.link&&(e.preventDefault(),this.showModule(t.id,"",e))}).delegateTo(document,".t3js-modulemenu-action"),new r("click",e=>{e.preventDefault(),s.toggleMenu()}).bindTo(document.querySelector(".t3js-topbar-button-modulemenu")),new r("click",e=>{e.preventDefault(),s.toggleMenu(!0)}).bindTo(document.querySelector(".t3js-scaffold-content-overlay")),new r("click",e=>{e.preventDefault(),a.NavigationContainer.toggle()}).bindTo(document.querySelector(".t3js-topbar-button-navigationcomponent"))}loadModuleComponents(e,t,o){const i=e.name,l=a.ContentContainer.beforeSetUrl(o);return l.then(n.proxy(()=>{e.navigationComponentId?this.loadNavigationComponent(e.navigationComponentId):e.navigationFrameScript?(a.NavigationContainer.show("typo3-navigationIframe"),this.openInNavFrame(e.navigationFrameScript,e.navigationFrameScriptParam,new d("typo3.loadModuleComponents",o))):a.NavigationContainer.hide(),s.highlightModuleMenuItem(i),this.loadedModule=i,t=s.includeId(e,t),this.openInContentFrame(e.link,t,new d("typo3.loadModuleComponents",o)),top.currentSubScript=e.link,top.currentModuleLoaded=i,a.doLayout()},this)),l}loadNavigationComponent(t){const o=this;if(a.NavigationContainer.show(t),t===this.loadedNavigationComponentId)return;const i=t.replace(/[/]/g,"_");""!==this.loadedNavigationComponentId&&n("#navigationComponent-"+this.loadedNavigationComponentId.replace(/[/]/g,"_")).hide(),n('.t3js-scaffold-content-navigation [data-component="'+t+'"]').length<1&&n(".t3js-scaffold-content-navigation").append(n("<div />",{class:"scaffold-content-navigation-component","data-component":t,id:"navigationComponent-"+i})),new Promise((function(n,o){e([t],(function(e){n("object"!=typeof e||"default"in e?{default:e}:Object.defineProperty(e,"default",{value:e,enumerable:!1}))}),o)})).then(({default:e})=>{e.initialize("#navigationComponent-"+i),a.NavigationContainer.show(t),o.loadedNavigationComponentId=t})}openInNavFrame(e,t,n){const o=e+(t?(e.includes("?")?"&":"?")+t:""),i=a.NavigationContainer.getUrl(),l=a.NavigationContainer.setUrl(e,new d("typo3.openInNavFrame",n));return i!==o&&("resolved"===l.state()?a.NavigationContainer.refresh():l.then(a.NavigationContainer.refresh)),l}openInContentFrame(e,t,n){let o;if(top.nextLoadModuleUrl)o=a.ContentContainer.setUrl(top.nextLoadModuleUrl,new d("typo3.openInContentFrame",n)),top.nextLoadModuleUrl="";else{const i=e+(t?(e.includes("?")?"&":"?")+t:"");o=a.ContentContainer.setUrl(i,new d("typo3.openInContentFrame",n))}return o}}top.TYPO3.ModuleMenu||(top.TYPO3.ModuleMenu={App:new s});return top.TYPO3.ModuleMenu}));