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

import { html, css, LitElement, TemplateResult } from 'lit';
import { classMap } from 'lit/directives/class-map';
import { customElement, state } from 'lit/decorators';
import ThrottleEvent from '@typo3/core/event/throttle-event';

@customElement('typo3-backend-module')
export class ModuleElement extends LitElement {
  static styles = css`
    * {
      box-sizing: border-box;
    }
    :host {
      display: block;
      position: relative;
      flex: 1 0 auto;
      background-color: var(--module-bg);
      color: var(--module-color);
    }
    .docheader {
      position: sticky;
      top: 0;
      inset-inline-start: 0;
      width: 100%;
      display: flex;
      flex-direction: column;
      min-height: var(--module-docheader-height);
      z-index: var(--module-docheader-zindex);
      background-color: var(--module-docheader-bg);
      border-bottom: 1px solid var(--module-docheader-border);
      padding: var(--module-docheader-padding);
      gap: var(--module-docheader-spacing);
      box-sizing: border-box;
      transition: top .3s ease-in-out;
    }
    .docheader-folded {
      top: var(--module-docheader-scroll-offset);
    }
    .docheader-bar {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: baseline;
      gap: var(--module-docheader-spacing);
    }
    .docheader-bar > *:empty {
      //display: none;
    }
    .docheader-bar-navigation {
      //min-height: 30px;
      min-height: var(--module-docheader-bar-height);
    }
    .docheader-bar-navigation > ::slotted(*) {
      //margin-bottom: 4px;
    }
    .docheader-bar-buttons > * {
      gap: var(--module-docheader-spacing);
      min-height: var(--module-docheader-bar-height);
      line-height: var(--module-docheader-bar-height);
    }
    .docheader-bar-buttons-column-left,
    .docheader-bar-buttons-column-right {
      display: flex;
      flex-direction: row;
    }
    .body {
      padding: var(--module-body-padding, 24px);
    }
    .body ::slotted(>:last-child) {
      margin-bottom: 0 !important;
    }
  `;

  @state()
  private folded: boolean = true;

  private scrollEvent: ThrottleEvent;

  private direction: string = 'down';
  private readonly reactionRange: number = 300;
  private lastPosition: number = 0;
  private currentPosition: number = 0;
  private changedPosition: number = 0;

  public connectedCallback(): void {
    super.connectedCallback();

    this.scrollEvent?.release();
    this.scrollEvent = new ThrottleEvent('scroll', (e: Event) => this.onScroll(e), 100);
    this.scrollEvent.bindTo(document);
  }

  public disconnectedCallback(): void {
    super.disconnectedCallback();

    this.scrollEvent?.release();
    this.scrollEvent = null;
  }

  protected render(): TemplateResult {
    const docheaderClasses = {
      'docheader': true,
      'docheader-folded': this.folded,
    };
    return html`
     <slot name="loading-indicator"></slot>

     <div class=${classMap(docheaderClasses)} part="docheader">
       <div class="docheader-bar docheader-bar-navigation" part="docheader-navigation">
         <slot name="docheader"></slot>
       </div>
       <div class="docheader-bar docheader-bar-buttons" part="docheader-buttons">
         <div class="docheader-bar-buttons-column-left" part="docheader-buttons-left">
           <slot name="docheader-button-left"></slot>
         </div>
         <div class="docheader-bar-buttons-column-right" part="docheader-buttons-right">
           <slot name="docheader-button-right"></slot>
         </div>
       </div>
     </div>
     <div class="body" part="body">
       <slot></slot>
     </div>
    `;
  }

  private onScroll(e: Event): void {
    const scrollingElement = ('scrollingElement' in e.target ? e.target.scrollingElement : e.target) as Element;

    this.currentPosition = scrollingElement.scrollTop;
    if (this.currentPosition > this.lastPosition) {
      if (this.direction !== 'down') {
        this.direction = 'down';
        this.changedPosition = this.currentPosition;
      }
    } else if (this.currentPosition < this.lastPosition) {
      if (this.direction !== 'up') {
        this.direction = 'up';
        this.changedPosition = this.currentPosition;
      }
    }
    if (this.direction === 'up' && (this.changedPosition - this.reactionRange) < this.currentPosition) {
      this.folded = false;
    }
    if (this.direction === 'down' && (this.changedPosition + this.reactionRange) < this.currentPosition) {
      this.folded = true;
    }
    this.lastPosition = this.currentPosition;
  }
}
