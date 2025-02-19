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
import{customElement as e}from"lit/decorators.js";import{LitElement as t}from"lit";let r=class extends t{createRenderRoot(){return this}};r=function(e,t,r,o){var c,n=arguments.length,l=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,r):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)l=Reflect.decorate(e,t,r,o);else for(var f=e.length-1;f>=0;f--)(c=e[f])&&(l=(n<3?c(l):n>3?c(t,r,l):c(t,r))||l);return n>3&&l&&Object.defineProperty(t,r,l),l}([e("typo3-backend-live-search")],r);export{r as BackendSearch};