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
var DashboardWidgetMoveIntend,__decorate=function(t,e,i,a){var s,d=arguments.length,n=d<3?e:null===a?a=Object.getOwnPropertyDescriptor(e,i):a;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(t,e,i,a);else for(var o=t.length-1;o>=0;o--)(s=t[o])&&(n=(d<3?s(n):d>3?s(e,i,n):s(e,i))||n);return d>3&&n&&Object.defineProperty(e,i,n),n};import{html,LitElement,nothing}from"lit";import{customElement,property,state}from"lit/decorators.js";import{repeat}from"lit/directives/repeat.js";import{unsafeHTML}from"lit/directives/unsafe-html.js";import{styleMap}from"lit/directives/style-map.js";import{Task}from"@lit/task";import"@typo3/backend/element/icon-element.js";import AjaxRequest from"@typo3/core/ajax/ajax-request.js";import ClientStorage from"@typo3/backend/storage/client.js";import{lll,delay}from"@typo3/core/lit-helper.js";import Modal from"@typo3/backend/modal.js";import{SeverityEnum}from"@typo3/backend/enum/severity.js";import RegularEvent from"@typo3/core/event/regular-event.js";import{AjaxResponse}from"@typo3/core/ajax/ajax-response.js";import{Categories}from"@typo3/backend/new-record-wizard.js";import{topLevelModuleImport}from"@typo3/backend/utility/top-level-module-import.js";import Notification from"@typo3/backend/notification.js";export var DashboardActionEvent;function createSet(t){const e=new Set;for(let i=0;i<t.height;i++)for(let a=0;a<t.width;a++){const s=`${t.y+i}-${t.x+a}`;e.add(s)}return e}!function(t){t.dashboardAdd="typo3:dashboard:dashboard:add",t.dashboardEdit="typo3:dashboard:dashboard:edit",t.dashboardUpdate="typo3:dashboard:dashboard:update",t.dashboardDelete="typo3:dashboard:dashboard:delete",t.widgetAdd="typo3:dashboard:widget:add",t.widgetRemove="typo3:dashboard:widget:remove",t.widgetRefresh="typo3:dashboard:widget:refresh",t.widgetMoveIntend="typo3:dashboard:widget:moveIntend",t.widgetContentRendered="typo3:dashboard:widget:content:rendered"}(DashboardActionEvent||(DashboardActionEvent={})),function(t){t.start="start",t.end="end",t.left="left",t.right="right",t.up="up",t.down="down"}(DashboardWidgetMoveIntend||(DashboardWidgetMoveIntend={}));let Dashboard=class extends LitElement{constructor(){super(),this.loading=!1,this.dashboards=[],this.currentDashboard=null,this.columns=4,this.dragInformation=null,this.resizeObserver=null,this.clientStorageIdentifier="dashboard/current_dashboard",this.useViewTransition=!1,this.enableViewTransitions=!0,this.viewTransition=null,this.mql=null,this.dragOverTimeout=null,this.activeElementRef=null,this.mqListener=t=>{this.enableViewTransitions=!t.matches},this.handleLegacyWidgetRefreshEvent=t=>{const e=new CustomEvent(DashboardActionEvent.widgetRefresh,{detail:{identifier:t.identifier},bubbles:!0,composed:!0});this.dispatchEvent(e)},new RegularEvent(DashboardActionEvent.widgetRefresh,(t=>{t.preventDefault();this.getGridItemByIdentifier(t.detail.identifier).querySelector("typo3-dashboard-widget").refresh()})).bindTo(this),new RegularEvent(DashboardActionEvent.widgetRemove,(t=>{t.preventDefault();const e=t.detail;new AjaxRequest(TYPO3.settings.ajaxUrls.dashboard_widget_remove).post({dashboard:this.currentDashboard.identifier,widget:e.widget}).then((async t=>{if("ok"===(await t.resolve()).status){this.currentDashboard.widgets=this.currentDashboard.widgets.filter((t=>t.identifier!==e.widget));for(const[t,i]of Object.entries(this.currentDashboard.widgetPositions)){const a=Number(t);this.currentDashboard.widgetPositions[a]=i.filter((t=>t.identifier!==e.widget))}this.useViewTransition=!0,this.requestUpdate()}}))})).bindTo(top.document),new RegularEvent(DashboardActionEvent.widgetMoveIntend,(t=>{t.preventDefault();const e=t.detail,i=e.intend,a=this.widgetPositionByIdentifier(e.identifier);switch(i){case DashboardWidgetMoveIntend.up:a.y=Math.max(0,a.y-1);break;case DashboardWidgetMoveIntend.down:a.y++;break;case DashboardWidgetMoveIntend.left:a.x=Math.max(0,a.x-1);break;case DashboardWidgetMoveIntend.right:a.x=Math.min(this.columns-a.width,a.x+1);break;case DashboardWidgetMoveIntend.end:return document.activeElement instanceof HTMLElement&&document.activeElement.closest("typo3-dashboard")===this&&(this.activeElementRef=document.activeElement),this.widgetPositionsSort(this.currentDashboard.widgetPositions[this.columns]),void top.document.dispatchEvent(new CustomEvent(DashboardActionEvent.dashboardUpdate,{detail:{identifier:this.currentDashboard.identifier,widgets:this.currentDashboard.widgets,widgetPositions:this.currentDashboard.widgetPositions}}));default:return}this.widgetPositionChange(this.currentDashboard.widgetPositions[this.columns],a)})).bindTo(top.document),new RegularEvent(DashboardActionEvent.dashboardAdd,(t=>{t.preventDefault();const e=t.detail;new AjaxRequest(TYPO3.settings.ajaxUrls.dashboard_dashboard_add).post({preset:e.preset,title:e.title}).then((async t=>{const e=await t.resolve();if("ok"===e.status){const t=e.dashboard;this.dashboards.push(t);const i=this.getDashboardByIdentifier(t.identifier)||this.getDashboardFirst();this.selectDashboard(i),this.requestUpdate()}}))})).bindTo(top.document),new RegularEvent(DashboardActionEvent.dashboardEdit,(t=>{t.preventDefault();const e=t.detail;new AjaxRequest(TYPO3.settings.ajaxUrls.dashboard_dashboard_edit).post({identifier:e.identifier,title:e.title}).then((async t=>{const i=await t.resolve();if("ok"===i.status){const t=this.dashboards.filter((t=>t.identifier===e.identifier))[0],a=this.dashboards.indexOf(t),s=i.dashboard;this.dashboards[a]=s,t.identifier===s.identifier&&this.selectDashboard(s),this.requestUpdate()}}))})).bindTo(top.document),new RegularEvent(DashboardActionEvent.dashboardUpdate,(t=>{t.preventDefault();const e=t.detail;new AjaxRequest(TYPO3.settings.ajaxUrls.dashboard_dashboard_update).post({identifier:e.identifier,widgets:e.widgets,widgetPositions:e.widgetPositions}).then((async t=>{const i=await t.resolve();if("ok"===i.status){const t=this.dashboards.filter((t=>t.identifier===e.identifier))[0],a=this.dashboards.indexOf(t),s=i.dashboard;this.dashboards[a]=s,t.identifier===s.identifier&&this.selectDashboard(s),this.requestUpdate()}}))})).bindTo(top.document),new RegularEvent(DashboardActionEvent.dashboardDelete,(t=>{t.preventDefault();const e=t.detail;new AjaxRequest(TYPO3.settings.ajaxUrls.dashboard_dashboard_delete).post({identifier:e.identifier}).then((async t=>{if("ok"===(await t.resolve()).status){this.dashboards=this.dashboards.filter((t=>t.identifier!==e.identifier));const t=this.getDashboardFirst();this.selectDashboard(t),this.requestUpdate()}}))})).bindTo(top.document)}connectedCallback(){super.connectedCallback(),this.resizeObserver=new ResizeObserver((t=>{for(const e of t){const{width:t}=e.contentRect;this.columns=t>950?4:t>750?2:1}})),this.resizeObserver.observe(this),"startViewTransition"in document?(this.mql=window.matchMedia("(prefers-reduced-motion: reduce)"),this.mqListener(this.mql),this.mql.addEventListener("change",this.mqListener)):this.enableViewTransitions=!1}disconnectedCallback(){super.disconnectedCallback(),this.resizeObserver?.disconnect(),this.resizeObserver=null,this.mql?.removeEventListener("change",this.mqListener),this.mql=null}firstUpdated(){this.load()}updated(){this.activeElementRef&&(this.activeElementRef.focus(),this.activeElementRef=null)}createRenderRoot(){return this}scheduleUpdate(){const{useViewTransition:t}=this;return this.useViewTransition=!1,t&&this.enableViewTransitions?(async()=>{this.viewTransition=document.startViewTransition((()=>super.scheduleUpdate())),await this.viewTransition.finished,this.viewTransition=null})():super.scheduleUpdate()}render(){return this.loading?html`${this.renderLoader()}`:html`
      ${this.renderHeader()}
      <div class="dashboard-container">
        ${this.renderContent()}
      </div>
      ${this.renderFooter()}
      `}skipCurrentViewTransition(){this.viewTransition?.skipTransition()}async load(){this.loading=!0,this.dashboards=await this.fetchDashboards();const t=ClientStorage.get(this.clientStorageIdentifier),e=this.getDashboardByIdentifier(t)||this.getDashboardFirst();this.selectDashboard(e),this.loading=!1}async fetchData(t){try{return(await new AjaxRequest(t).get({cache:"no-cache"})).resolve()}catch(t){return console.error(t),[]}}async fetchPresets(){const t=await this.fetchData(TYPO3.settings.ajaxUrls.dashboard_presets_get);return Object.values(t)}async fetchCategories(){const t=await this.fetchData(TYPO3.settings.ajaxUrls.dashboard_categories_get);return Categories.fromData(t)}async fetchDashboards(){return await this.fetchData(TYPO3.settings.ajaxUrls.dashboard_dashboards_get)}getDashboardByIdentifier(t){return this.dashboards.find((e=>e.identifier===t))||null}getDashboardFirst(){return this.dashboards.length>0?this.dashboards[0]:null}async createDashboard(){const t=(await this.fetchPresets()).filter((t=>t.showInWizard)),e=html`
      <form>
        <div class="form-group">
          <label class="form-label" for="dashboard-form-add-title">${lll("dashboard.title")}</label>
          <input class="form-control" id="dashboard-form-add-title" type="text" name="title" required="required">
        </div>
        <div class="dashboard-modal-items">
          ${repeat(t,(t=>t.identifier),((t,e)=>html`
            <div class="dashboard-modal-item">
              <input
                type="radio"
                name="preset"
                value=${t.identifier}
                class="dashboard-modal-item-checkbox"
                id="dashboard-form-add-preset-${t.identifier}"
                ?checked=${0===e}
              >
              <label for="dashboard-form-add-preset-${t.identifier}" class="dashboard-modal-item-block">
                <span class="dashboard-modal-item-icon">
                  <typo3-backend-icon identifier=${t.icon} size="medium"></typo3-backend-icon>
                </span>
                <span class="dashboard-modal-item-details">
                  <span class="dashboard-modal-item-title">${t.title}</span>
                  <span class="dashboard-modal-item-description">${t.description}</span>
                </span>
              </label>
            </div>
          `))}
        </div>
      </form>
    `;Modal.advanced({type:Modal.types.default,title:lll("dashboard.add"),size:Modal.sizes.medium,severity:SeverityEnum.notice,content:e,callback:t=>{t.addEventListener("typo3-modal-shown",(()=>{t.querySelector("#dashboard-form-add-title")?.focus()})),t.addEventListener("button.clicked",(e=>{if("save"===e.target.getAttribute("name")){t.querySelector("form").requestSubmit()}else t.hideModal()})),t.querySelector("form").addEventListener("submit",(e=>{e.preventDefault();const i=e.target,a=new FormData(i),s={preset:a.get("preset"),title:a.get("title")};top.document.dispatchEvent(new CustomEvent(DashboardActionEvent.dashboardAdd,{detail:s})),t.hideModal()}))},buttons:[{text:lll("dashboard.add.button.close"),btnClass:"btn-default",name:"cancel"},{text:lll("dashboard.add.button.ok"),btnClass:"btn-primary",name:"save"}]})}editDashboard(t){const e=html`
      <form>
        <div class="form-group">
          <label class="form-label" for="dashboard-form-edit-title">${lll("dashboard.title")}</label>
          <input class="form-control" id="dashboard-form-edit-title" type="text" name="title" value=${t.title||""} required="required">
        </div>
      </form>
    `;Modal.advanced({type:Modal.types.default,title:lll("dashboard.configure"),size:Modal.sizes.small,severity:SeverityEnum.notice,content:e,callback:e=>{e.addEventListener("typo3-modal-shown",(()=>{e.querySelector("#dashboard-form-edit-title")?.focus()})),e.addEventListener("button.clicked",(t=>{if("save"===t.target.getAttribute("name")){e.querySelector("form").requestSubmit()}else e.hideModal()})),e.querySelector("form").addEventListener("submit",(i=>{i.preventDefault();const a=i.target,s=new FormData(a),d={identifier:t.identifier,title:s.get("title")};top.document.dispatchEvent(new CustomEvent(DashboardActionEvent.dashboardEdit,{detail:d})),e.hideModal()}))},buttons:[{text:lll("dashboard.configure.button.close"),btnClass:"btn-default",name:"cancel"},{text:lll("dashboard.configure.button.ok"),btnClass:"btn-primary",name:"save"}]})}deleteDashboard(t){const e=Modal.confirm(lll("dashboard.delete"),lll("dashboard.delete.sure"),SeverityEnum.warning,[{text:lll("dashboard.delete.cancel"),active:!0,btnClass:"btn-default",name:"cancel"},{text:lll("dashboard.delete.ok"),btnClass:"btn-warning",name:"delete"}]);e.addEventListener("button.clicked",(i=>{if("delete"===i.target.getAttribute("name")){const e={identifier:t.identifier};top.document.dispatchEvent(new CustomEvent(DashboardActionEvent.dashboardDelete,{detail:e}))}e.hideModal()}))}selectDashboard(t){null!==t&&ClientStorage.set(this.clientStorageIdentifier,t.identifier),this.currentDashboard=t}async addWidget(){topLevelModuleImport("@typo3/backend/new-record-wizard.js");const t=top.document.createElement("typo3-backend-new-record-wizard");t.searchPlaceholder=lll("widget.addToDashboard.searchLabel"),t.searchNothingFoundLabel=lll("widget.addToDashboard.searchNotFound"),t.categories=await this.fetchCategories(),t.addEventListener(DashboardActionEvent.widgetAdd,(async t=>{const e=t.detail.item,i=await new AjaxRequest(TYPO3.settings.ajaxUrls.dashboard_widget_add).post({dashboard:this.currentDashboard.identifier,type:e.identifier}),a=await i.resolve();this.currentDashboard.widgets.push(a),this.requestUpdate()})),Modal.advanced({type:Modal.types.default,title:lll("widget.addToDashboard",this.currentDashboard.title),size:Modal.sizes.medium,severity:SeverityEnum.notice,content:t,callback:t=>{t.addEventListener("button.clicked",(()=>{t.hideModal()}))},buttons:[{text:lll("widget.add.button.close"),btnClass:"btn-default",name:"cancel"}]})}renderLoader(){return html`
      <div class="dashboard-loader">
          <typo3-backend-icon identifier="spinner-circle" size="medium"></typo3-backend-icon>
      </div>
      `}renderHeader(){const t=html`
      <button
        class="dashboard-button dashboard-button-tab-add"
        title=${lll("dashboard.add")}
        @click=${()=>{this.createDashboard()}}
      >
        <typo3-backend-icon identifier="actions-plus" size="small"></typo3-backend-icon>
        <span class="visually-hidden">${lll("dashboard.add")}</span>
      </button>
      `,e=null!==this.currentDashboard?html`
        <button
          class="btn btn-default btn-sm"
          title=${lll("dashboard.configure")}
          @click=${()=>{this.editDashboard(this.currentDashboard)}}
        >
          <typo3-backend-icon identifier="actions-cog" size="small"></typo3-backend-icon>
          <span class="visually-hidden">${lll("dashboard.configure")}</span>
        </button>
        `:nothing,i=null!==this.currentDashboard?html`
        <button
          class="btn btn-default btn-sm"
          title=${lll("dashboard.delete")}
          @click=${()=>{this.deleteDashboard(this.currentDashboard)}}
        >
          <typo3-backend-icon identifier="actions-delete" size="small"></typo3-backend-icon>
          <span class="visually-hidden">${lll("dashboard.delete")}</span>
        </button>
        `:nothing;return html`
      <div class="dashboard-header">
        <h1 class="visually-hidden">${this.currentDashboard?.title}</h1>
        <div class="dashboard-header-container">
          <div class="dashboard-tabs">
            ${repeat(this.dashboards,(t=>t.identifier),(t=>html`
              <button
                @click=${()=>{this.selectDashboard(t)}}
                class="dashboard-tab${t===this.currentDashboard?" dashboard-tab--active":""}"
              >
                ${t.title}
              </button>
            `))}
            ${t}
          </div>
          ${e||i?html`<div class="dashboard-configuration btn-toolbar" role="toolbar">${e}${i}</div>`:nothing}
        </div>
      </div>`}renderContent(){return this.currentDashboard?this.currentDashboard.widgets.length>0?(this.initializeCurrentDashboard(),html`
          <div
            class="dashboard-grid"
            style=${styleMap({"--columns":this.columns})}
            @dragend=${this.handleDragEnd}
            @dragover=${this.handleDragOver}
            @dragstart=${this.handleDragStart}
          >
            ${repeat(this.currentDashboard.widgetPositions[this.columns],(t=>t.identifier),(t=>html`
              <div
                class="dashboard-item"
                style=${styleMap({"--col-start":t.x+1,"--col-span":t.width,"--row-start":t.y+1,"--row-span":t.height,"view-transition-name":"dashboard-item-"+t.identifier})}
                draggable="true"
                data-widget-hash=${t.identifier}
                data-widget-key=${this.widgetByIdentifier(t.identifier)?.type}
                data-widget-identifier=${t.identifier}
                @widgetRefresh="${()=>this.handleLegacyWidgetRefreshEvent(t)}"
              >
                <typo3-dashboard-widget .identifier=${t.identifier}></typo3-dashboard-widget>
              </div>
            `))}
          </div>
        `):html`
        <div class="dashboard-empty">
          <div class="dashboard-empty-content">
            <h3>${lll("dashboard.empty.content.title")}</h3>
            <p>${lll("dashboard.empty.content.description")}</p>
            <button
              title=${lll("widget.add")}
              class="btn dashboard-button"
              @click=${()=>{this.addWidget()}}
            >
              <span class="dashboard-button-icon"><typo3-backend-icon identifier="actions-plus" size="small"></typo3-backend-icon></span>
              <span class="dashboard-button-text">${lll("dashboard.empty.content.button")}</span>
            </button>
          </div>
        </div>
        `:html`${nothing}`}renderFooter(){return null!==this.currentDashboard?html`
        <div class="dashboard-add-item">
          <button
            class="btn btn-primary btn-dashboard-add"
            style="view-transition-name: dashboard-add-item"
            title=${lll("widget.addToDashboard",this.currentDashboard.title)}
            @click=${()=>{this.addWidget()}}
          >
            <typo3-backend-icon identifier="actions-plus" size="small"></typo3-backend-icon>
            <span class="visually-hidden">${lll("widget.addToDashboard",this.currentDashboard.title)}</span>
          </button>
        </div>
        `:html`${nothing}`}getGridItemByIdentifier(t){return this.querySelector('.dashboard-item[data-widget-identifier="'+t+'"]')??null}handleDragStart(t){const e=t.target,i=e.classList.contains("dashboard-item"),a=null!==document.elementFromPoint(t.clientX,t.clientY).closest(".widget-header");if(!i||!a)return void t.preventDefault();const s=e.dataset.widgetIdentifier,d=this.getGridItemByIdentifier(s),n=this.widgetPositionByIdentifier(s),o=d.getBoundingClientRect();this.dragInformation={identifier:s,element:d,height:n.height,width:n.width,offsetY:t.clientY-o.top,offsetX:t.clientX-o.left,currentY:n.y,currentX:n.x,initialPositions:this.currentDashboard.widgetPositions[this.columns].map((t=>({...t})))},t.dataTransfer.setData("text/plain",""),t.dataTransfer.effectAllowed="move",this.dragInformation.element.style.opacity="0.5"}handleDragEnd(){this.dragInformation&&(this.dragInformation.element.style.opacity="",this.dragInformation=null,this.widgetPositionsSort(this.currentDashboard.widgetPositions[this.columns]),top.document.dispatchEvent(new CustomEvent(DashboardActionEvent.dashboardUpdate,{detail:{identifier:this.currentDashboard.identifier,widgets:this.currentDashboard.widgets,widgetPositions:this.currentDashboard.widgetPositions}})),this.skipCurrentViewTransition())}handleDragOver(t){if(this.dragInformation){t.preventDefault(),t.dataTransfer.dropEffect="move";const e=this.querySelector(".dashboard-grid"),i=e.getBoundingClientRect(),a=parseInt(getComputedStyle(e).gap,10),s=parseInt(getComputedStyle(e).gridAutoRows,10)+a,d=(i.width+a)/this.columns,n=Math.max(0,t.clientY-i.top-this.dragInformation.offsetY),o=Math.max(0,t.clientX-i.left-this.dragInformation.offsetX),r=Math.max(0,Math.round(n/s)),l=Math.max(0,Math.min(Math.round(o/d),this.columns-this.dragInformation.width));this.dragInformation.currentY===r&&this.dragInformation.currentX===l||(this.dragInformation.currentY=r,this.dragInformation.currentX=l,this.dragOverTimeout&&clearTimeout(this.dragOverTimeout),this.dragOverTimeout=window.setTimeout((()=>{if(this.skipCurrentViewTransition(),this.dragInformation){const t=this.widgetPositionByIdentifier(this.dragInformation.identifier);t.y=this.dragInformation.currentY,t.x=this.dragInformation.currentX,this.widgetPositionChange(this.currentDashboard.widgetPositions[this.columns],t)}}),100))}}initializeCurrentDashboard(){this.currentDashboard.widgetPositions=this.currentDashboard.widgetPositions??{};let t=this.currentDashboard.widgetPositions?.[this.columns]??[];const e={small:1,medium:2,large:4},i={small:1,medium:2,large:3};this.currentDashboard.widgets.forEach((a=>{if(void 0===t.find((t=>t.identifier===a.identifier))){const s=i[a.height]??1,d=e[a.width]??1,n={identifier:a.identifier,height:s,width:d<this.columns?d:this.columns,y:0,x:0};t.push(n)}})),t=this.widgetPositionsArrange(t),this.widgetPositionsCollapseRows(t),this.currentDashboard.widgetPositions[this.columns]=t}widgetByIdentifier(t){return this.currentDashboard.widgets.find((e=>e.identifier===t))??null}widgetPositionByIdentifier(t){return this.currentDashboard.widgetPositions[this.columns].find((e=>e.identifier===t))??null}widgetPositionCanPlace(t,e,i,a){return!(e<0||e>this.columns-t.width||i<0)&&a.isDisjointFrom(createSet({...t,x:e,y:i}))}widgetPositionChange(t,e){let i=structuredClone(this.dragInformation?.initialPositions??t);const a=i.findIndex((t=>t.identifier===e.identifier));let s;if(a>-1){const[t]=i.splice(a,1);s={...t},t.y=e.y,t.x=e.x,i.unshift(t)}i=this.widgetPositionsArrange(i,this.dragInformation?.initialPositions??t,s),t.forEach((t=>{const e=i.find((e=>e.identifier===t.identifier));t.y=e.y,t.x=e.x})),this.widgetPositionsCollapseRows(t),this.useViewTransition=!0,this.requestUpdate()}widgetTryPlacementInNeighbourCells(t,e,i){const a=this.columns;for(let i=t.x;i>=Math.max(0,t.x-t.width);i--)if(this.widgetPositionCanPlace(t,i,t.y,e))return{...t,x:i};for(let i=t.y;i>=0;i--)if(this.widgetPositionCanPlace(t,t.x,i,e))return{...t,y:i};for(let i=t.x;i<=Math.min(a,t.x+t.width);i++)if(this.widgetPositionCanPlace(t,i,t.y,e))return{...t,x:i};for(let a=t.y;a<=t.y+(i?.height??3);a++)if(this.widgetPositionCanPlace(t,t.x,a,e))return{...t,y:a};return null}widgetPositionsArrange(t,e,i){let a=new Set;const s=t=>this.widgetPositionCanPlace(t,t.x,t.y,a)?{...t}:null,d=t=>void 0===e?null:this.widgetTryPlacementInNeighbourCells(t,e.reduce(((t,e)=>t.union(createSet(e))),new Set).difference(createSet(i)).union(a),i),n=t=>this.widgetTryPlacementInNeighbourCells(t,a),o=t=>{const e=Math.max(0,t.y),i=Math.max(0,Math.min(this.columns-t.width,t.x)),s=Math.max(0,i),d=this.columns;for(let i=t.y;i<e+100;i++)for(let e=s;e<d;e++)if(this.widgetPositionCanPlace(t,e,i,a))return{...t,x:e,y:i};throw new Error("Logic error: could not occupy cells")};return t.map((t=>{return e=s(t)??d(t)??n(t)??o(t),a=a.union(createSet(e)),e;var e}))}widgetPositionsCollapseRows(t){const e=new Set;t.forEach((t=>{for(let i=0;i<t.height;i++)e.add(t.y+i)}));const i=Array.from(e).sort(((t,e)=>t-e)),a={};let s=0;for(let t=0;t<=Math.max(...i);t++)e.has(t)&&(a[t]=s++);t.forEach((t=>{t.y=a[t.y]}))}widgetPositionsSort(t){t.sort(((t,e)=>t.y!==e.y?t.y-e.y:t.x-e.x))}};__decorate([state()],Dashboard.prototype,"loading",void 0),__decorate([state()],Dashboard.prototype,"dashboards",void 0),__decorate([state()],Dashboard.prototype,"currentDashboard",void 0),__decorate([state()],Dashboard.prototype,"columns",void 0),__decorate([state()],Dashboard.prototype,"dragInformation",void 0),Dashboard=__decorate([customElement("typo3-dashboard")],Dashboard);export{Dashboard};let DashboardWidget=class extends LitElement{constructor(){super(...arguments),this.moving=!1,this.triggerContentRenderedEvent=!1,this.fetchTask=new Task(this,{args:()=>[this.identifier],task:async([t],{signal:e})=>{const i=TYPO3.settings.ajaxUrls.dashboard_widget_get,a=await new AjaxRequest(i).withQueryArguments({widget:t}).get({signal:e});return await a.resolve()},onComplete:async()=>{this.triggerContentRenderedEvent=!0},onError:t=>{t instanceof AjaxResponse?Notification.error("",t.response.status+" "+t.response.statusText,5):Notification.error("",`Error while retrieving widget [${this.identifier}] content: ${t.message}`)}})}get widget(){return this.fetchTask.value??null}refresh(){this.handleRefresh()}createRenderRoot(){return this}updated(){if(this.triggerContentRenderedEvent){this.triggerContentRenderedEvent=!1;const t={bubbles:!0};this.dispatchEvent(new CustomEvent(DashboardActionEvent.widgetContentRendered,{...t,detail:this.widget.eventdata})),this.dispatchEvent(new CustomEvent("widgetContentRendered",{...t,detail:this.widget.eventdata}))}}render(){const t=html`
      <div class="widget-loader">
          <typo3-backend-icon identifier="spinner-circle" size="medium"></typo3-backend-icon>
      </div>
    `,e=(t,e=!1)=>html`
        <div class="widget-header">
          <div class="widget-title">${(t=>t?.label||"ERROR")(t)}</div>
          <div class="widget-actions">
            ${t.options?.refreshAvailable?html`
                <button
                  type="button"
                  title=${lll("widget.refresh")}
                  class="widget-action widget-action-refresh"
                  @click=${this.handleRefresh}
                >
                  ${e?html`<typo3-backend-spinner size="small"></typo3-backend-spinner>`:html`<typo3-backend-icon identifier="actions-refresh" size="small"></typo3-backend-icon>`}
                  <span class="visually-hidden">${lll("widget.refresh")}</span>
                </button>
                `:nothing}
            <button
              type="button"
              title=${lll("widget.move")}
              class="widget-action widget-action-move"
              @click=${this.handleMoveClick}
              @focusout=${this.handleMoveFocusOut}
              @keydown=${this.handleMoveKeyDown}
            >
              <typo3-backend-icon identifier=${this.moving?"actions-thumbtack":"actions-move"} size="small"></typo3-backend-icon>
              <span class="visually-hidden">${lll("widget.move")}</span>
            </button>
            <button
              type="button"
              title=${lll("widget.remove")}
              class="widget-action widget-action-remove"
              @click=${this.handleRemove}
            >
              <typo3-backend-icon identifier="actions-delete" size="small"></typo3-backend-icon>
              <span class="visually-hidden">${lll("widget.remove")}</span>
            </button>
          </div>
        </div>
        <div class="widget-content">${(t=>t?unsafeHTML(t.content):html`<div class="widget-content-main">${lll("widget.error")}</div>`)(t)}</div>
      `,i=this.fetchTask.render({initial:()=>nothing,error:()=>e(null),pending:()=>this.fetchTask.value?e(this.fetchTask.value,!0):delay(80,(()=>t)),complete:t=>e(t)});return html`<div class="widget ${this.moving?" widget-selected":""}">${i}</div>`}moveStart(){!1===this.moving&&(this.moving=!0,top.document.dispatchEvent(new CustomEvent(DashboardActionEvent.widgetMoveIntend,{detail:{identifier:this.widget.identifier,intend:DashboardWidgetMoveIntend.start},bubbles:!0,composed:!0})))}moveEnd(){!0===this.moving&&(this.moving=!1,top.document.dispatchEvent(new CustomEvent(DashboardActionEvent.widgetMoveIntend,{detail:{identifier:this.widget.identifier,intend:DashboardWidgetMoveIntend.end},bubbles:!0,composed:!0})))}handleMoveClick(){this.moving?this.moveEnd():this.moveStart()}handleMoveFocusOut(){this.moveEnd()}handleMoveKeyDown(t){if(!this.moving)return;if(!["ArrowDown","ArrowUp","ArrowLeft","ArrowRight","Home","End","Enter","Space","Escape","Tab"].includes(t.code)||t.altKey||t.ctrlKey)return;t.preventDefault(),t.stopPropagation();let e=DashboardWidgetMoveIntend.end;switch(t.code){case"Escape":case"Enter":case"Space":return void this.moveEnd();case"ArrowUp":e=DashboardWidgetMoveIntend.up;break;case"ArrowDown":e=DashboardWidgetMoveIntend.down;break;case"ArrowLeft":e=DashboardWidgetMoveIntend.left;break;case"ArrowRight":e=DashboardWidgetMoveIntend.right;break;default:return}top.document.dispatchEvent(new CustomEvent(DashboardActionEvent.widgetMoveIntend,{detail:{identifier:this.widget.identifier,intend:e},bubbles:!0,composed:!0}))}async handleRefresh(){this.fetchTask.run()}handleRemove(t){const e=Modal.confirm(lll("widget.remove.confirm.title"),lll("widget.remove.confirm.message"),SeverityEnum.warning,[{text:lll("widget.remove.button.close"),active:!0,btnClass:"btn-default",name:"cancel"},{text:lll("widget.remove.button.ok"),btnClass:"btn-warning",name:"delete"}]);e.addEventListener("button.clicked",(t=>{if("delete"===t.target.getAttribute("name")){const t={widget:this.identifier};top.document.dispatchEvent(new CustomEvent(DashboardActionEvent.widgetRemove,{detail:t}))}e.hideModal()}));const i=t.currentTarget;e.addEventListener("typo3-modal-hide",(()=>{i?.focus()}))}};__decorate([property({type:String,reflect:!0})],DashboardWidget.prototype,"identifier",void 0),__decorate([state()],DashboardWidget.prototype,"moving",void 0),DashboardWidget=__decorate([customElement("typo3-dashboard-widget")],DashboardWidget);export{DashboardWidget};