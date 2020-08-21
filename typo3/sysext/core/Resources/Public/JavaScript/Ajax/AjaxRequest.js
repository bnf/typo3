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
define(["../BackwardCompat/JQueryNativePromises","./AjaxResponse","./InputTransformer"],(function(e,t,s){"use strict";class n{constructor(t){this.queryArguments="",this.url=t,this.abortController=new AbortController,e.support()}withQueryArguments(e){const t=this.clone();return t.queryArguments=(""!==t.queryArguments?"&":"")+s.InputTransformer.toSearchParams(e),t}async get(e={}){const s=await this.send(Object.assign(Object.assign({},{method:"GET"}),e));return new t.AjaxResponse(s)}async post(e,n={}){const r={body:"string"==typeof e?e:s.InputTransformer.byHeader(e,null==n?void 0:n.headers),cache:"no-cache",method:"POST"},o=await this.send(Object.assign(Object.assign({},r),n));return new t.AjaxResponse(o)}async put(e,n={}){const r={body:"string"==typeof e?e:s.InputTransformer.byHeader(e,null==n?void 0:n.headers),cache:"no-cache",method:"PUT"},o=await this.send(Object.assign(Object.assign({},r),n));return new t.AjaxResponse(o)}async delete(e={},n={}){const r={cache:"no-cache",method:"DELETE"};"object"==typeof e&&Object.keys(e).length>0?r.body=s.InputTransformer.byHeader(e,null==n?void 0:n.headers):"string"==typeof e&&e.length>0&&(r.body=e);const o=await this.send(Object.assign(Object.assign({},r),n));return new t.AjaxResponse(o)}abort(){this.abortController.abort()}clone(){return Object.assign(Object.create(this),this)}async send(e={}){const s=await fetch(this.composeRequestUrl(),this.getMergedOptions(e));if(!s.ok)throw new t.AjaxResponse(s);return s}composeRequestUrl(){let e=this.url;if("?"===e.charAt(0)&&(e=window.location.origin+window.location.pathname+e),e=new URL(e,window.location.origin).toString(),""!==this.queryArguments){e+=(this.url.includes("?")?"&":"?")+this.queryArguments}return e}getMergedOptions(e){return Object.assign(Object.assign(Object.assign({},n.defaultOptions),e),{signal:this.abortController.signal})}}return n.defaultOptions={credentials:"same-origin"},n}));