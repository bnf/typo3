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
define(["lit","lit/decorators","lit/directives/unsafe-html","lit/directives/until","../Enum/IconTypes","../Icons","TYPO3/CMS/Backend/Element/SpinnerElement"],(function(e,t,i,n,o,r){"use strict";var s=this&&this.__decorate||function(e,t,i,n){var o,r=arguments.length,s=r<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,n);else for(var a=e.length-1;a>=0;a--)(o=e[a])&&(s=(r<3?o(s):r>3?o(t,i,s):o(t,i))||s);return r>3&&s&&Object.defineProperty(t,i,s),s};const a=(t,i)=>e.css`
  :host([size=${t}]),
  :host([raw]) .icon-size-${t} {
    font-size: ${i}px;
  }
`;let l=class extends e.LitElement{constructor(){super(...arguments),this.size=o.Sizes.default,this.state=o.States.default,this.overlay=null,this.markup=o.MarkupIdentifiers.inline,this.raw=null}render(){if(this.raw)return e.html`${i.unsafeHTML(this.raw)}`;if(!this.identifier)return e.html``;const t=r.getIcon(this.identifier,this.size,this.overlay,this.state,this.markup).then(t=>e.html`
          ${i.unsafeHTML(t)}
        `);return e.html`${n.until(t,e.html`<typo3-backend-spinner></typo3-backend-spinner>`)}`}};return l.styles=[e.css`
      :host {
        display: flex;
        width: 1em;
        height: 1em;
        line-height: 0;
      }

      .icon {
        position: relative;
        display: block;
        overflow: hidden;
        white-space: nowrap;
        height: 1em;
        width: 1em;
        line-height: 1;
      }

      .icon svg,
      .icon img {
        display: block;
        height: 1em;
        width: 1em;
        transform: translate3d(0, 0, 0);
      }

      .icon * {
        display: block;
        line-height: inherit;
      }

      .icon-markup {
        position: absolute;
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
      }

      .icon-overlay {
        position: absolute;
        bottom: 0;
        right: 0;
        font-size: 0.6875em;
        text-align: center;
      }

      .icon-color {
        fill: currentColor;
      }

      .icon-state-disabled .icon-markup {
        opacity: .5;
      }

      .icon-unify {
        font-size: ${.86}em;
        line-height: ${1/.86};
      }

      .icon-spin .icon-markup {
        animation: icon-spin 2s infinite linear;
      }

      @keyframes icon-spin {
        0% {
          transform: rotate(0deg);
        }

        100% {
          transform: rotate(360deg);
        }
      }
    `,a(e.unsafeCSS(o.Sizes.small),16),a(e.unsafeCSS(o.Sizes.default),32),a(e.unsafeCSS(o.Sizes.large),48),a(e.unsafeCSS(o.Sizes.mega),64)],s([t.property({type:String})],l.prototype,"identifier",void 0),s([t.property({type:String})],l.prototype,"size",void 0),s([t.property({type:String})],l.prototype,"state",void 0),s([t.property({type:String})],l.prototype,"overlay",void 0),s([t.property({type:String})],l.prototype,"markup",void 0),s([t.property({type:String})],l.prototype,"raw",void 0),l=s([t.customElement("typo3-backend-icon")],l),{IconElement:l}}));