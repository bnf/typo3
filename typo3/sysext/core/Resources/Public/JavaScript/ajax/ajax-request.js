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
import{AjaxResponse as t}from"@typo3/core/ajax/ajax-response.js"
import{InputTransformer as e}from"@typo3/core/ajax/input-transformer.js"
class n{static{this.defaultOptions={credentials:"same-origin"}}constructor(t){this.url=t instanceof URL?t:new URL(t,window.location.origin+window.location.pathname),this.abortController=new AbortController}withQueryArguments(t){const n=this.clone()
t instanceof URLSearchParams||(t=new URLSearchParams(e.toSearchParams(t)))
for(const[key,value]of t.entries())this.url.searchParams.append(key,value)
return n}async get(init={}){const e=await this.send({method:"GET",...init})
return new t(e)}async post(n,init={}){const a={body:"string"==typeof n||n instanceof FormData?n:e.byHeader(n,init?.headers),cache:"no-cache",method:"POST"},i=await this.send({...a,...init})
return new t(i)}async put(n,init={}){const a={body:"string"==typeof n||n instanceof FormData?n:e.byHeader(n,init?.headers),cache:"no-cache",method:"PUT"},i=await this.send({...a,...init})
return new t(i)}async delete(data={},init={}){const n={cache:"no-cache",method:"DELETE"}
"string"==typeof data&&data.length>0||data instanceof FormData?n.body=data:"object"==typeof data&&Object.keys(data).length>0&&(n.body=e.byHeader(data,init?.headers))
const a=await this.send({...n,...init})
return new t(a)}abort(){this.abortController.abort()}clone(){return Object.assign(Object.create(this),this)}async send(init={}){const e=await fetch(this.url,this.getMergedOptions(init))
if(!e.ok)throw new t(e)
return e}getMergedOptions(t){const{signal,...initOptions}=t
return signal?.addEventListener("abort",(()=>this.abortController.abort())),{...n.defaultOptions,...initOptions,signal:this.abortController.signal}}}export default n
