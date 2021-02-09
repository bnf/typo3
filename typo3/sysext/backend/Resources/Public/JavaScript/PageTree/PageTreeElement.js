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
var __importDefault=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};define(["require","exports","lit-html","lit-element","./PageTree","./PageTreeDragDrop","../Viewport","./PageTreeToolbar","TYPO3/CMS/Core/Ajax/AjaxRequest","TYPO3/CMS/Backend/Element/IconElement"],(function(e,t,r,i,a,o,n,s,l){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.PageTreeElement=void 0,n=__importDefault(n),l=__importDefault(l);class d{static initialize(e){const t=document.querySelector(e);if(t&&t.childNodes.length>0)return void t.querySelector(".svg-tree").dispatchEvent(new Event("svg-tree:visible"));r.render(d.renderTemplate(),t);const i=t.querySelector(".svg-tree-wrapper"),c=new a.PageTree,g=new o.PageTreeDragDrop(c),p=top.TYPO3.settings.ajaxUrls.page_tree_configuration;new l.default(p).get().then(async e=>{const r=await e.resolve("json"),a=top.TYPO3.settings.ajaxUrls.page_tree_data,o=top.TYPO3.settings.ajaxUrls.page_tree_filter;Object.assign(r,{dataUrl:a,filterUrl:o,showIcons:!0}),c.initialize(i,r,g),n.default.NavigationContainer.setComponentInstance(c);const l=t.querySelector(".svg-toolbar");if(!l.dataset.treeShowToolbar){new s.PageTreeToolbar(g).initialize(i,l),l.dataset.treeShowToolbar="true"}})}static renderTemplate(){return i.html`
      <div id="typo3-pagetree" class="svg-tree">
        <div>
          <div id="typo3-pagetree-toolbar" class="svg-toolbar"></div>
          <div id="typo3-pagetree-treeContainer" class="navigation-tree-container">
            <div id="typo3-pagetree-tree" class="svg-tree-wrapper">
              <div class="node-loader">
                <typo3-backend-icon identifier="spinner-circle-light" size="small"></typo3-backend-icon>
              </div>
            </div>
          </div>
        </div>
        <div class="svg-tree-loader">
          <typo3-backend-icon identifier="spinner-circle-light" size="large"></typo3-backend-icon>
        </div>
      </div>
    `}}t.PageTreeElement=d}));