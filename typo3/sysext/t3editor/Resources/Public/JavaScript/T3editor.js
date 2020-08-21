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
define(["require","cm/lib/codemirror","jquery","TYPO3/CMS/Backend/FormEngine"],(function(e,t,i,n){"use strict";class r{static createPanelNode(e,t){return i("<div />",{class:"CodeMirror-panel CodeMirror-panel-"+e,id:"panel-"+e}).append(i("<span />").text(t)).get(0)}constructor(){this.initialize()}initialize(){i(()=>{this.observeEditorCandidates()})}observeEditorCandidates(){const e={root:document.body};let t=new IntersectionObserver(e=>{e.forEach(e=>{if(e.intersectionRatio>0){const t=i(e.target);t.prop("is_t3editor")||this.initializeEditor(t)}})},e);document.querySelectorAll("textarea.t3editor").forEach(e=>{t.observe(e)})}initializeEditor(o){const a=o.data("codemirror-config"),l=a.mode.split("/"),s=i.merge([l.join("/")],JSON.parse(a.addons)),d=JSON.parse(a.options);Promise.all(s.map(t=>new Promise((function(i,n){e([t],(function(e){i("object"==typeof e?Object.defineProperty(e,"default",{value:e,enumerable:!1}):{default:e})}),n)})))).then(()=>{const e=t.fromTextArea(o.get(0),{extraKeys:{"Ctrl-F":"findPersistent","Cmd-F":"findPersistent","Ctrl-Alt-F":e=>{e.setOption("fullScreen",!e.getOption("fullScreen"))},"Ctrl-Space":"autocomplete",Esc:e=>{e.getOption("fullScreen")&&e.setOption("fullScreen",!1)}},fullScreen:!1,lineNumbers:!0,lineWrapping:!0,mode:l[l.length-1]});i.each(d,(t,i)=>{e.setOption(t,i)}),e.on("change",()=>{n.Validation.markFieldAsChanged(o)});const a=r.createPanelNode("bottom",o.attr("alt"));if(e.addPanel(a,{position:"bottom",stable:!1}),o.attr("rows")){const t=18,i=4;e.setSize(null,parseInt(o.attr("rows"),10)*t+i+a.getBoundingClientRect().height)}else e.getWrapperElement().style.height=document.body.getBoundingClientRect().height-e.getWrapperElement().getBoundingClientRect().top-80+"px",e.setOption("viewportMargin",1/0)}),o.prop("is_t3editor",!0)}}return new r}));