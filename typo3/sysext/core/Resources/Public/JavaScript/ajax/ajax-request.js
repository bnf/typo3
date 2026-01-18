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
import{AjaxResponse as n}from"@typo3/core/ajax/ajax-response.js";import{InputTransformer as r}from"@typo3/core/ajax/input-transformer.js";import{UrlFactory as c}from"@typo3/core/factory/url-factory.js";class i{static defaultOptions={credentials:"same-origin"};url;abortController;fetch;constructor(e){this.url=e instanceof URL?e:new URL(e,window.location.origin+window.location.pathname),this.abortController=new AbortController,this.fetch=t=>fetch(t)}withQueryArguments(e){const t=this.clone();Array.isArray(e)?e=new URLSearchParams(e.join("&")):e instanceof URLSearchParams||(e=c.createSearchParams(e));for(const[o,s]of e.entries())this.url.searchParams.append(o,s);return t}async get(e={}){const t={method:"GET"},o=await this.send({...t,...e});return new n(o)}async post(e,t={}){const o={body:typeof e=="string"||e instanceof FormData?e:Object.keys(e).length?r.byHeader(e,t?.headers):"",cache:"no-cache",method:"POST"},s=await this.send({...o,...t});return new n(s)}async put(e,t={}){const o={body:typeof e=="string"||e instanceof FormData?e:r.byHeader(e,t?.headers),cache:"no-cache",method:"PUT"},s=await this.send({...o,...t});return new n(s)}async delete(e={},t={}){const o={cache:"no-cache",method:"DELETE"};typeof e=="string"&&e.length>0||e instanceof FormData?o.body=e:typeof e=="object"&&Object.keys(e).length>0&&(o.body=r.byHeader(e,t?.headers));const s=await this.send({...o,...t});return new n(s)}abort(){this.abortController.abort()}addMiddleware(e){if(Array.isArray(e))return e.forEach(o=>this.addMiddleware(o)),this;const t=this.fetch;return this.fetch=o=>e(o,t),this}clone(){return Object.assign(Object.create(this),this)}async send(e={}){const t=await this.fetch(new Request(this.url,this.getMergedOptions(e)));if(!t.ok)throw new n(t);return t}getMergedOptions(e){const{signal:t,...o}=e;return t?.addEventListener("abort",()=>this.abortController.abort()),{...i.defaultOptions,...o,signal:this.abortController.signal}}}export{i as default};
