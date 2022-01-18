import{ViewPlugin,PluginField,EditorView}from"@codemirror/view";import{Facet}from"@codemirror/state";const panelConfig=Facet.define({combine(t){let e,s;for(let o of t)e=e||o.topContainer,s=s||o.bottomContainer;return{topContainer:e,bottomContainer:s}}});function panels(t){return t?[panelConfig.of(t)]:[]}function getPanel(t,e){let s=t.plugin(panelPlugin),o=s?s.specs.indexOf(e):-1;return o>-1?s.panels[o]:null}const panelPlugin=ViewPlugin.fromClass(class{constructor(t){this.input=t.state.facet(showPanel),this.specs=this.input.filter(t=>t),this.panels=this.specs.map(e=>e(t));let e=t.state.facet(panelConfig);this.top=new PanelGroup(t,!0,e.topContainer),this.bottom=new PanelGroup(t,!1,e.bottomContainer),this.top.sync(this.panels.filter(t=>t.top)),this.bottom.sync(this.panels.filter(t=>!t.top));for(let t of this.panels)t.dom.classList.add("cm-panel"),t.mount&&t.mount()}update(t){let e=t.state.facet(panelConfig);this.top.container!=e.topContainer&&(this.top.sync([]),this.top=new PanelGroup(t.view,!0,e.topContainer)),this.bottom.container!=e.bottomContainer&&(this.bottom.sync([]),this.bottom=new PanelGroup(t.view,!1,e.bottomContainer)),this.top.syncClasses(),this.bottom.syncClasses();let s=t.state.facet(showPanel);if(s!=this.input){let e=s.filter(t=>t),o=[],i=[],n=[],l=[];for(let s of e){let e,a=this.specs.indexOf(s);a<0?(e=s(t.view),l.push(e)):(e=this.panels[a],e.update&&e.update(t)),o.push(e),(e.top?i:n).push(e)}this.specs=e,this.panels=o,this.top.sync(i),this.bottom.sync(n);for(let t of l)t.dom.classList.add("cm-panel"),t.mount&&t.mount()}else for(let e of this.panels)e.update&&e.update(t)}destroy(){this.top.sync([]),this.bottom.sync([])}},{provide:PluginField.scrollMargins.from(t=>({top:t.top.scrollMargin(),bottom:t.bottom.scrollMargin()}))});class PanelGroup{constructor(t,e,s){this.view=t,this.top=e,this.container=s,this.dom=void 0,this.classes="",this.panels=[],this.syncClasses()}sync(t){for(let e of this.panels)e.destroy&&t.indexOf(e)<0&&e.destroy();this.panels=t,this.syncDOM()}syncDOM(){if(0==this.panels.length)return void(this.dom&&(this.dom.remove(),this.dom=void 0));if(!this.dom){this.dom=document.createElement("div"),this.dom.className=this.top?"cm-panels cm-panels-top":"cm-panels cm-panels-bottom",this.dom.style[this.top?"top":"bottom"]="0";let t=this.container||this.view.dom;t.insertBefore(this.dom,this.top?t.firstChild:null)}let t=this.dom.firstChild;for(let e of this.panels)if(e.dom.parentNode==this.dom){for(;t!=e.dom;)t=rm(t);t=t.nextSibling}else this.dom.insertBefore(e.dom,t);for(;t;)t=rm(t)}scrollMargin(){return!this.dom||this.container?0:Math.max(0,this.top?this.dom.getBoundingClientRect().bottom-Math.max(0,this.view.scrollDOM.getBoundingClientRect().top):Math.min(innerHeight,this.view.scrollDOM.getBoundingClientRect().bottom)-this.dom.getBoundingClientRect().top)}syncClasses(){if(this.container&&this.classes!=this.view.themeClasses){for(let t of this.classes.split(" "))t&&this.container.classList.remove(t);for(let t of(this.classes=this.view.themeClasses).split(" "))t&&this.container.classList.add(t)}}}function rm(t){let e=t.nextSibling;return t.remove(),e}const baseTheme=EditorView.baseTheme({".cm-panels":{boxSizing:"border-box",position:"sticky",left:0,right:0},"&light .cm-panels":{backgroundColor:"#f5f5f5",color:"black"},"&light .cm-panels-top":{borderBottom:"1px solid #ddd"},"&light .cm-panels-bottom":{borderTop:"1px solid #ddd"},"&dark .cm-panels":{backgroundColor:"#333338",color:"white"}}),showPanel=Facet.define({enables:[panelPlugin,baseTheme]});export{getPanel,panels,showPanel};