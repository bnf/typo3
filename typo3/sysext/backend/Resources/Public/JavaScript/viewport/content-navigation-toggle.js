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
import{html as p,nothing as u}from"lit";import{property as d,state as f,customElement as x}from"lit/decorators.js";import{consume as g}from"@lit/context";import{contentNavigationContext as m}from"@typo3/backend/context/content-navigation.js";import{PseudoButtonLitElement as b}from"@typo3/backend/element/pseudo-button.js";import"@typo3/backend/element/icon-element.js";var h=function(n,t,i,s){var c=arguments.length,e=c<3?t:s===null?s=Object.getOwnPropertyDescriptor(t,i):s,l;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")e=Reflect.decorate(n,t,i,s);else for(var r=n.length-1;r>=0;r--)(l=n[r])&&(e=(c<3?l(e):c>3?l(t,i,e):l(t,i))||e);return c>3&&e&&Object.defineProperty(t,i,e),e},o;(function(n){n.collapse="collapse",n.expand="expand"})(o||(o={}));let a=class extends b{render(){if(!this.action)return console.error('<typo3-backend-content-navigation-toggle> requires an "action" attribute (collapsed or expanded)'),p`nothing`;if(this.updateVisibility(),!this.context)return p`${u}`;const t=this.action===o.collapse?"actions-panel-collapse-start":"actions-panel-expand-start";return p`<typo3-backend-icon identifier=${t} size=small></typo3-backend-icon>`}updated(t){t.has("context")&&!this.hidden&&(this.context.focusTarget==="navigation"&&this.action===o.collapse||this.context.focusTarget==="content"&&this.action===o.expand)&&this.focus()}buttonActivated(){this.context.toggle()}shouldBeVisible(){return!this.context||!this.action?!1:this.action===o.collapse?this.context.shouldShowCollapseButton:this.context.shouldShowExpandButton}updateVisibility(){this.hidden=!this.shouldBeVisible(),this.updateTitle()}updateTitle(){this.context&&(this.title=this.action===o.collapse?this.context.navigationLabelCollapse:this.context.navigationLabelExpand)}};h([d({type:String})],a.prototype,"action",void 0),h([g({context:m,subscribe:!0}),f()],a.prototype,"context",void 0),a=h([x("typo3-backend-content-navigation-toggle")],a);export{a as ContentNavigationToggle,o as ContentNavigationToggleActionEnum};
