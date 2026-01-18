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
import{property as s}from"lit/decorators.js";import{LitElement as a,css as d,html as v}from"lit";import{KeyTypesEnum as u}from"@typo3/backend/enum/key-types.js";var c=function(n,t,r,o){var i=arguments.length,e=i<3?t:o===null?o=Object.getOwnPropertyDescriptor(t,r):o,p;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")e=Reflect.decorate(n,t,r,o);else for(var l=n.length-1;l>=0;l--)(p=n[l])&&(e=(i<3?p(e):i>3?p(t,r,e):p(t,r))||e);return i>3&&e&&Object.defineProperty(t,r,e),e};class f extends a{static styles=[d`:host{cursor:pointer;appearance:button}`];role="button";tabIndex=0;constructor(){super(),this.addEventListener("click",t=>{t.preventDefault(),this.buttonActivated(t)}),this.addEventListener("keydown",t=>{t.key===u.SPACE&&t.preventDefault(),t.key===u.ENTER&&(t.preventDefault(),this.buttonActivated(t))}),this.addEventListener("keyup",t=>{t.key===u.SPACE&&(t.preventDefault(),this.buttonActivated(t))})}render(){return v`<slot></slot>`}}c([s({type:String,reflect:!0})],f.prototype,"role",void 0),c([s({type:String,reflect:!0})],f.prototype,"tabIndex",void 0);export{f as PseudoButtonLitElement};
