import{Decoration,EditorView,ViewPlugin,logException,WidgetType}from"@codemirror/view";import{StateEffect,StateField,Facet}from"@codemirror/state";import{hoverTooltip,showTooltip}from"@codemirror/tooltip";import{showPanel,getPanel}from"@codemirror/panel";import{gutter,GutterMarker}from"@codemirror/gutter";import{RangeSet}from"@codemirror/rangeset";import elt from"crelt";class SelectedDiagnostic{constructor(t,e,i){this.from=t,this.to=e,this.diagnostic=i}}class LintState{constructor(t,e,i){this.diagnostics=t,this.panel=e,this.selected=i}static init(t,e,i){let n=Decoration.set(t.map(t=>t.from==t.to||t.from==t.to-1&&i.doc.lineAt(t.from).to==t.from?Decoration.widget({widget:new DiagnosticWidget(t),diagnostic:t}).range(t.from):Decoration.mark({attributes:{class:"cm-lintRange cm-lintRange-"+t.severity},diagnostic:t}).range(t.from,t.to)),!0);return new LintState(n,e,findDiagnostic(n))}}function findDiagnostic(t,e=null,i=0){let n=null;return t.between(i,1e9,(t,i,{spec:o})=>{if(!e||o.diagnostic==e)return n=new SelectedDiagnostic(t,i,o.diagnostic),!1}),n}function maybeEnableLint(t,e){return t.field(lintState,!1)?e:e.concat(StateEffect.appendConfig.of([lintState,EditorView.decorations.compute([lintState],t=>{let{selected:e,panel:i}=t.field(lintState);return e&&i&&e.from!=e.to?Decoration.set([activeMark.range(e.from,e.to)]):Decoration.none}),hoverTooltip(lintTooltip),baseTheme]))}function setDiagnostics(t,e){return{effects:maybeEnableLint(t,[setDiagnosticsEffect.of(e)])}}const setDiagnosticsEffect=StateEffect.define(),togglePanel=StateEffect.define(),movePanelSelection=StateEffect.define(),lintState=StateField.define({create:()=>new LintState(Decoration.none,null,null),update(t,e){if(e.docChanged){let i=t.diagnostics.map(e.changes),n=null;if(t.selected){let o=e.changes.mapPos(t.selected.from,1);n=findDiagnostic(i,t.selected.diagnostic,o)||findDiagnostic(i,null,o)}t=new LintState(i,t.panel,n)}for(let i of e.effects)i.is(setDiagnosticsEffect)?t=LintState.init(i.value,t.panel,e.state):i.is(togglePanel)?t=new LintState(t.diagnostics,i.value?LintPanel.open:null,t.selected):i.is(movePanelSelection)&&(t=new LintState(t.diagnostics,t.panel,i.value));return t},provide:t=>[showPanel.from(t,t=>t.panel),EditorView.decorations.from(t,t=>t.diagnostics)]});function diagnosticCount(t){let e=t.field(lintState,!1);return e?e.diagnostics.size:0}const activeMark=Decoration.mark({class:"cm-lintRange cm-lintRange-active"});function lintTooltip(t,e,i){let{diagnostics:n}=t.state.field(lintState),o=[],s=2e8,a=0;return n.between(e-(i<0?1:0),e+(i>0?1:0),(t,n,{spec:l})=>{e>=t&&e<=n&&(t==n||(e>t||i>0)&&(e<n||i<0))&&(o.push(l.diagnostic),s=Math.min(t,s),a=Math.max(n,a))}),o.length?{pos:s,end:a,above:t.state.doc.lineAt(s).to<a,create:()=>({dom:diagnosticsTooltip(t,o)})}:null}function diagnosticsTooltip(t,e){return elt("ul",{class:"cm-tooltip-lint"},e.map(e=>renderDiagnostic(t,e,!1)))}const openLintPanel=t=>{let e=t.state.field(lintState,!1);e&&e.panel||t.dispatch({effects:maybeEnableLint(t.state,[togglePanel.of(!0)])});let i=getPanel(t,LintPanel.open);return i&&i.dom.querySelector(".cm-panel-lint ul").focus(),!0},closeLintPanel=t=>{let e=t.state.field(lintState,!1);return!(!e||!e.panel)&&(t.dispatch({effects:togglePanel.of(!1)}),!0)},nextDiagnostic=t=>{let e=t.state.field(lintState,!1);if(!e)return!1;let i=t.state.selection.main,n=e.diagnostics.iter(i.to+1);return!(!n.value&&(n=e.diagnostics.iter(0),!n.value||n.from==i.from&&n.to==i.to))&&(t.dispatch({selection:{anchor:n.from,head:n.to},scrollIntoView:!0}),!0)},lintKeymap=[{key:"Mod-Shift-m",run:openLintPanel},{key:"F8",run:nextDiagnostic}],lintPlugin=ViewPlugin.fromClass(class{constructor(t){this.view=t,this.timeout=-1,this.set=!0;let{delay:e}=t.state.facet(lintSource);this.lintTime=Date.now()+e,this.run=this.run.bind(this),this.timeout=setTimeout(this.run,e)}run(){let t=Date.now();if(t<this.lintTime-10)setTimeout(this.run,this.lintTime-t);else{this.set=!1;let{state:t}=this.view,{sources:e}=t.facet(lintSource);Promise.all(e.map(t=>Promise.resolve(t(this.view)))).then(e=>{var i,n;let o=e.reduce((t,e)=>t.concat(e));this.view.state.doc==t.doc&&(o.length||(null===(n=null===(i=this.view.state.field(lintState,!1))||void 0===i?void 0:i.diagnostics)||void 0===n?void 0:n.size))&&this.view.dispatch(setDiagnostics(this.view.state,o))},t=>{logException(this.view.state,t)})}}update(t){let e=t.state.facet(lintSource);(t.docChanged||e!=t.startState.facet(lintSource))&&(this.lintTime=Date.now()+e.delay,this.set||(this.set=!0,this.timeout=setTimeout(this.run,e.delay)))}force(){this.set&&(this.lintTime=Date.now(),this.run())}destroy(){clearTimeout(this.timeout)}}),lintSource=Facet.define({combine:t=>({sources:t.map(t=>t.source),delay:t.length?Math.max(...t.map(t=>t.delay)):750}),enables:lintPlugin});function linter(t,e={}){var i;return lintSource.of({source:t,delay:null!==(i=e.delay)&&void 0!==i?i:750})}function forceLinting(t){let e=t.plugin(lintPlugin);e&&e.force()}function assignKeys(t){let e=[];if(t)t:for(let{name:i}of t){for(let t=0;t<i.length;t++){let n=i[t];if(/[a-zA-Z]/.test(n)&&!e.some(t=>t.toLowerCase()==n.toLowerCase())){e.push(n);continue t}}e.push("")}return e}function renderDiagnostic(t,e,i){var n;let o=i?assignKeys(e.actions):[];return elt("li",{class:"cm-diagnostic cm-diagnostic-"+e.severity},elt("span",{class:"cm-diagnosticText"},e.message),null===(n=e.actions)||void 0===n?void 0:n.map((i,n)=>{let s=n=>{n.preventDefault();let o=findDiagnostic(t.state.field(lintState).diagnostics,e);o&&i.apply(t,o.from,o.to)},{name:a}=i,l=o[n]?a.indexOf(o[n]):-1,r=l<0?a:[a.slice(0,l),elt("u",a.slice(l,l+1)),a.slice(l+1)];return elt("button",{type:"button",class:"cm-diagnosticAction",onclick:s,onmousedown:s,"aria-label":` Action: ${a}${l<0?"":` (access key "${o[n]})"`}.`},r)}),e.source&&elt("div",{class:"cm-diagnosticSource"},e.source))}class DiagnosticWidget extends WidgetType{constructor(t){super(),this.diagnostic=t}eq(t){return t.diagnostic==this.diagnostic}toDOM(){return elt("span",{class:"cm-lintPoint cm-lintPoint-"+this.diagnostic.severity})}}class PanelItem{constructor(t,e){this.diagnostic=e,this.id="item_"+Math.floor(4294967295*Math.random()).toString(16),this.dom=renderDiagnostic(t,e,!0),this.dom.id=this.id,this.dom.setAttribute("role","option")}}class LintPanel{constructor(t){this.view=t,this.items=[];this.list=elt("ul",{tabIndex:0,role:"listbox","aria-label":this.view.state.phrase("Diagnostics"),onkeydown:e=>{if(27==e.keyCode)closeLintPanel(this.view),this.view.focus();else if(38==e.keyCode||33==e.keyCode)this.moveSelection((this.selectedIndex-1+this.items.length)%this.items.length);else if(40==e.keyCode||34==e.keyCode)this.moveSelection((this.selectedIndex+1)%this.items.length);else if(36==e.keyCode)this.moveSelection(0);else if(35==e.keyCode)this.moveSelection(this.items.length-1);else if(13==e.keyCode)this.view.focus();else{if(!(e.keyCode>=65&&e.keyCode<=90&&this.selectedIndex>=0))return;{let{diagnostic:i}=this.items[this.selectedIndex],n=assignKeys(i.actions);for(let o=0;o<n.length;o++)if(n[o].toUpperCase().charCodeAt(0)==e.keyCode){let e=findDiagnostic(this.view.state.field(lintState).diagnostics,i);e&&i.actions[o].apply(t,e.from,e.to)}}}e.preventDefault()},onclick:t=>{for(let e=0;e<this.items.length;e++)this.items[e].dom.contains(t.target)&&this.moveSelection(e)}}),this.dom=elt("div",{class:"cm-panel-lint"},this.list,elt("button",{type:"button",name:"close","aria-label":this.view.state.phrase("close"),onclick:()=>closeLintPanel(this.view)},"×")),this.update()}get selectedIndex(){let t=this.view.state.field(lintState).selected;if(!t)return-1;for(let e=0;e<this.items.length;e++)if(this.items[e].diagnostic==t.diagnostic)return e;return-1}update(){let{diagnostics:t,selected:e}=this.view.state.field(lintState),i=0,n=!1,o=null;for(t.between(0,this.view.state.doc.length,(t,s,{spec:a})=>{let l,r=-1;for(let t=i;t<this.items.length;t++)if(this.items[t].diagnostic==a.diagnostic){r=t;break}r<0?(l=new PanelItem(this.view,a.diagnostic),this.items.splice(i,0,l),n=!0):(l=this.items[r],r>i&&(this.items.splice(i,r-i),n=!0)),e&&l.diagnostic==e.diagnostic?l.dom.hasAttribute("aria-selected")||(l.dom.setAttribute("aria-selected","true"),o=l):l.dom.hasAttribute("aria-selected")&&l.dom.removeAttribute("aria-selected"),i++});i<this.items.length&&!(1==this.items.length&&this.items[0].diagnostic.from<0);)n=!0,this.items.pop();0==this.items.length&&(this.items.push(new PanelItem(this.view,{from:-1,to:-1,severity:"info",message:this.view.state.phrase("No diagnostics")})),n=!0),o?(this.list.setAttribute("aria-activedescendant",o.id),this.view.requestMeasure({key:this,read:()=>({sel:o.dom.getBoundingClientRect(),panel:this.list.getBoundingClientRect()}),write:({sel:t,panel:e})=>{t.top<e.top?this.list.scrollTop-=e.top-t.top:t.bottom>e.bottom&&(this.list.scrollTop+=t.bottom-e.bottom)}})):this.selectedIndex<0&&this.list.removeAttribute("aria-activedescendant"),n&&this.sync()}sync(){let t=this.list.firstChild;function e(){let e=t;t=e.nextSibling,e.remove()}for(let i of this.items)if(i.dom.parentNode==this.list){for(;t!=i.dom;)e();t=i.dom.nextSibling}else this.list.insertBefore(i.dom,t);for(;t;)e()}moveSelection(t){if(this.selectedIndex<0)return;let e=findDiagnostic(this.view.state.field(lintState).diagnostics,this.items[t].diagnostic);e&&this.view.dispatch({selection:{anchor:e.from,head:e.to},scrollIntoView:!0,effects:movePanelSelection.of(e)})}static open(t){return new LintPanel(t)}}function svg(t,e='viewBox="0 0 40 40"'){return`url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" ${e}>${encodeURIComponent(t)}</svg>')`}function underline(t){return svg(`<path d="m0 2.5 l2 -1.5 l1 0 l2 1.5 l1 0" stroke="${t}" fill="none" stroke-width=".7"/>`,'width="6" height="3"')}const baseTheme=EditorView.baseTheme({".cm-diagnostic":{padding:"3px 6px 3px 8px",marginLeft:"-1px",display:"block",whiteSpace:"pre-wrap"},".cm-diagnostic-error":{borderLeft:"5px solid #d11"},".cm-diagnostic-warning":{borderLeft:"5px solid orange"},".cm-diagnostic-info":{borderLeft:"5px solid #999"},".cm-diagnosticAction":{font:"inherit",border:"none",padding:"2px 4px",backgroundColor:"#444",color:"white",borderRadius:"3px",marginLeft:"8px"},".cm-diagnosticSource":{fontSize:"70%",opacity:.7},".cm-lintRange":{backgroundPosition:"left bottom",backgroundRepeat:"repeat-x",paddingBottom:"0.7px"},".cm-lintRange-error":{backgroundImage:underline("#d11")},".cm-lintRange-warning":{backgroundImage:underline("orange")},".cm-lintRange-info":{backgroundImage:underline("#999")},".cm-lintRange-active":{backgroundColor:"#ffdd9980"},".cm-tooltip-lint":{padding:0,margin:0},".cm-lintPoint":{position:"relative","&:after":{content:'""',position:"absolute",bottom:0,left:"-2px",borderLeft:"3px solid transparent",borderRight:"3px solid transparent",borderBottom:"4px solid #d11"}},".cm-lintPoint-warning":{"&:after":{borderBottomColor:"orange"}},".cm-lintPoint-info":{"&:after":{borderBottomColor:"#999"}},".cm-panel.cm-panel-lint":{position:"relative","& ul":{maxHeight:"100px",overflowY:"auto","& [aria-selected]":{backgroundColor:"#ddd","& u":{textDecoration:"underline"}},"&:focus [aria-selected]":{background_fallback:"#bdf",backgroundColor:"Highlight",color_fallback:"white",color:"HighlightText"},"& u":{textDecoration:"none"},padding:0,margin:0},"& [name=close]":{position:"absolute",top:"0",right:"2px",background:"inherit",border:"none",font:"inherit",padding:0,margin:0}}});class LintGutterMarker extends GutterMarker{constructor(t){super(),this.diagnostics=t,this.severity=t.reduce((t,e)=>{let i=e.severity;return"error"==i||"warning"==i&&"info"==t?i:t},"info")}toDOM(t){let e=document.createElement("div");return e.className="cm-lint-marker cm-lint-marker-"+this.severity,e.onmouseover=()=>gutterMarkerMouseOver(t,e,this.diagnostics),e}}function trackHoverOn(t,e){let i=n=>{let o=e.getBoundingClientRect();if(!(n.clientX>o.left-10&&n.clientX<o.right+10&&n.clientY>o.top-10&&n.clientY<o.bottom+10)){for(let t=n.target;t;t=t.parentNode)if(1==t.nodeType&&t.classList.contains("cm-tooltip-lint"))return;window.removeEventListener("mousemove",i),t.state.field(lintGutterTooltip)&&t.dispatch({effects:setLintGutterTooltip.of(null)})}};window.addEventListener("mousemove",i)}function gutterMarkerMouseOver(t,e,i){function n(){let n=t.visualLineAtHeight(e.getBoundingClientRect().top+5);const o=t.coordsAtPos(n.from),s=e.getBoundingClientRect();o&&t.dispatch({effects:setLintGutterTooltip.of({pos:n.from,above:!1,create:()=>({dom:diagnosticsTooltip(t,i),offset:{x:s.left-o.left,y:0}})})}),e.onmouseout=e.onmousemove=null,trackHoverOn(t,e)}let o=setTimeout(n,600);e.onmouseout=()=>{clearTimeout(o),e.onmouseout=e.onmousemove=null},e.onmousemove=()=>{clearTimeout(o),o=setTimeout(n,600)}}function markersForDiagnostics(t,e){let i=Object.create(null);for(let n of e){let e=t.lineAt(n.from);(i[e.from]||(i[e.from]=[])).push(n)}let n=[];for(let t in i)n.push(new LintGutterMarker(i[t]).range(+t));return RangeSet.of(n,!0)}const lintGutterExtension=gutter({class:"cm-gutter-lint",markers:t=>t.state.field(lintGutterMarkers)}),lintGutterMarkers=StateField.define({create:()=>RangeSet.empty,update(t,e){t=t.map(e.changes);for(let i of e.effects)i.is(setDiagnosticsEffect)&&(t=markersForDiagnostics(e.state.doc,i.value));return t}}),setLintGutterTooltip=StateEffect.define(),lintGutterTooltip=StateField.define({create:()=>null,update:(t,e)=>(t&&e.docChanged&&(t=Object.assign(Object.assign({},t),{pos:e.changes.mapPos(t.pos)})),e.effects.reduce((t,e)=>e.is(setLintGutterTooltip)?e.value:t,t)),provide:t=>showTooltip.from(t)}),lintGutterTheme=EditorView.baseTheme({".cm-gutter-lint":{width:"1.4em","& .cm-gutterElement":{padding:"0 .2em",display:"flex",flexDirection:"column",justifyContent:"center"}},".cm-lint-marker":{width:"1em",height:"1em"},".cm-lint-marker-info":{content:svg('<path fill="#aaf" stroke="#77e" stroke-width="6" stroke-linejoin="round" d="M5 5L35 5L35 35L5 35Z"/>')},".cm-lint-marker-warning":{content:svg('<path fill="#fe8" stroke="#fd7" stroke-width="6" stroke-linejoin="round" d="M20 6L37 35L3 35Z"/>')},".cm-lint-marker-error:before":{content:svg('<circle cx="20" cy="20" r="15" fill="#f87" stroke="#f43" stroke-width="6"/>')}});function lintGutter(){return[lintGutterMarkers,lintGutterExtension,lintGutterTheme,lintGutterTooltip]}export{closeLintPanel,diagnosticCount,forceLinting,lintGutter,lintKeymap,linter,nextDiagnostic,openLintPanel,setDiagnostics,setDiagnosticsEffect};