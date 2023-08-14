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
var __decorate=function(e,t,r,o){var n,i=arguments.length,p=i<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,r):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)p=Reflect.decorate(e,t,r,o);else for(var l=e.length-1;l>=0;l--)(n=e[l])&&(p=(i<3?n(p):i>3?n(t,r,p):n(t,r))||p);return i>3&&p&&Object.defineProperty(t,r,p),p};import{html,LitElement,nothing}from"lit";import{customElement,property}from"lit/decorators.js";import{unsafeHTML}from"lit/directives/unsafe-html.js";import{until}from"lit/directives/until.js";import{Sizes,States,MarkupIdentifiers}from"@typo3/backend/enum/icon-types.js";import Icons,{IconStyles}from"@typo3/backend/icons.js";import"@typo3/backend/element/spinner-element.js";let IconElement=class extends LitElement{constructor(){super(...arguments),this.inline=!1,this.size=Sizes.default,this.state=States.default,this.overlay=null,this.markup=MarkupIdentifiers.inline,this.raw=null}render(){if(this.raw)return html`${unsafeHTML(this.raw)}`;if(!this.identifier)return nothing;const e=Icons.getIcon(this.identifier,this.size,this.overlay,this.state,this.markup).then((e=>html`${unsafeHTML(e)}`)),t=document.createElement("typo3-backend-spinner");return t.size=this.size,html`${until(e,html`${t}`)}`}};IconElement.styles=IconStyles.getStyles(),__decorate([property({type:String})],IconElement.prototype,"identifier",void 0),__decorate([property({type:Boolean,reflect:!0})],IconElement.prototype,"inline",void 0),__decorate([property({type:String,reflect:!0})],IconElement.prototype,"size",void 0),__decorate([property({type:String})],IconElement.prototype,"state",void 0),__decorate([property({type:String})],IconElement.prototype,"overlay",void 0),__decorate([property({type:String})],IconElement.prototype,"markup",void 0),__decorate([property({type:String})],IconElement.prototype,"raw",void 0),IconElement=__decorate([customElement("typo3-backend-icon")],IconElement);export{IconElement};