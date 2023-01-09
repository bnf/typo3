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

import {customElement, property, state} from 'lit/decorators';
import {css, html, LitElement, nothing, TemplateResult} from 'lit';
import {classMap} from 'lit/directives/class-map';
import AjaxRequest from '@typo3/core/ajax/ajax-request';
import {AjaxResponse} from '@typo3/core/ajax/ajax-response';

interface CspReport {
  scope: string;
  timestamp: Date;
  requestId: string;
  details: {
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP#violation_report_syntax
    disposition: 'enforce' | 'report',

    blockedUri: string,
    documentUri: string,
    statusCode: number,
    referrer?: string,

    originalPolicy: string,
    effectiveDirective: string,
    violatedDirective: string,

    scriptSample?: string,
    columnNumber?: number,
    lineNumber?: number,
  };
}

@customElement('typo3-backend-security-csp-reports')
export class CspReports extends LitElement {
  @property({type: String}) controlUri: string;
  @state() reports: CspReport[] = [];
  @state() report: CspReport = null;

  public createRenderRoot(): HTMLElement | ShadowRoot {
    // Avoid shadow DOM for Bootstrap CSS to be applied
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this.fetchReports().then((reports: CspReport[]) => this.reports = reports);
  }

  public render(): TemplateResult {
    return html`
      <style>
        .details { background: #eee; padding: 0.5em }
      </style>
      <div class="row">
        <div class=${classMap({'col-12': !this.report, 'col-9': !!this.report})}>
          <table class="table table-striped">
            <thead>
            <tr>
              <th>Date</th>
              <th>Violation</th>
              <th>...</th>
            </tr>
            </thead>
            <tbody>
            ${this.reports.map((report: CspReport) => html`
            <tr class=${classMap({'table-info': this.report === report})} @click=${() => this.selectReport(report)}>
              <td>${report.timestamp}</td>
              <td>${report.details.violatedDirective}</td>
              <td>${report.scope}</td>
            </tr>
          `)}
            </tbody>
          </table>
        </div>
        ${this.report ? html`
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
              ${this.report.details.lineNumber ? html`
                (${this.report.details.lineNumber}:${this.report.details.columnNumber})
              ` : nothing}</p>
            ${this.report.details.scriptSample ? html`
              <h5>Sample</h5>
              <code><pre>${this.report.details.scriptSample}</pre></code>
            ` : nothing}

            <button class="col-3 btn btn-warning">deny</button>
            <button class="col-3 btn btn-primary">allow</button>
          </div>
        ` : nothing}
      </div>
    `;
  }

  private selectReport(report: CspReport) {
    this.report = report = this.report !== report ? report : null;
  }

  private fetchReports(): Promise<CspReport[]> {
    return (new AjaxRequest(this.controlUri))
      .post({action: 'fetch'})
      .then((response: AjaxResponse) => response.resolve('application/json'));
  }
}
