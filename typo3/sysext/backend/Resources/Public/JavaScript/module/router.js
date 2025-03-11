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
var t=function(t,e,i,o){var n,l=arguments.length,s=l<3?e:null===o?o=Object.getOwnPropertyDescriptor(e,i):o
if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(t,e,i,o)
else for(var r=t.length-1;r>=0;r--)(n=t[r])&&(s=(l<3?n(s):l>3?n(e,i,s):n(e,i))||s)
return l>3&&s&&Object.defineProperty(e,i,s),s}
import{html as e,css as i,LitElement as o}from"lit"
import{customElement as n,property as l,query as s}from"lit/decorators.js"
import{ModuleUtility as r}from"@typo3/backend/module.js"
const a="@typo3/backend/module/iframe",d=()=>!0
let m=class extends o{static{this.styles=i`:host{display:flex;flex:1 0 auto;flex-direction:row;min-height:100%;width:100%}::slotted(*){min-height:100%;width:100%}`}constructor(){super(),this.module="",this.endpoint="",this.sitenameFirst=!1,this.titleComponents=null,this.addEventListener("typo3-module-load",(({target,detail})=>{const t=target.getAttribute("slot")
this.pushState({slotName:t,detail})})),this.addEventListener("typo3-module-loaded",(({detail})=>{this.updateBrowserState(detail)})),this.addEventListener("typo3-iframe-load",(({detail})=>{let t={slotName:a,detail}
if(t.detail.url.includes(this.stateTrackerUrl+"?state=")){const e=t.detail.url.split("?state=")
t=JSON.parse(decodeURIComponent(e[1]||"{}"))}this.slotElement.getAttribute("name")!==t.slotName&&this.slotElement.setAttribute("name",t.slotName),this.markActive(t.slotName,this.slotElement.getAttribute("name")===a?null:t.detail.url,!1),this.updateBrowserState(t.detail),this.parentElement.dispatchEvent(new CustomEvent("typo3-module-load",{bubbles:!0,composed:!0,detail:t.detail}))})),this.addEventListener("typo3-iframe-loaded",(({detail})=>{this.updateBrowserState(detail),this.parentElement.dispatchEvent(new CustomEvent("typo3-module-loaded",{bubbles:!0,composed:!0,detail}))}))}static get observedAttributes(){return[...super.observedAttributes,"sitename-first"]}connectedCallback(){super.connectedCallback(),this.sitenameFirst=this.hasAttribute("sitename-first")}attributeChangedCallback(t,e,i){super.attributeChangedCallback(t,e,i),"sitename-first"===t&&(this.sitenameFirst=null!==i,this.updateBrowserTitle())}render(){const t=r.getFromName(this.module).component||a
return e`<slot name="${t}"></slot>`}updated(){const t=r.getFromName(this.module).component||a
this.markActive(t,this.endpoint)}async markActive(t,e,forceEndpointReset=!0){const i=await this.getModuleElement(t)
e&&(forceEndpointReset||i.getAttribute("endpoint")!==e)&&i.setAttribute("endpoint",e),i.hasAttribute("active")||i.setAttribute("active","")
for(let o=i.previousElementSibling;null!==o;o=o.previousElementSibling)o.removeAttribute("active")
for(let n=i.nextElementSibling;null!==n;n=n.nextElementSibling)n.removeAttribute("active")}async getModuleElement(t){let e=this.querySelector(`*[slot="${t}"]`)
if(null!==e)return e
try{const i=await import(t+".js")
if(null!==(e=this.querySelector(`*[slot="${t}"]`)))return e
if(!("componentName"in i))throw new Error(`module ${t} is missing the "componentName" export`)
e=document.createElement(i.componentName)}catch(e){throw console.error({msg:`Error importing ${t} as backend module`,err:e}),e}return e.setAttribute("slot",t),this.appendChild(e),e}async pushState(t){const e=this.stateTrackerUrl+"?state="+encodeURIComponent(JSON.stringify(t));(await this.getModuleElement(a)).setAttribute("endpoint",e)}updateBrowserTitle(){let{titleComponents}=this
null!==titleComponents&&(this.sitenameFirst&&(titleComponents=titleComponents.toReversed()),document.title=titleComponents.join(" · "))}updateBrowserState(t){const e=new URL(t.url||"",window.location.origin),i=new URLSearchParams(e.search),o="title"in t?t.title:""
if(null!==o){const n=[this.sitename]
""!==o&&n.unshift(o),this.titleComponents=n,this.updateBrowserTitle()}if(!i.has("token")){if(!i.has("install[controller]"))return
{const l=i.get("install[controller]")
i.delete("install[controller]"),i.delete("install[context]"),i.delete("install[colorScheme]"),i.delete("install[theme]"),e.pathname=e.pathname.replace(this.installToolPath,this.entryPoint+"module/tools/"+l)}}i.delete("token"),e.search=i.toString()
const s=e.toString()
window.history.replaceState(t,"",s)}}
t([l({type:String,hasChanged:d})],m.prototype,"module",void 0),t([l({type:String,hasChanged:d})],m.prototype,"endpoint",void 0),t([l({type:String,attribute:"state-tracker"})],m.prototype,"stateTrackerUrl",void 0),t([l({type:String,attribute:"sitename"})],m.prototype,"sitename",void 0),t([l({type:String,attribute:"entry-point"})],m.prototype,"entryPoint",void 0),t([l({type:String,attribute:"install-tool-path"})],m.prototype,"installToolPath",void 0),t([s("slot",!0)],m.prototype,"slotElement",void 0),m=t([n("typo3-backend-module-router")],m)
export{m as ModuleRouter}
