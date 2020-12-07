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
define(["bootstrap","TYPO3/CMS/Core/DocumentService"],(function(e,t){"use strict";class o{static applyAttributes(e,t){for(const[o,n]of Object.entries(e))t.setAttribute(o,n)}constructor(){t.ready().then(()=>{this.initialize('[data-bs-toggle="tooltip"]')})}initialize(t,o={}){0===Object.entries(o).length&&(o={container:"body",trigger:"hover",delay:{show:500,hide:100}});const n=document.querySelectorAll(t);for(const t of n)e.Tooltip.getOrCreateInstance(t,o)}show(t,n){const s={"data-bs-placement":"auto",title:n};if(t instanceof NodeList||t instanceof HTMLElement){if(t instanceof NodeList)for(const n of t)o.applyAttributes(s,n),e.Tooltip.getInstance(n).show();else if(t instanceof HTMLElement)return o.applyAttributes(s,t),void e.Tooltip.getInstance(t).show()}else{console.warn("Passing an jQuery object to Tooltip.show() has been marked as deprecated. Either pass a NodeList or an HTMLElement.");for(const[e,o]of Object.entries(s))t.attr(e,o);t.tooltip("show")}}hide(t){if(!(t instanceof NodeList||t instanceof HTMLElement))return console.warn("Passing an jQuery object to Tooltip.hide() has been marked as deprecated. Either pass a NodeList or an HTMLElement."),void t.tooltip("hide");if(t instanceof NodeList)for(const o of t){const t=e.Tooltip.getInstance(o);null!==t&&t.hide()}else t instanceof HTMLElement&&e.Tooltip.getInstance(t).hide()}}const n=new o;return TYPO3.Tooltip=n,n}));