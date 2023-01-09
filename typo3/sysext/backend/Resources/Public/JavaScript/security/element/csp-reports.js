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
var __decorate=function(t,e,r,o){var s,i=arguments.length,p=i<3?e:null===o?o=Object.getOwnPropertyDescriptor(e,r):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)p=Reflect.decorate(t,e,r,o);else for(var l=t.length-1;l>=0;l--)(s=t[l])&&(p=(i<3?s(p):i>3?s(e,r,p):s(e,r))||p);return i>3&&p&&Object.defineProperty(e,r,p),p};import{customElement,property,state}from"lit/decorators.js";import{html,LitElement,nothing}from"lit";import{classMap}from"lit/directives/class-map.js";import AjaxRequest from"@typo3/core/ajax/ajax-request.js";let CspReports=class extends LitElement{constructor(){super(...arguments),this.reports=[],this.report=null}createRenderRoot(){return this}connectedCallback(){super.connectedCallback(),this.fetchReports().then((t=>this.reports=t))}render(){return html`
      <style>
        .details { background: #eee; padding: 0.5em }
      </style>
      <div class="row">
        <div class=${classMap({"col-12":!this.report,"col-9":!!this.report})}>
          <table class="table table-striped">
            <thead>
            <tr>
              <th>Date</th>
              <th>Violation</th>
              <th>...</th>
            </tr>
            </thead>
            <tbody>
            ${this.reports.map((t=>html`
            <tr class=${classMap({"table-info":this.report===t})} @click=${()=>this.selectReport(t)}>
              <td>${t.timestamp}</td>
              <td>${t.details.violatedDirective}</td>
              <td>${t.scope}</td>
            </tr>
          `))}
            </tbody>
          </table>
        </div>
        ${this.report?html`
          <div class="col-3 details">
            <h5>Disposition</h5>
            <p>${this.report.details.disposition}</p>
            <h5>Directive</h5>
            <p>${this.report.details.violatedDirective} (${this.report.details.effectiveDirective})</p>
            <h5>Blocked URI</h5>
            <p>${this.report.details.blockedUri}</p>
            <h5>Document URI</h5>
            <p>
              ${this.report.details.documentUri}
              ${this.report.details.lineNumber?html`
                (${this.report.details.lineNumber}:${this.report.details.columnNumber})
              `:nothing}</p>
            ${this.report.details.scriptSample?html`
              <h5>Sample</h5>
              <code><pre>${this.report.details.scriptSample}</pre></code>
            `:nothing}

            <button class="col-3 btn btn-warning">deny</button>
            <button class="col-3 btn btn-primary">allow</button>
          </div>
        `:nothing}
      </div>
    `}selectReport(t){this.report=t=this.report!==t?t:null}fetchReports(){return new AjaxRequest(this.controlUri).post({action:"fetch"}).then((t=>t.resolve("application/json")))}};__decorate([property({type:String})],CspReports.prototype,"controlUri",void 0),__decorate([state()],CspReports.prototype,"reports",void 0),__decorate([state()],CspReports.prototype,"report",void 0),CspReports=__decorate([customElement("typo3-backend-security-csp-reports")],CspReports);export{CspReports};