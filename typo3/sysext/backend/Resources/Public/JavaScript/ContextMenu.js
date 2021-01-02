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
var __decorate=this&&this.__decorate||function(e,t,s,i){var n,o=arguments.length,l=o<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,s):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)l=Reflect.decorate(e,t,s,i);else for(var r=e.length-1;r>=0;r--)(n=e[r])&&(l=(o<3?n(l):o>3?n(t,s,l):n(t,s))||l);return o>3&&l&&Object.defineProperty(t,s,l),l},__importDefault=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};define(["require","exports","jquery","TYPO3/CMS/Core/Ajax/AjaxRequest","TYPO3/CMS/Core/Event/RegularEvent","./ContextMenuActions","TYPO3/CMS/Core/Event/ThrottleEvent","lit-element","lit-html/directives/unsafe-html","lit-html/directives/class-map","TYPO3/CMS/Core/lit-helper"],(function(e,t,s,i,n,o,l,r,a,u,c){"use strict";s=__importDefault(s);class d{constructor(){this.mousePos={X:null,Y:null},this.delayContextMenuHide=!1,this.record={uid:null,table:null},this.eventSources=[],this.element=null,this.storeMousePositionEvent=e=>{this.mousePos={X:e.pageX,Y:e.pageY},this.mouseOutFromMenu("#contentMenu0"),this.mouseOutFromMenu("#contentMenu1")},this.initializeEvents()}static within(e,t,s){const i=e.offset();return s>=i.top&&s<i.top+e.height()&&t>=i.left&&t<i.left+e.width()}fetch(e){const t=TYPO3.settings.ajaxUrls.contextmenu;new i(t).withQueryArguments(e).get().then(async e=>{const t=await e.resolve();void 0!==e&&Object.keys(e).length>0&&this.populateData(t,0)})}populateData(e,t){this.initializeContextMenuElement(),console.log("populate",this),this.element.record=this.record,this.element.items=e,this.element.level=t;const i=s.default(this.element);i.length&&(0===t||s.default("#contentMenu"+(t-1)).is(":visible"))&&(i.css(this.getPosition(i)).show(),s.default("li.list-group-item[tabindex=-1]",i).first().focus())}initializeContextMenuElement(){this.element=this.element||document.getElementById("typo3-backend-context-menu"),null===this.element&&(this.element=document.createElement("typo3-backend-context-menu"),this.element.setAttribute("id","contentMenu0"),document.body.appendChild(this.element))}initializeEvents(){new n("click",(e,t)=>{t.onclick||(e.preventDefault(),this.show(t.dataset.table,parseInt(t.dataset.uid,10)||0,t.dataset.context,t.dataset.iteminfo,t.dataset.parameters,e.target))}).delegateTo(document,".t3js-contextmenutrigger"),new l("mousemove",this.storeMousePositionEvent.bind(this),50).bindTo(document)}show(e,t,s,i,n,o=null){this.record={table:e,uid:t};const l=o.matches("a, button, [tabindex]")?o:o.closest("a, button, [tabindex]");this.eventSources.push(l);let r="";void 0!==e&&(r+="table="+encodeURIComponent(e)),void 0!==t&&(r+=(r.length>0?"&":"")+"uid="+t),void 0!==s&&(r+=(r.length>0?"&":"")+"context="+s),void 0!==i&&(r+=(r.length>0?"&":"")+"enDisItems="+i),void 0!==n&&(r+=(r.length>0?"&":"")+"addParams="+n),this.fetch(r)}getPosition(e){let t=0,i=0,n=this.eventSources[this.eventSources.length-1];if(n){const e=n.getBoundingClientRect();t=e.right,i=e.top}else t=this.mousePos.X,i=this.mousePos.Y;const o=s.default(window).width()-20,l=s.default(window).height(),r=e.width(),a=e.height(),u=t-s.default(document).scrollLeft(),c=i-s.default(document).scrollTop();return l-a<c&&(c>a?i-=a-10:i+=l-a-c),o-r<u&&(u>r?t-=r-10:o-r-u<s.default(document).scrollLeft()?t=s.default(document).scrollLeft():t+=o-r-u),{left:t+"px",top:i+"px"}}mouseOutFromMenu(e){const t=s.default(e);t.length>0&&t.is(":visible")&&!d.within(t,this.mousePos.X,this.mousePos.Y)?this.hide(e):t.length>0&&t.is(":visible")&&(this.delayContextMenuHide=!0)}hide(e){this.delayContextMenuHide=!1,window.setTimeout(()=>{if(!this.delayContextMenuHide){s.default(e).hide();const t=this.eventSources.pop();t&&s.default(t).focus()}},500)}hideAll(){this.hide("#contentMenu0"),this.hide("#contentMenu1")}}let h=class extends r.LitElement{constructor(){super(...arguments),this.items=null,this.level=-1,this.hidden=!1,this.record={uid:null,table:null},this.mousePos={X:null,Y:null},this.delayContextMenuHide=!1,this.eventSources=[]}static get styles(){return r.css`
      :host {
        display: block;
        position: absolute;
        z-index: 300;
      }
    `}createRenderRoot(){return this}render(){const e=this.drawMenu(this.items,this.level);return r.html`
      <ul class="list-group">${e}</ul>
    `}drawActionItem(e){const t=e.additionalAttributes||{};return r.html`
      <li
        role="menuitem"
        class="list-group-item"
        tabindex="-1"
        data-callback-action="${e.callbackAction}"
        @click="${this.handleListGroupItemClick}"
        @keydown="${this.handleListGroupItemKeydown}"
        ...="${c.spread(t)}"
      >
        <span class="list-group-item-icon">${a.unsafeHTML(e.icon)}</span> ${e.label}
      </li>
    `}handleListGroupItemClick(t){t.preventDefault();const i=t.target;if(i.classList.contains("list-group-item-submenu"))return void this.openSubmenu(this.level,i);const n=i.dataset.callbackAction,l=i.dataset.callbackModule;l?e([l],e=>{e[n].bind(s.default(i))(this.record.table,this.record.uid)}):o&&"function"==typeof o[n]?o[n].bind(s.default(i))(this.record.table,this.record.uid):console.log("action: "+n+" not found"),this.hidden=!0}handleListGroupItemKeydown(e){const t=e.currentTarget;switch(e.key){case"Down":case"ArrowDown":this.setFocusToNextItem(t);break;case"Up":case"ArrowUp":this.setFocusToPreviousItem(t);break;case"Right":case"ArrowRight":if(!t.classList.contains("list-group-item-submenu"))return;this.openSubmenu(this.level,t);break;case"Home":this.setFocusToFirstItem(t);break;case"End":this.setFocusToLastItem(t);break;case"Enter":case"Space":t.click();break;case"Esc":case"Escape":case"Left":case"ArrowLeft":break;case"Tab":this.hidden=!0;break;default:return}e.preventDefault()}setFocusToPreviousItem(e){let t=this.getItemBackward(e.previousElementSibling);t||(t=this.getLastItem(e)),t.focus()}setFocusToNextItem(e){let t=this.getItemForward(e.nextElementSibling);t||(t=this.getFirstItem(e)),t.focus()}setFocusToFirstItem(e){let t=this.getFirstItem(e);t&&t.focus()}setFocusToLastItem(e){let t=this.getLastItem(e);t&&t.focus()}getItemBackward(e){for(;e&&(!e.classList.contains("list-group-item")||"-1"!==e.getAttribute("tabindex"));)e=e.previousElementSibling;return e}getItemForward(e){for(;e&&(!e.classList.contains("list-group-item")||"-1"!==e.getAttribute("tabindex"));)e=e.nextElementSibling;return e}getFirstItem(e){return this.getItemForward(e.parentElement.firstElementChild)}getLastItem(e){return this.getItemBackward(e.parentElement.lastElementChild)}openSubmenu(e,t){t.removeAttribute("style")}drawMenu(e,t){return r.html`
      ${Object.values(e).map(e=>{if("item"===e.type)return this.drawActionItem(e);if("divider"===e.type)return r.html`
          <li role="separator" class="list-group-item list-group-item-divider"></li>
        `;if("submenu"===e.type||e.childItems){const s=this.drawMenu(e.childItems,1);let i={"context-menu":!0};return i["contentMenu"+(t+1)]=!0,r.html`
          <li role="menuitem" aria-haspopup="true" class="list-group-item list-group-item-submenu" tabindex="-1">
            <span class="list-group-item-icon">${a.unsafeHTML(e.icon)}</span> ${e.label}&nbsp;&nbsp;<span class="fa fa-caret-right"></span>
          </li>
          <div class="${u.classMap(i)}" style="display:none;">
            <ul role="menu" class="list-group">${s}</ul>
          </div>
        `}return r.html``})}
    `}};return __decorate([r.property({type:Array})],h.prototype,"items",void 0),__decorate([r.property({type:Number})],h.prototype,"level",void 0),__decorate([r.property({type:Boolean})],h.prototype,"hidden",void 0),__decorate([r.property({type:Object})],h.prototype,"record",void 0),h=__decorate([r.customElement("typo3-backend-context-menu")],h),new d}));