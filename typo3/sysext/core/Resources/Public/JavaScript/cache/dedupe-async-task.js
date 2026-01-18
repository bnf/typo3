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
class m{promises={};results={};async get(t,o,r){if(r?.aborted&&r.throwIfAborted(),t in this.results)return this.results[t];const e=this.getPromise(t,o);return r?await this.getAbortablePromise(t,e,r):await e}getPromise(t,o){if(t in this.promises)return this.promises[t].refCount++,this.promises[t].promise;const r=new AbortController,e=1,i=o(r.signal).then(s=>(this.results[t]=s,s)).finally(()=>{t in this.promises&&delete this.promises[t]});return this.promises[t]={promise:i,abortController:r,refCount:e},i}getAbortablePromise(t,o,r){return new Promise((e,i)=>{const s=()=>{t in this.promises&&--this.promises[t].refCount<1&&(this.promises[t].abortController.abort(),delete this.promises[t]);try{r.throwIfAborted()}catch(n){i(n)}};r.addEventListener("abort",s,{once:!0}),o.then(n=>{r.removeEventListener("abort",s),r.aborted||e(n)},n=>{r.removeEventListener("abort",s),i(n)})})}}export{m as DedupeAsyncTask};
