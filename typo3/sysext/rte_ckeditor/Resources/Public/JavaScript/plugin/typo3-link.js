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
import*as e from"@ckeditor/ckeditor5-ui"
import*as t from"@ckeditor/ckeditor5-core"
import*as i from"@ckeditor/ckeditor5-engine"
import*as n from"@ckeditor/ckeditor5-typing"
import*as o from"@ckeditor/ckeditor5-widget"
import*as s from"@ckeditor/ckeditor5-utils"
import*as r from"@ckeditor/ckeditor5-link"
import{LinkUtils as l,LinkActionsView as a}from"@ckeditor/ckeditor5-link"
import{default as c}from"@typo3/backend/modal.js"
export const LINK_ALLOWED_ATTRIBUTES=["href","title","class","target","rel"]
export function addLinkPrefix(e){return"link"+(e.charAt(0).toUpperCase()+e.slice(1))}export function removeLinkPrefix(e){return e.startsWith("link")&&e.length>=5?e.charAt(4).toLowerCase()+e.slice(5):e}export class Typo3TextView extends e.View{constructor(e){super(e),this.set("text",void 0)
const t=this.bindTemplate
this.setTemplate({tag:"span",attributes:{class:["ck","ck-linktext"],title:t.to("text")},children:[{text:t.to("text")}]})}}export class Typo3LinkCommand extends t.Command{constructor(){super(...arguments),this.attrs={}}refresh(){const e=this.editor.model,t=e.document.selection,i=t.getSelectedElement()||s.first(t.getSelectedBlocks()),n=l.isLinkableElement(i,e.schema)?i:t
n===i?(this.value=i.getAttribute("linkHref"),this.isEnabled=e.schema.checkAttribute(i,"linkHref")):(this.value=t.getAttribute("linkHref"),this.isEnabled=e.schema.checkAttributeInSelection(t,"linkHref"))
const o=this.editor.plugins.get("GeneralHtmlSupport").getGhsAttributeNameForElement("a"),r={}
for(const t of this.getLinkAttributesAllowedOnText(e.schema))if("linkHref"!==t)if(t===o){const e=n.getAttribute(t)
e?.classes&&0!==e.classes.length&&(r.class=e.classes.join(" "))}else{const e=n.getAttribute(t)
void 0!==e&&(r[removeLinkPrefix(t)]=e)}this.attrs=r}execute(e,t={}){const i=this.editor.model,o=i.document.selection
i.change((r=>{if(o.isCollapsed){const l=o.getFirstPosition()
if(o.hasAttribute("linkHref")){const s=n.findAttributeRange(l,"linkHref",o.getAttribute("linkHref"),i)
r.setAttribute("linkHref",e,s)
for(const[e,i]of Object.entries(this.composeLinkAttributes(t)))null!==i?r.setAttribute(e,i,s):r.removeAttribute(e,s)
r.setSelection(r.createPositionAfter(s.end.nodeBefore))}else if(""!==e){const n=s.toMap(o.getAttributes())
n.set("linkHref",e)
for(const[e,i]of Object.entries(this.composeLinkAttributes(t)))null!==i&&n.set(e,i)
const{end:a}=i.insertContent(r.createText(e,n),l)
r.setSelection(a)}this.removeLinkAttributesFromSelection(r,this.getLinkAttributesAllowedOnText(i.schema))}else{const n=i.schema.getValidRanges(o.getRanges(),"linkHref"),s=[]
for(const e of o.getSelectedBlocks())i.schema.checkAttribute(e,"linkHref")&&s.push(r.createRangeOn(e))
const l=s.slice()
for(const e of n)this.isRangeToUpdate(e,s)&&l.push(e)
for(const i of l){r.setAttribute("linkHref",e,i)
for(const[e,n]of Object.entries(this.composeLinkAttributes(t)))null!==n?r.setAttribute(e,n,i):r.removeAttribute(e,i)}}}))}getLinkAttributesAllowedOnText(e){return e.getDefinition("$text").allowAttributes.filter((e=>e.startsWith("link")||"htmlA"===e))}removeLinkAttributesFromSelection(e,t){e.removeSelectionAttribute("linkHref")
for(const i of t)e.removeSelectionAttribute(i)}composeLinkAttributes(e){const t={}
for(const[i,n]of Object.entries(e.attrs))if("linkClass"===i){const e=this.editor.plugins.get("GeneralHtmlSupport").getGhsAttributeNameForElement("a"),i=this.editor.model.document.selection
let o
o=i.hasAttribute(e)?{...i.getAttribute(e)}:{}
const s=n.replace(/\s+/g," ").trim()
""!==s?o.classes=s.split(" "):"classes"in o&&delete o.classes,t[e]=0!==Object.keys(o).length?o:null}else t[i]=""!==n?n:null
return t}isRangeToUpdate(e,t){for(const i of t)if(i.containsRange(e))return!1
return!0}}export class Typo3UnlinkCommand extends t.Command{refresh(){const e=this.editor.model,t=e.document.selection,i=t.getSelectedElement()
l.isLinkableElement(i,e.schema)?this.isEnabled=e.schema.checkAttribute(i,"linkHref"):this.isEnabled=e.schema.checkAttributeInSelection(t,"linkHref")}execute(){const e=this.editor.model,t=e.document.selection
e.change((i=>{const o=t.isCollapsed?[n.findAttributeRange(t.getFirstPosition(),"linkHref",t.getAttribute("linkHref"),e)]:e.schema.getValidRanges(t.getRanges(),"linkHref")
for(const e of o)i.removeAttribute("linkHref",e),i.removeAttribute("linkTarget",e),i.removeAttribute("linkTitle",e),i.removeAttribute("linkRel",e)}))}}export class Typo3LinkEditing extends t.Plugin{static{this.pluginName="Typo3LinkEditing"}init(){const e=this.editor
window.editor=e,e.model.schema.extend("$text",{allowAttributes:["linkTitle","linkTarget","linkRel","linkDataRteError"]})
e.plugins.get("DataFilter").loadAllowedConfig([{name:"a",classes:!0}]),e.conversion.for("downcast").attributeToElement({model:"linkDataRteError",view:(e,{writer:t})=>{const i=t.createAttributeElement("a",{"data-rte-error":e},{priority:5})
return t.setCustomProperty("linkDataRteError",!0,i),i}}),e.conversion.for("upcast").elementToAttribute({view:{name:"a",attributes:{"data-rte-error":!0}},model:{key:"linkDataRteError",value:e=>e.getAttribute("data-rte-error")}}),e.conversion.for("downcast").attributeToElement({model:"linkTitle",view:(e,{writer:t})=>{const i=t.createAttributeElement("a",{title:e},{priority:5})
return t.setCustomProperty("linkTitle",!0,i),i}}),e.conversion.for("upcast").elementToAttribute({view:{name:"a",attributes:{title:!0}},model:{key:"linkTitle",value:e=>e.getAttribute("title")}}),e.conversion.for("downcast").attributeToElement({model:"linkTarget",view:(e,{writer:t})=>{const i=t.createAttributeElement("a",{target:e},{priority:5})
return t.setCustomProperty("linkTarget",!0,i),i}}),e.conversion.for("upcast").elementToAttribute({view:{name:"a",attributes:{target:!0}},model:{key:"linkTarget",value:e=>e.getAttribute("target")}}),e.conversion.for("downcast").attributeToElement({model:"linkRel",view:(e,{writer:t})=>{const i=t.createAttributeElement("a",{rel:e},{priority:5})
return t.setCustomProperty("linkRel",!0,i),i}}),e.conversion.for("upcast").elementToAttribute({view:{name:"a",attributes:{rel:!0}},model:{key:"linkRel",value:e=>e.getAttribute("rel")}}),e.commands.add("link",new Typo3LinkCommand(e)),e.commands.add("unlink",new Typo3UnlinkCommand(e))}}export class Typo3LinkActionsView extends a{_createPreviewButton(){const e=new Typo3TextView(this.locale),t=this.t
return e.bind("text").to(this,"href",(e=>e||t("This link has no URL"))),e}}const d="link-ui"
export class Typo3LinkUI extends t.Plugin{static{this.pluginName="Typo3LinkUI"}static{this.requires=[e.ContextualBalloon]}init(){const t=this.editor
t.editing.view.addObserver(i.ClickObserver),this.actionsView=this.createActionsView(),this.balloon=t.plugins.get(e.ContextualBalloon),this.createToolbarLinkButtons(),this.enableUserBalloonInteractions(),t.conversion.for("editingDowncast").markerToHighlight({model:d,view:{classes:["ck-fake-link-selection"]}}),t.conversion.for("editingDowncast").markerToElement({model:d,view:{name:"span",classes:["ck-fake-link-selection","ck-fake-link-selection_collapsed"]}})}createActionsView(){const e=this.editor,t=new Typo3LinkActionsView(e.locale),i=e.commands.get("link"),n=e.commands.get("unlink")
return t.bind("href").to(i,"value"),t.editButtonView.bind("isEnabled").to(i),t.unlinkButtonView.bind("isEnabled").to(n),this.listenTo(t,"edit",(()=>{this.openLinkBrowser(e)})),this.listenTo(t,"unlink",(()=>{e.execute("unlink"),this.hideUI()})),t.keystrokes.set("Esc",((e,t)=>{this.hideUI(),t()})),t}createToolbarLinkButtons(){const t=this.editor,i=t.commands.get("link"),n=t.t
t.keystrokes.set(l.LINK_KEYSTROKE,((e,t)=>{t(),i.isEnabled&&this.showUI()})),t.ui.componentFactory.add("link",(t=>{const o=new e.ButtonView(t)
return o.isEnabled=!0,o.label=n("Link"),o.icon='<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="m11.077 15 .991-1.416a.75.75 0 1 1 1.229.86l-1.148 1.64a.748.748 0 0 1-.217.206 5.251 5.251 0 0 1-8.503-5.955.741.741 0 0 1 .12-.274l1.147-1.639a.75.75 0 1 1 1.228.86L4.933 10.7l.006.003a3.75 3.75 0 0 0 6.132 4.294l.006.004zm5.494-5.335a.748.748 0 0 1-.12.274l-1.147 1.639a.75.75 0 1 1-1.228-.86l.86-1.23a3.75 3.75 0 0 0-6.144-4.301l-.86 1.229a.75.75 0 0 1-1.229-.86l1.148-1.64a.748.748 0 0 1 .217-.206 5.251 5.251 0 0 1 8.503 5.955zm-4.563-2.532a.75.75 0 0 1 .184 1.045l-3.155 4.505a.75.75 0 1 1-1.229-.86l3.155-4.506a.75.75 0 0 1 1.045-.184z"/></svg>',o.keystroke=l.LINK_KEYSTROKE,o.tooltip=!0,o.isToggleable=!0,o.bind("isEnabled").to(i,"isEnabled"),o.bind("isOn").to(i,"value",(e=>!!e)),this.listenTo(o,"execute",(()=>this.showUI())),o}))}enableUserBalloonInteractions(){const e=this.editor.editing.view.document
this.listenTo(e,"click",(()=>{this.getSelectedLinkElement()&&this.showUI()})),this.editor.keystrokes.set("Esc",((e,t)=>{this.isUIVisible()&&(this.hideUI(),t())}))}addActionsView(){this.areActionsInPanel()||this.balloon.add({view:this.actionsView,position:this.getBalloonPositionData()})}hideUI(){if(!this.isUIInPanel())return
const e=this.editor
this.stopListening(e.ui,"update"),this.stopListening(this.balloon,"change:visibleView"),e.editing.view.focus(),this.balloon.remove(this.actionsView),this.hideFakeVisualSelection()}showUI(){this.getSelectedLinkElement()?(this.addActionsView(),this.balloon.showStack("main")):(this.showFakeVisualSelection(),this.openLinkBrowser(this.editor)),this.startUpdatingUI()}startUpdatingUI(){const e=this.editor,t=e.editing.view.document
let i=this.getSelectedLinkElement(),n=s()
const o=()=>{const e=this.getSelectedLinkElement(),t=s()
i&&!e||!i&&t!==n?this.hideUI():this.isUIVisible()&&this.balloon.updatePosition(this.getBalloonPositionData()),i=e,n=t}
function s(){return t.selection.focus.getAncestors().reverse().find((e=>e.is("element")))}this.listenTo(e.ui,"update",o),this.listenTo(this.balloon,"change:visibleView",o)}areActionsInPanel(){return this.balloon.hasView(this.actionsView)}areActionsVisible(){return this.balloon.visibleView===this.actionsView}isUIInPanel(){return this.areActionsInPanel()}isUIVisible(){return this.areActionsVisible()}getBalloonPositionData(){const e=this.editor.editing.view,t=this.editor.model,i=e.document
let n=null
if(t.markers.has(d)){const t=Array.from(this.editor.editing.mapper.markerNameToElements(d)),i=e.createRange(e.createPositionBefore(t[0]),e.createPositionAfter(t[t.length-1]))
n=e.domConverter.viewRangeToDom(i)}else n=()=>{const t=this.getSelectedLinkElement()
return t?e.domConverter.mapViewToDom(t):e.domConverter.viewRangeToDom(i.selection.getFirstRange())}
return{target:n}}getSelectedLinkElement(){const e=this.editor.editing.view,t=e.document.selection,i=t.getSelectedElement()
if(t.isCollapsed||i&&o.isWidget(i))return this.findLinkElementAncestor(t.getFirstPosition())
{const i=t.getFirstRange().getTrimmed(),n=this.findLinkElementAncestor(i.start),o=this.findLinkElementAncestor(i.end)
return n&&n==o&&e.createRangeIn(n).getTrimmed().isEqual(i)?n:null}}showFakeVisualSelection(){const e=this.editor.model
e.change((t=>{const i=e.document.selection.getFirstRange()
if(e.markers.has(d))t.updateMarker(d,{range:i})
else if(i.start.isAtEnd){const n=i.start.getLastMatchingPosition((({item:t})=>!e.schema.isContent(t)),{startPosition:null,boundaries:i})
t.addMarker(d,{usingOperation:!1,affectsData:!1,range:t.createRange(n,i.end)})}else t.addMarker(d,{usingOperation:!1,affectsData:!1,range:i})}))}hideFakeVisualSelection(){const e=this.editor.model
e.markers.has(d)&&e.change((e=>{e.removeMarker(d)}))}findLinkElementAncestor(e){return e.getAncestors().find((e=>l.isLinkElement(e)))}openLinkBrowser(e){const t=e.commands.get("link")
let i=""
if(t.value){i+="&P[curUrl][url]="+encodeURIComponent(t.value)
for(const[e,n]of Object.entries(t.attrs))i+="&P[curUrl]["+encodeURIComponent(e)+"]="+encodeURIComponent(n)}this.openElementBrowser(e,"Link",this.makeUrlFromModulePath(e,e.config.get("typo3link")?.routeUrl,i))}makeUrlFromModulePath(e,t,i){return t+(-1===t.indexOf("?")?"?":"&")+"&contentsLanguage=en&editorId=123"+(i||"")}openElementBrowser(e,t,i){c.advanced({type:c.types.iframe,title:t,content:i,size:c.sizes.large,callback:t=>{t.userData.editor=e,t.userData.selectionStartPosition=e.model.document.selection.getFirstPosition(),t.userData.selectionEndPosition=e.model.document.selection.getLastPosition(),t.querySelector(".t3js-modal-body")?.setAttribute("id","123")}})}}export class Typo3Link extends t.Plugin{static{this.pluginName="Typo3Link"}static{this.requires=["GeneralHtmlSupport",r.LinkEditing,r.AutoLink,Typo3LinkEditing,Typo3LinkUI]}static{this.overrides=[r.Link]}}export default Typo3Link
