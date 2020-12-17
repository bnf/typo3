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
var __decorate=this&&this.__decorate||function(e,t,i,n){var o,r=arguments.length,s=r<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,n);else for(var a=e.length-1;a>=0;a--)(o=e[a])&&(s=(r<3?o(s):r>3?o(t,i,s):o(t,i))||s);return r>3&&s&&Object.defineProperty(t,i,s),s};define(["require","exports","lit-element","lit-html/directives/unsafe-html","lit-html/directives/until","../Icons","../IconEnums","TYPO3/CMS/Backend/Element/SpinnerElement"],(function(e,t,i,n,o,r,s){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.IconElement=void 0;let a=class extends i.LitElement{constructor(){super(...arguments),this.size=s.Sizes.default,this.state=s.States.default}static get styles(){const e=(e,t)=>i.css`
      .icon-size-${e} {
        height: ${t}px;
        width: ${t}px;
        line-height: ${t}px;
      }
      :host([size=${e}]) .icon {
        height: ${t}px;
        width: ${t}px;
        line-height: ${t}px;
      }

      :host([size=${e}]) .icon-unify {
        line-height: ${t}px;
        font-size: ${Math.ceil(.86*t)}px;
      }

      :host([size=${e}]) .icon-overlay .icon-unify {
        line-height: ${Math.ceil(t/1.6)}px;
        font-size: ${Math.ceil(.86*Math.ceil(t/1.6))}px;
      }
    `;return[i.css`
        :host {
          display: inline-block;
        }

        typo3-backend-spinner,
        .icon {
          position: relative;
          display: inline-block;
          overflow: hidden;
          white-space: nowrap;
          height: 1em;
          width: 1em;
          vertical-align: -22%;
        }

        .icon svg,
        .icon img {
          display: block;
          height: 100%;
          width: 100%;
          transform: translate3d(0, 0, 0);
        }

        .icon * {
          display: block;
          line-height: inherit;
        }

        .icon-markup {
          position: absolute;
          display: block;
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
          height: 68.75%;
          width: 68.75%;
          text-align: center;
        }

        .icon-color {
          fill: currentColor;
        }

        //
        // Icon Animation
        //
        .icon-spin .icon-markup {
          -webkit-animation: icon-spin 2s infinite linear;
          animation: icon-spin 2s infinite linear;
        }

        @-webkit-keyframes icon-spin {
          0% {
            -webkit-transform: rotate(0deg);
                    transform: rotate(0deg);
            }

          100% {
            -webkit-transform: rotate(360deg);
            transform: rotate(360deg);
          }
        }

        @keyframes icon-spin {
          0% {
            -webkit-transform: rotate(0deg);
            transform: rotate(0deg);
          }

          100% {
            -webkit-transform: rotate(360deg);
            transform: rotate(360deg);
          }
        }
      `,e(i.unsafeCSS(s.Sizes.small),16),e(i.unsafeCSS(s.Sizes.default),32),e(i.unsafeCSS(s.Sizes.large),48),e(i.unsafeCSS(s.Sizes.overlay),64)]}render(){if(!this.identifier)return i.html``;const e=r.getIcon(this.identifier,this.size,null,this.state).then(e=>i.html`${n.unsafeHTML(e)}`);return i.html`${o.until(e,i.html`<typo3-backend-spinner size="${"default"===this.size?"medium":this.size}"></typo3-backend-spinner>`)}`}};__decorate([i.property({type:String})],a.prototype,"identifier",void 0),__decorate([i.property({type:String})],a.prototype,"size",void 0),__decorate([i.property({type:String})],a.prototype,"state",void 0),a=__decorate([i.customElement("typo3-backend-icon")],a),t.IconElement=a}));