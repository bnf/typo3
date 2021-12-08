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
define(["require","exports","TYPO3/CMS/Core/Ajax/AjaxResponse","TYPO3/CMS/Core/Ajax/InputTransformer"],(function(e,t,s,n){"use strict";class r{constructor(e){this.queryArguments="",this.url=e,this.abortController=new AbortController}withQueryArguments(e){const t=this.clone();return t.queryArguments=(""!==t.queryArguments?"&":"")+n.InputTransformer.toSearchParams(e),t}async get(e={}){const t=await this.send(Object.assign(Object.assign({},{method:"GET"}),e));return new s.AjaxResponse(t)}async post(e,t={}){const r={body:"string"==typeof e?e:n.InputTransformer.byHeader(e,null==t?void 0:t.headers),cache:"no-cache",method:"POST"},o=await this.send(Object.assign(Object.assign({},r),t));return new s.AjaxResponse(o)}async put(e,t={}){const r={body:"string"==typeof e?e:n.InputTransformer.byHeader(e,null==t?void 0:t.headers),cache:"no-cache",method:"PUT"},o=await this.send(Object.assign(Object.assign({},r),t));return new s.AjaxResponse(o)}async delete(e={},t={}){const r={cache:"no-cache",method:"DELETE"};"object"==typeof e&&Object.keys(e).length>0?r.body=n.InputTransformer.byHeader(e,null==t?void 0:t.headers):"string"==typeof e&&e.length>0&&(r.body=e);const o=await this.send(Object.assign(Object.assign({},r),t));return new s.AjaxResponse(o)}abort(){this.abortController.abort()}clone(){return Object.assign(Object.create(this),this)}async send(e={}){const t=await fetch(this.composeRequestUrl(),this.getMergedOptions(e));if(!t.ok)throw new s.AjaxResponse(t);return t}composeRequestUrl(){let e=this.url;if("?"===e.charAt(0)&&(e=window.location.origin+window.location.pathname+e),e=new URL(e,window.location.origin).toString(),""!==this.queryArguments){e+=(this.url.includes("?")?"&":"?")+this.queryArguments}return e}getMergedOptions(e){return Object.assign(Object.assign(Object.assign({},r.defaultOptions),e),{signal:this.abortController.signal})}}return r.defaultOptions={credentials:"same-origin"},r}));