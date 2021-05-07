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
var __decorate=this&&this.__decorate||function(e,t,a,n){var i,o=arguments.length,s=o<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,a):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,a,n);else for(var d=e.length-1;d>=0;d--)(i=e[d])&&(s=(o<3?i(s):o>3?i(t,a,s):i(t,a))||s);return o>3&&s&&Object.defineProperty(t,a,s),s};define(["require","exports","lit","lit/decorators","lit-html/directives/if-defined","lit/directives/unsafe-html","TYPO3/CMS/Core/Ajax/AjaxRequest","./CardButton","TYPO3/CMS/Backend/Element/IconElement","TYPO3/CMS/Backend/Element/SpinnerElement"],(function(e,t,a,n,i,o,s){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.InstallModule=void 0;let d=class extends a.LitElement{constructor(){super(...arguments),this.standalone=!1,this.cards=null,this.label="Loading cards…",this.iconPath=null,this.error=!1}createRenderRoot(){return this}render(){return a.html`
      <div class="scaffold">
        <div class="scaffold-header t3js-scaffold-header">
            <div class="scaffold-topbar t3js-scaffold-topbar">
                <div class="topbar">
                    <div class="topbar-header t3js-topbar-header" style="padding-left: 0">
                        <div class="topbar-header-site">
                            <a href="" target="_top" title="TYPO3.CMS">
                                <span class="topbar-header-site-logo">
                                    <img src="./sysext/install/Resources/Public/Images/typo3_logo_orange.svg" width="22" height="22" title="TYPO3 Content Management System" alt="">
                                </span>
                                <span class="topbar-header-site-title">
                                    <span class="topbar-header-site-name">Admin tool on site: {siteName}</span>
                                    <span class="topbar-header-site-version">TYPO3 CMS {currentTypo3Version}</span>
                                </span>
                            </a>
                            <button type="button" class="btn btn-default btn-danger pull-right" style="margin-top: 7px; margin-right: 15px;" @click=${()=>this.dispatchEvent(new CustomEvent("install-tool:logout",{bubbles:!0,composed:!0}))}>
                                <typo3-backend-icon identifier="actions-logout" size="small"><typo3-backend-icon>
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="scaffold-modulemenu t3js-scaffold-modulemenu">
            <div class="modulemenu t3js-modulemenu" role="menubar" data-role="modulemenu" id="modulemenu">
                <ul class="modulemenu-group-container">
                    ${this.renderModuleLink("maintenance","Maintenance")}
                    ${this.renderModuleLink("settings","Settings")}
                    ${this.renderModuleLink("upgrade","Upgrade")}
                    ${this.renderModuleLink("environment","Environment")}

                    <li class="modulemenu-group-spacer"></li>
                    <li data-level="1">
                        <a href="index.php"
                            title="Switch to Backend"
                            class="modulemenu-action"
                            role="menuitem"
                            id="backend"
                            data-link="index.php"
                        >
                            <span class="modulemenu-icon" aria-hidden="true"><typo3-backend-icon identifier="modulegroup-web" size="default"></typo3-backend-icon></span>
                            <span class="modulemenu-name">Switch to Backend</span>
                            <span class="modulemenu-indicator" aria-hidden="true"></span>
                        </a>
                    </li>
                    <li data-level="1">
                        <a href="../"
                            title="Switch to Frontend"
                            class="modulemenu-action"
                            role="menuitem"
                            id="frontend"
                        >
                            <span class="modulemenu-icon" aria-hidden="true"><typo3-backend-icon identifier="modulegroup-site" size="default"></typo3-backend-icon></span>
                            <span class="modulemenu-name">Switch to Frontend</span>
                            <span class="modulemenu-indicator" aria-hidden="true"></span>
                        </a>
                    </li>
                </ul>
            </div>
        </div>

        <div class="scaffold-content t3js-scaffold-content">
            <div class="container-fluid" style="padding-top:25px;">
                <div class="t3js-module-body">
                    ${this.renderContent()}
                </div>
            </div>
        </div>
      </div>
    `}renderModuleLink(e,t){return a.html`
      <li data-level="1">
        <a href="install.php?install[controller]=${e}"
          title="${t}"
          class="modulemenu-action"
          role="menuitem"
        >
          <span class="modulemenu-icon" aria-hidden="true"><typo3-backend-icon identifier="module-install-${e}" size="default"></typo3-backend-icon></span>
          <span class="modulemenu-name">${t}</span>
          <span class="modulemenu-indicator" aria-hidden="true"></span>
        </a>
      </li>
    `}renderContent(){return null===this.cards&&new s(this.endpoint).get({cache:"no-cache"}).then(async e=>{const t=await e.resolve();!0===t.success&&"undefined"!==t.cards&&t.cards.length>0?(this.cards=t.cards,this.iconPath=t.iconPath,this.label=t.label,this.error=!1):this.error=!0},e=>{this.error=!0,this.dispatchEvent(new CustomEvent("install-tool:ajax-error",{composed:!0,bubbles:!0,detail:{error:e}}))}),this.error?a.html`
        <div class="t3js-infobox callout callout-sm callout-error">
          <h4 class="callout-title">Something went wrong</h4>
        </div>
      `:null===this.cards?a.html`
        <div class="ui-block">
          <typo3-backend-spinner size="large" class="mx-auto"></typo3-backend-spinner>
          <h2 t3js-ui-block-detail">Loading cards</h2>
        </div>
      `:a.html`
      <h1>${this.label}</h1>
      <div class="card-container">
        ${this.renderCards(this.cards||[])}
      </div>
    `}renderCards(e){return e.map(e=>a.html`
      <div class="card card-size-fixed-small ${"disabled"in e&&e.disabled?"card-disabled":""}">
        <div class="card-header">
          ${e.icon?a.html`
            <div class="card-icon">
              <img src="${this.iconPath}/${e.icon}.svg" width="64" height="64" class="card-header-icon-image" />
            </div>
          `:a.nothing}
          <div class="card-header-body">
            <h1 class="card-title">${e.title}</h1>
            <span class="card-subtitle">${e.subtitle}</span>
          </div>
        </div>
        <div class="card-content">
          <p class="card-text">${o.unsafeHTML(e.description)}</p>
        </div>
        <div class="card-footer">
          ${"disabled"in e&&e.disabled?a.html`${o.unsafeHTML(e.disabledInfo)}`:a.html`
            <typo3-install-card-button
              label="${e.button.label}"
              inline="${i.ifDefined(e.button.inline)}"
              module="TYPO3/CMS/Install/Module/${e.button.module}"
              modal-title="${e.title}"
              modal-size="${i.ifDefined(e.button.modalSize)}"
            ></typo3-install-card-button>
          `}
        </div>
      </div>
    `)}};__decorate([n.property({type:String})],d.prototype,"siteName",void 0),__decorate([n.property({type:String})],d.prototype,"currentTypo3Version",void 0),__decorate([n.property({type:String})],d.prototype,"bust",void 0),__decorate([n.property({type:String})],d.prototype,"basepath",void 0),__decorate([n.property({type:String})],d.prototype,"endpoint",void 0),__decorate([n.property({type:Boolean})],d.prototype,"standalone",void 0),__decorate([n.state()],d.prototype,"cards",void 0),__decorate([n.state()],d.prototype,"label",void 0),__decorate([n.state()],d.prototype,"iconPath",void 0),__decorate([n.state()],d.prototype,"error",void 0),d=__decorate([n.customElement("typo3-admin-tool-app")],d),t.InstallModule=d}));