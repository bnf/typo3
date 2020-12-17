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
var __decorate=this&&this.__decorate||function(e,t,i,o){var n,s=arguments.length,l=s<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)l=Reflect.decorate(e,t,i,o);else for(var r=e.length-1;r>=0;r--)(n=e[r])&&(l=(s<3?n(l):s>3?n(t,i,l):n(t,i))||l);return s>3&&l&&Object.defineProperty(t,i,l),l},__importDefault=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};define(["require","exports","jquery","TYPO3/CMS/Core/Ajax/AjaxRequest","TYPO3/CMS/Core/Event/RegularEvent","./ContextMenuActions","TYPO3/CMS/Core/Event/ThrottleEvent","lit-element","lit-html/directives/class-map","TYPO3/CMS/Core/lit-helper","TYPO3/CMS/Backend/Element/IconElement"],(function(e,t,i,o,n,s,l,r,a,c){"use strict";i=__importDefault(i);class u{constructor(){this.record={uid:null,table:null},this.mousePos={X:null,Y:null},this.delayContextMenuHide=!1,this.eventSources=[],this.element=null,this.storeMousePositionEvent=e=>{this.mousePos={X:e.pageX,Y:e.pageY},this.mouseOutFromMenu("#contentMenu0"),this.mouseOutFromMenu("#contentMenu1")},this.initializeEvents()}static within(e,t,i){const o=e.offset();return i>=o.top&&i<o.top+e.height()&&t>=o.left&&t<o.left+e.width()}show(e,t,i,o,n,s=null){this.record={table:e,uid:t};const l=s.matches("a, button, [tabindex]")?s:s.closest("a, button, [tabindex]");this.eventSources.push(l);let r="";void 0!==e&&(r+="table="+encodeURIComponent(e)),void 0!==t&&(r+=(r.length>0?"&":"")+"uid="+t),void 0!==i&&(r+=(r.length>0?"&":"")+"context="+i),void 0!==o&&(r+=(r.length>0?"&":"")+"enDisItems="+o),void 0!==n&&(r+=(r.length>0?"&":"")+"addParams="+n),this.fetch(r)}fetch(e){const t=TYPO3.settings.ajaxUrls.contextmenu;new o(t).withQueryArguments(e).get().then(async e=>{const t=await e.resolve();void 0!==e&&Object.keys(e).length>0&&this.populateData(t,0)})}populateData(e,t){this.initializeContextMenuElement(),console.log("populate",this),this.element.record=this.record,this.element.items=e,this.element.level=t;const o=i.default(this.element);o.length&&(0===t||i.default("#contentMenu"+(t-1)).is(":visible"))&&(o.css(this.getPosition(o)).show(),i.default("li.list-group-item[tabindex=-1]",o).first().focus())}initializeContextMenuElement(){this.element=this.element||document.getElementById("typo3-backend-context-menu"),null===this.element&&(this.element=document.createElement("typo3-backend-context-menu"),this.element.setAttribute("id","contentMenu0"),document.body.appendChild(this.element))}initializeEvents(){new n("click",(e,t)=>{t.onclick||(e.preventDefault(),this.show(t.dataset.table,parseInt(t.dataset.uid,10)||0,t.dataset.context,t.dataset.iteminfo,t.dataset.parameters,e.target))}).delegateTo(document,".t3js-contextmenutrigger"),new l("mousemove",this.storeMousePositionEvent.bind(this),50).bindTo(document)}getPosition(e){let t=0,o=0,n=this.eventSources[this.eventSources.length-1];if(n){const e=n.getBoundingClientRect();t=e.right,o=e.top}else t=this.mousePos.X,o=this.mousePos.Y;const s=i.default(window).width()-20,l=i.default(window).height(),r=e.width(),a=e.height(),c=t-i.default(document).scrollLeft(),u=o-i.default(document).scrollTop();return l-a<u&&(u>a?o-=a-10:o+=l-a-u),s-r<c&&(c>r?t-=r-10:s-r-c<i.default(document).scrollLeft()?t=i.default(document).scrollLeft():t+=s-r-c),{left:t+"px",top:o+"px"}}mouseOutFromMenu(e){const t=i.default(e);t.length>0&&t.is(":visible")&&!u.within(t,this.mousePos.X,this.mousePos.Y)?this.hide(e):t.length>0&&t.is(":visible")&&(this.delayContextMenuHide=!0)}hide(e){this.delayContextMenuHide=!1,window.setTimeout(()=>{if(!this.delayContextMenuHide){i.default(e).hide();const t=this.eventSources.pop();t&&i.default(t).focus()}},500)}hideAll(){this.hide("#contentMenu0"),this.hide("#contentMenu1")}}let d=class extends r.LitElement{constructor(){super(...arguments),this.items=null,this.level=-1,this.hidden=!1,this.record={uid:null,table:null},this.mousePos={X:null,Y:null},this.delayContextMenuHide=!1,this.eventSources=[]}static get styles(){return r.css`
      :host {
        display: block;
        position: absolute;
        z-index: 300;
      }
      ul {
        list-style: none;
        margin-bottom: 0;
        background-color: #fff;
        min-width: 150px;
        display: flex;
        flex-direction: column;
        padding-left: 0;
        border-radius: .125rem;
      }
      li {
        display: block;
        margin-bottom: 0;
        cursor: pointer;
        padding: .5em;
        border: 1px solid rgba(0,0,0,.125);
        position: relative;
        background-color: #fff;
      }
      li:not(:first-child) {
        border-top-color: transparent;
      }
      li:not(:last-child):not(.divider) {
        border-bottom-color: transparent;
      }
      li.divider {
        display: block;
        padding: 0 0 1px;
        margin: 0 0 1px;
        width: 100%;
      }
      li:hover,
      li:focus {
        z-index: 1; /* Place hover/focus items above their siblings for proper border styling */
        text-decoration: none;
        background-color: rgba(0,0,0,.04);
      }
      li:focus {
        outline: 1px auto Highlight;
        outline: 1px auto -webkit-focus-ring-color;
        outline-offset: -3px;
      }
      typo3-backend-icon {
        width: calc(18em/14);
        text-align: center;
      }
    `}render(){const e=this.drawMenu(this.items,this.level);return r.html`
      <ul>${e}</ul>
    `}drawActionItem(e){const t=e.additionalAttributes||{};return r.html`
      <li
        role="menuitem"
        tabindex="-1"
        data-callback-action="${e.callbackAction}"
        @click="${this.handleListGroupItemClick}"
        @keydown="${this.handleListGroupItemKeydown}"
        ...="${c.spread(t)}"
      >
        <typo3-backend-icon identifier="${e.iconIdentifier}" size="small"></typo3-backend-icon> ${e.label}
      </li>
    `}handleListGroupItemClick(t){t.preventDefault();const o=t.target;if(o.classList.contains("submenu"))return void this.openSubmenu(this.level,o);const n=o.dataset.callbackAction,l=o.dataset.callbackModule;l?e([l],e=>{e[n].bind(i.default(o))(this.record.table,this.record.uid)}):s&&"function"==typeof s[n]?s[n].bind(i.default(o))(this.record.table,this.record.uid):console.log("action: "+n+" not found"),this.hidden=!0}handleListGroupItemKeydown(e){const t=e.currentTarget;switch(e.key){case"Down":case"ArrowDown":this.setFocusToNextItem(t);break;case"Up":case"ArrowUp":this.setFocusToPreviousItem(t);break;case"Right":case"ArrowRight":if(!t.classList.contains("submenu"))return;this.openSubmenu(this.level,t);break;case"Home":this.setFocusToFirstItem(t);break;case"End":this.setFocusToLastItem(t);break;case"Enter":case"Space":t.click();break;case"Esc":case"Escape":case"Left":case"ArrowLeft":break;case"Tab":this.hidden=!0;break;default:return}e.preventDefault()}setFocusToPreviousItem(e){let t=this.getItemBackward(e.previousElementSibling);t||(t=this.getLastItem(e)),t.focus()}setFocusToNextItem(e){let t=this.getItemForward(e.nextElementSibling);t||(t=this.getFirstItem(e)),t.focus()}setFocusToFirstItem(e){let t=this.getFirstItem(e);t&&t.focus()}setFocusToLastItem(e){let t=this.getLastItem(e);t&&t.focus()}getItemBackward(e){for(;e&&(!e.classList.contains("list-group-item")||"-1"!==e.getAttribute("tabindex"));)e=e.previousElementSibling;return e}getItemForward(e){for(;e&&(!e.classList.contains("list-group-item")||"-1"!==e.getAttribute("tabindex"));)e=e.nextElementSibling;return e}getFirstItem(e){return this.getItemForward(e.parentElement.firstElementChild)}getLastItem(e){return this.getItemBackward(e.parentElement.lastElementChild)}openSubmenu(e,t){t.removeAttribute("style")}drawMenu(e,t){return r.html`
      ${Object.values(e).map(e=>{if("item"===e.type)return this.drawActionItem(e);if("divider"===e.type)return r.html`
          <li role="separator" class="divider"></li>
        `;if("submenu"===e.type||e.childItems){const i=this.drawMenu(e.childItems,1);let o={"context-menu":!0};return o["contentMenu"+(t+1)]=!0,r.html`
          <li role="menuitem" aria-haspopup="true" class="submenu" tabindex="-1">
            ${e.label}&nbsp;&nbsp;<typo3-backend-icon identifier="actions-chevron-right" size="small"></typo3-backend-icon>
          </li>
          <div class="${a.classMap(o)}" style="display:none;">
            <ul role="menu" class="list-group">${i}</ul>
          </div>
        `}return r.html``})}
    `}};return __decorate([r.property({type:Array})],d.prototype,"items",void 0),__decorate([r.property({type:Number})],d.prototype,"level",void 0),__decorate([r.property({type:Boolean})],d.prototype,"hidden",void 0),__decorate([r.property({type:Object})],d.prototype,"record",void 0),d=__decorate([r.customElement("typo3-backend-context-menu")],d),new u}));