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
import{AjaxResponse as t}from"@typo3/core/ajax/ajax-response.js";import{InputTransformer as e}from"@typo3/core/ajax/input-transformer.js";class n{static{this.defaultOptions={credentials:"same-origin"}}constructor(t){this.url=t instanceof URL?t:new URL(t,window.location.origin+window.location.pathname),this.abortController=new AbortController}withQueryArguments(t){const n=this.clone();t instanceof URLSearchParams||(t=new URLSearchParams(e.toSearchParams(t)));for(const[e,n]of t.entries())this.url.searchParams.append(e,n);return n}async get(e={}){const n=await this.send({method:"GET",...e});return new t(n)}async post(n,o={}){const a={body:"string"==typeof n||n instanceof FormData?n:e.byHeader(n,o?.headers),cache:"no-cache",method:"POST"},r=await this.send({...a,...o});return new t(r)}async put(n,o={}){const a={body:"string"==typeof n||n instanceof FormData?n:e.byHeader(n,o?.headers),cache:"no-cache",method:"PUT"},r=await this.send({...a,...o});return new t(r)}async delete(n={},o={}){const a={cache:"no-cache",method:"DELETE"};"string"==typeof n&&n.length>0||n instanceof FormData?a.body=n:"object"==typeof n&&Object.keys(n).length>0&&(a.body=e.byHeader(n,o?.headers));const r=await this.send({...a,...o});return new t(r)}abort(){this.abortController.abort()}clone(){return Object.assign(Object.create(this),this)}async send(e={}){const n=await fetch(this.url,this.getMergedOptions(e));if(!n.ok)throw new t(n);return n}getMergedOptions(t){const{signal:e,...o}=t;return e?.addEventListener("abort",(()=>this.abortController.abort())),{...n.defaultOptions,...o,signal:this.abortController.signal}}}export default n;