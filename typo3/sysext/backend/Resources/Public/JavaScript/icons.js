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
import AjaxRequest from"@typo3/core/ajax/ajax-request.js";import ClientStorage from"@typo3/backend/storage/client.js";import{Sizes,States,MarkupIdentifiers}from"@typo3/backend/enum/icon-types.js";import{css}from"lit";export class IconStyles{static getStyles(){return[css`
        :host {
          display: flex;
          align-items: center;
          justify-content: center;
          height: var(--icon-size, 1em);
          width: var(--icon-size, 1em)
        }

        :host([inline]) {
          display: inline-flex;
          line-height: var(--icon-size, 1em);
          vertical-align: -22%
        }

        :host([size=default]),
        :host([raw]) .icon-size-default {
          --icon-size: 1em;
        }

        :host([size=small]),
        :host([raw]) .icon-size-small {
          --icon-size: var(--icon-size-small, 16px)
        }

        :host([size=medium]),
        :host([raw]) .icon-size-medium {
          --icon-size: var(--icon-size-medium, 32px)
        }

        :host([size=large]),
        :host([raw]) .icon-size-large {
          --icon-size: var(--icon-size-large, 48px)
        }

        :host([size=mega]),
        :host([raw]) .icon-size-mega {
          --icon-size: var(--icon-size-mega, 64px)
        }

        .icon {
          position: relative;
          display: flex;
          overflow: hidden;
          white-space: nowrap;
          color: var(--icon-color-primary, currentColor);
          height: var(--icon-size, 1em);
          width: var(--icon-size, 1em);
          line-height: var(--icon-size, 1em);
          flex-shrink: 0;
        }

        .icon img, .icon svg {
          display: block;
          height: 100%;
          width: 100%
        }

        .icon * {
          display: block;
          line-height: inherit
        }

        .icon-markup {
          position: absolute;
          display: block;
          text-align: center;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0
        }

        .icon-overlay {
          position: absolute;
          bottom: 0;
          right: 0;
          height: 68.75%;
          width: 68.75%;
          text-align: center
        }

        .icon-spin .icon-markup {
          -webkit-animation: icon-spin 2s infinite linear;
          animation: icon-spin 2s infinite linear
        }

        @keyframes icon-spin {
          0% {
            transform: rotate(0)
          }
          100% {
            transform: rotate(360deg)
          }
        }

        .icon-state-disabled .icon-markup {
          opacity: var(--icon-opacity-disabled, 0.5)
        }

        .icon-unify {
          line-height: var(--icon-size, 1em);
          font-size: calc(var(--icon-size, 1em) * var(--icon-unify-modifier, .86))
        }

        .icon-overlay .icon-unify {
          line-height: calc(var(--icon-size, 1em) / 1.6);
          font-size: calc((var(--icon-size, 1em) / 1.6) * var(--icon-unify-modifier, .86))
        }
      `]}}class Icons{constructor(){this.sizes=Sizes,this.states=States,this.markupIdentifiers=MarkupIdentifiers,this.promiseCache={}}getIcon(e,i,t,s,o){const n=[e,i=i||Sizes.default,t,s=s||States.default,o=o||MarkupIdentifiers.default],r=n.join("_");return this.getIconRegistryCache().then((e=>(ClientStorage.isset("icon_registry_cache_identifier")&&ClientStorage.get("icon_registry_cache_identifier")===e||(ClientStorage.unsetByPrefix("icon_"),ClientStorage.set("icon_registry_cache_identifier",e)),this.fetchFromLocal(r).then(null,(()=>this.fetchFromRemote(n,r))))))}getIconRegistryCache(){const e="icon_registry_cache_identifier";return this.isPromiseCached(e)||this.putInPromiseCache(e,new AjaxRequest(TYPO3.settings.ajaxUrls.icons_cache).get().then((async e=>await e.resolve()))),this.getFromPromiseCache(e)}fetchFromRemote(e,i){if(!this.isPromiseCached(i)){const t={icon:JSON.stringify(e)};this.putInPromiseCache(i,new AjaxRequest(TYPO3.settings.ajaxUrls.icons).withQueryArguments(t).get().then((async e=>{const t=await e.resolve();return!e.response.redirected&&t.startsWith("<span")&&t.includes("t3js-icon")&&t.includes('<span class="icon-markup">')&&ClientStorage.set("icon_"+i,t),t})))}return this.getFromPromiseCache(i)}fetchFromLocal(e){return ClientStorage.isset("icon_"+e)?Promise.resolve(ClientStorage.get("icon_"+e)):Promise.reject()}isPromiseCached(e){return void 0!==this.promiseCache[e]}getFromPromiseCache(e){return this.promiseCache[e]}putInPromiseCache(e,i){this.promiseCache[e]=i}}let iconsObject;iconsObject||(iconsObject=new Icons,TYPO3.Icons=iconsObject);export default iconsObject;