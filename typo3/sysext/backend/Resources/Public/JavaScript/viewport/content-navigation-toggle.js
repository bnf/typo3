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
import{html as p,nothing as d}from"lit";import{property as h,state as f,customElement as g}from"lit/decorators.js";import{consume as x}from"@lit/context";import{contentNavigationContext as m}from"@typo3/backend/context/content-navigation.js";import{PseudoButtonLitElement as b}from"@typo3/backend/element/pseudo-button.js";import"@typo3/backend/element/icon-element.js";var u=function(o,t,i,l){var r=arguments.length,e=r<3?t:l===null?l=Object.getOwnPropertyDescriptor(t,i):l,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")e=Reflect.decorate(o,t,i,l);else for(var c=o.length-1;c>=0;c--)(s=o[c])&&(e=(r<3?s(e):r>3?s(t,i,e):s(t,i))||e);return r>3&&e&&Object.defineProperty(t,i,e),e},n;(function(o){o.collapse="collapse",o.expand="expand"})(n||(n={}));let a=class extends b{render(){if(!this.action)return console.error('<typo3-backend-content-navigation-toggle> requires an "action" attribute (collapsed or expanded)'),p`nothing`;if(this.updateVisibility(),!this.context)return p`${d}`;const t=this.action===n.collapse?"actions-panel-collapse-start":"actions-panel-expand-start";return p`<typo3-backend-icon identifier=${t} size=small></typo3-backend-icon>`}buttonActivated(){this.context.toggle()}shouldBeVisible(){return!this.context||!this.action?!1:this.action===n.collapse?this.context.shouldShowCollapseButton:this.context.shouldShowExpandButton}updateVisibility(){this.hidden=!this.shouldBeVisible(),this.updateTitle()}updateTitle(){this.context&&(this.title=this.action===n.collapse?this.context.navigationLabelCollapse:this.context.navigationLabelExpand)}};u([h({type:String})],a.prototype,"action",void 0),u([x({context:m,subscribe:!0}),f()],a.prototype,"context",void 0),a=u([g("typo3-backend-content-navigation-toggle")],a);export{a as ContentNavigationToggle,n as ContentNavigationToggleActionEnum};
