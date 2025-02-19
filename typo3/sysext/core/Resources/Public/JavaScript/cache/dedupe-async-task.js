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
class t{constructor(){this.promises={},this.results={}}async get(t,e,r){if(r?.aborted&&r.throwIfAborted(),t in this.results)return this.results[t];const s=this.getPromise(t,e);return r?await this.getAbortablePromise(t,s,r):await s}getPromise(t,e){if(t in this.promises)return this.promises[t].refCount++,this.promises[t].promise;const r=new AbortController,s=e(r.signal).then((e=>(this.results[t]=e,e))).finally((()=>{t in this.promises&&delete this.promises[t]}));return this.promises[t]={promise:s,abortController:r,refCount:1},s}getAbortablePromise(t,e,r){return new Promise(((s,o)=>{const i=()=>{t in this.promises&&--this.promises[t].refCount<1&&(this.promises[t].abortController.abort(),delete this.promises[t]);try{r.throwIfAborted()}catch(t){o(t)}};r.addEventListener("abort",i,{once:!0}),e.then((t=>{r.removeEventListener("abort",i),r.aborted||s(t)}),(t=>{r.removeEventListener("abort",i),o(t)}))}))}}export{t as DedupeAsyncTask};