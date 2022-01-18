import{EditorView,ViewPlugin,BlockType,PluginField,Direction}from"@codemirror/view";import{RangeSet,RangeValue}from"@codemirror/rangeset";import{MapMode,Facet,combineConfig}from"@codemirror/state";class GutterMarker extends RangeValue{compare(e){return this==e||this.constructor==e.constructor&&this.eq(e)}eq(e){return!1}destroy(e){}}GutterMarker.prototype.elementClass="",GutterMarker.prototype.toDOM=void 0,GutterMarker.prototype.mapMode=MapMode.TrackBefore,GutterMarker.prototype.startSide=GutterMarker.prototype.endSide=-1,GutterMarker.prototype.point=!0;const gutterLineClass=Facet.define(),defaults={class:"",renderEmptyElements:!1,elementStyle:"",markers:()=>RangeSet.empty,lineMarker:()=>null,lineMarkerChange:null,initialSpacer:null,updateSpacer:null,domEventHandlers:{}},activeGutters=Facet.define();function gutter(e){return[gutters(),activeGutters.of(Object.assign(Object.assign({},defaults),e))]}const baseTheme=EditorView.baseTheme({".cm-gutters":{display:"flex",height:"100%",boxSizing:"border-box",left:0,zIndex:200},"&light .cm-gutters":{backgroundColor:"#f5f5f5",color:"#999",borderRight:"1px solid #ddd"},"&dark .cm-gutters":{backgroundColor:"#333338",color:"#ccc"},".cm-gutter":{display:"flex !important",flexDirection:"column",flexShrink:0,boxSizing:"border-box",minHeight:"100%",overflow:"hidden"},".cm-gutterElement":{boxSizing:"border-box"},".cm-lineNumbers .cm-gutterElement":{padding:"0 3px 0 5px",minWidth:"20px",textAlign:"right",whiteSpace:"nowrap"},"&light .cm-activeLineGutter":{backgroundColor:"#e2f2ff"},"&dark .cm-activeLineGutter":{backgroundColor:"#222227"}}),unfixGutters=Facet.define({combine:e=>e.some(e=>e)});function gutters(e){let t=[gutterView,baseTheme];return e&&!1===e.fixed&&t.push(unfixGutters.of(!0)),t}const gutterView=ViewPlugin.fromClass(class{constructor(e){this.view=e,this.prevViewport=e.viewport,this.dom=document.createElement("div"),this.dom.className="cm-gutters",this.dom.setAttribute("aria-hidden","true"),this.dom.style.minHeight=this.view.contentHeight+"px",this.gutters=e.state.facet(activeGutters).map(t=>new SingleGutterView(e,t));for(let e of this.gutters)this.dom.appendChild(e.dom);this.fixed=!e.state.facet(unfixGutters),this.fixed&&(this.dom.style.position="sticky"),this.syncGutters(!1),e.scrollDOM.insertBefore(this.dom,e.contentDOM)}update(e){if(this.updateGutters(e)){let t=this.prevViewport,r=e.view.viewport,i=Math.min(t.to,r.to)-Math.max(t.from,r.from);this.syncGutters(i<.8*(r.to-r.from))}e.geometryChanged&&(this.dom.style.minHeight=this.view.contentHeight+"px"),this.view.state.facet(unfixGutters)!=!this.fixed&&(this.fixed=!this.fixed,this.dom.style.position=this.fixed?"sticky":""),this.prevViewport=e.view.viewport}syncGutters(e){let t=this.dom.nextSibling;e&&this.dom.remove();let r=RangeSet.iter(this.view.state.facet(gutterLineClass),this.view.viewport.from),i=[],s=this.gutters.map(e=>new UpdateContext(e,this.view.viewport,-this.view.documentPadding.top));for(let e of this.view.viewportLineBlocks){let t;if(Array.isArray(e.type)){for(let r of e.type)if(r.type==BlockType.Text){t=r;break}}else t=e.type==BlockType.Text?e:void 0;if(t){i.length&&(i=[]),advanceCursor(r,i,e.from);for(let e of s)e.line(this.view,t,i)}}for(let e of s)e.finish();e&&this.view.scrollDOM.insertBefore(this.dom,t)}updateGutters(e){let t=e.startState.facet(activeGutters),r=e.state.facet(activeGutters),i=e.docChanged||e.heightChanged||e.viewportChanged||!RangeSet.eq(e.startState.facet(gutterLineClass),e.state.facet(gutterLineClass),e.view.viewport.from,e.view.viewport.to);if(t==r)for(let t of this.gutters)t.update(e)&&(i=!0);else{i=!0;let s=[];for(let i of r){let r=t.indexOf(i);r<0?s.push(new SingleGutterView(this.view,i)):(this.gutters[r].update(e),s.push(this.gutters[r]))}for(let e of this.gutters)e.dom.remove(),s.indexOf(e)<0&&e.destroy();for(let e of s)this.dom.appendChild(e.dom);this.gutters=s}return i}destroy(){for(let e of this.gutters)e.destroy();this.dom.remove()}},{provide:PluginField.scrollMargins.from(e=>0!=e.gutters.length&&e.fixed?e.view.textDirection==Direction.LTR?{left:e.dom.offsetWidth}:{right:e.dom.offsetWidth}:null)});function asArray(e){return Array.isArray(e)?e:[e]}function advanceCursor(e,t,r){for(;e.value&&e.from<=r;)e.from==r&&t.push(e.value),e.next()}class UpdateContext{constructor(e,t,r){this.gutter=e,this.height=r,this.localMarkers=[],this.i=0,this.cursor=RangeSet.iter(e.markers,t.from)}line(e,t,r){this.localMarkers.length&&(this.localMarkers=[]),advanceCursor(this.cursor,this.localMarkers,t.from);let i=r.length?this.localMarkers.concat(r):this.localMarkers,s=this.gutter.config.lineMarker(e,t,i);s&&i.unshift(s);let n=this.gutter;if(0==i.length&&!n.config.renderEmptyElements)return;let o=t.top-this.height;if(this.i==n.elements.length){let r=new GutterElement(e,t.height,o,i);n.elements.push(r),n.dom.appendChild(r.dom)}else n.elements[this.i].update(e,t.height,o,i);this.height=t.bottom,this.i++}finish(){let e=this.gutter;for(;e.elements.length>this.i;){let t=e.elements.pop();e.dom.removeChild(t.dom),t.destroy()}}}class SingleGutterView{constructor(e,t){this.view=e,this.config=t,this.elements=[],this.spacer=null,this.dom=document.createElement("div"),this.dom.className="cm-gutter"+(this.config.class?" "+this.config.class:"");for(let r in t.domEventHandlers)this.dom.addEventListener(r,i=>{let s=e.lineBlockAtHeight(i.clientY-e.documentTop);t.domEventHandlers[r](e,s,i)&&i.preventDefault()});this.markers=asArray(t.markers(e)),t.initialSpacer&&(this.spacer=new GutterElement(e,0,0,[t.initialSpacer(e)]),this.dom.appendChild(this.spacer.dom),this.spacer.dom.style.cssText+="visibility: hidden; pointer-events: none")}update(e){let t=this.markers;if(this.markers=asArray(this.config.markers(e.view)),this.spacer&&this.config.updateSpacer){let t=this.config.updateSpacer(this.spacer.markers[0],e);t!=this.spacer.markers[0]&&this.spacer.update(e.view,0,0,[t])}let r=e.view.viewport;return!RangeSet.eq(this.markers,t,r.from,r.to)||!!this.config.lineMarkerChange&&this.config.lineMarkerChange(e)}destroy(){for(let e of this.elements)e.destroy()}}class GutterElement{constructor(e,t,r,i){this.height=-1,this.above=0,this.markers=[],this.dom=document.createElement("div"),this.update(e,t,r,i)}update(e,t,r,i){this.height!=t&&(this.dom.style.height=(this.height=t)+"px"),this.above!=r&&(this.dom.style.marginTop=(this.above=r)?r+"px":""),sameMarkers(this.markers,i)||this.setMarkers(e,i)}setMarkers(e,t){let r="cm-gutterElement",i=this.dom.firstChild;for(let s=0,n=0;;){let o=n,a=s<t.length?t[s++]:null,l=!1;if(a){let e=a.elementClass;e&&(r+=" "+e);for(let e=n;e<this.markers.length;e++)if(this.markers[e].compare(a)){o=e,l=!0;break}}else o=this.markers.length;for(;n<o;){let e=this.markers[n++];if(e.toDOM){e.destroy(i);let t=i.nextSibling;i.remove(),i=t}}if(!a)break;a.toDOM&&(l?i=i.nextSibling:this.dom.insertBefore(a.toDOM(e),i)),l&&n++}this.dom.className=r,this.markers=t}destroy(){this.setMarkers(null,[])}}function sameMarkers(e,t){if(e.length!=t.length)return!1;for(let r=0;r<e.length;r++)if(!e[r].compare(t[r]))return!1;return!0}const lineNumberMarkers=Facet.define(),lineNumberConfig=Facet.define({combine:e=>combineConfig(e,{formatNumber:String,domEventHandlers:{}},{domEventHandlers(e,t){let r=Object.assign({},e);for(let e in t){let i=r[e],s=t[e];r[e]=i?(e,t,r)=>i(e,t,r)||s(e,t,r):s}return r}})});class NumberMarker extends GutterMarker{constructor(e){super(),this.number=e}eq(e){return this.number==e.number}toDOM(){return document.createTextNode(this.number)}}function formatNumber(e,t){return e.state.facet(lineNumberConfig).formatNumber(t,e.state)}const lineNumberGutter=activeGutters.compute([lineNumberConfig],e=>({class:"cm-lineNumbers",renderEmptyElements:!1,markers:e=>e.state.facet(lineNumberMarkers),lineMarker:(e,t,r)=>r.some(e=>e.toDOM)?null:new NumberMarker(formatNumber(e,e.state.doc.lineAt(t.from).number)),lineMarkerChange:e=>e.startState.facet(lineNumberConfig)!=e.state.facet(lineNumberConfig),initialSpacer:e=>new NumberMarker(formatNumber(e,maxLineNumber(e.state.doc.lines))),updateSpacer(e,t){let r=formatNumber(t.view,maxLineNumber(t.view.state.doc.lines));return r==e.number?e:new NumberMarker(r)},domEventHandlers:e.facet(lineNumberConfig).domEventHandlers}));function lineNumbers(e={}){return[lineNumberConfig.of(e),gutters(),lineNumberGutter]}function maxLineNumber(e){let t=9;for(;t<e;)t=10*t+9;return t}const activeLineGutterMarker=new class extends GutterMarker{constructor(){super(...arguments),this.elementClass="cm-activeLineGutter"}},activeLineGutterHighlighter=gutterLineClass.compute(["selection"],e=>{let t=[],r=-1;for(let i of e.selection.ranges)if(i.empty){let s=e.doc.lineAt(i.head).from;s>r&&(r=s,t.push(activeLineGutterMarker.range(s)))}return RangeSet.of(t)});function highlightActiveLineGutter(){return activeLineGutterHighlighter}export{GutterMarker,gutter,gutterLineClass,gutters,highlightActiveLineGutter,lineNumberMarkers,lineNumbers};