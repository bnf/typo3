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
define(["lit","lit/decorators","../Enum/IconTypes"],(function(t,e,i){"use strict";var r,o=this&&this.__decorate||function(t,e,i,r){var o,s=arguments.length,n=s<3?e:null===r?r=Object.getOwnPropertyDescriptor(e,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(t,e,i,r);else for(var a=t.length-1;a>=0;a--)(o=t[a])&&(n=(s<3?o(n):s>3?o(e,i,n):o(e,i))||n);return s>3&&n&&Object.defineProperty(e,i,n),n};!function(t){t.light="light",t.dark="dark"}(r||(r={}));let s=class extends t.LitElement{constructor(){super(...arguments),this.size=i.Sizes.default,this.variant=r.dark}render(){return t.html`
      <div class="icon">
        <svg viewBox="0 0 16 16">
          <path d="M8 15c-3.86 0-7-3.141-7-7 0-3.86 3.14-7 7-7 3.859 0 7 3.14 7 7 0 3.859-3.141 7-7 7zM8 3C5.243 3 3 5.243 3 8s2.243 5 5 5 5-2.243 5-5 -2.243-5-5-5z" opacity=".3"/>
          <path d="M14 9a1 1 0 0 1-1-1c0-2.757-2.243-5-5-5a1 1 0 0 1 0-2c3.859 0 7 3.14 7 7a1 1 0 0 1-1 1z" transform-origin="center center">
            <animateTransform attributeName="transform" attributeType="XML" type="rotate" from="0" to="360" begin="0s" dur="1s" repeatCount="indefinite" />
          </path>
        </svg>
      </div>
    `}};return s.styles=t.css`
    :host {
      display: flex;
      width: 1em;
      height: 1em;
      line-height: 0;
    }
    .icon {
      position: relative;
      display: block;
      height: 1em;
      width: 1em;
      line-height: 1;
    }
    svg {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: block;
      height: 1em;
      width: 1em;
      transform: translate3d(0, 0, 0);
      fill: currentColor;
    }
    :host([variant=dark]) svg {
      fill: #212121;
    }
    :host([variant=light]) svg {
      fill: #fff;
    }
    :host([size=small]) {
      font-size: 16px;
    }
    :host([size=default]) {
      font-size: 32px;
    }
    :host([size=large]) {
      font-size: 48px;
    }
    :host([size=mega]) {
      font-size: 64px;
    }
  `,o([e.property({type:String})],s.prototype,"size",void 0),o([e.property({type:String})],s.prototype,"variant",void 0),s=o([e.customElement("typo3-backend-spinner")],s),{SpinnerElement:s}}));