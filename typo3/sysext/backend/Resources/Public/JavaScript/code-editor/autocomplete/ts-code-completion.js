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
import e from"@typo3/core/ajax/ajax-request.js"
import{TsRef as t}from"@typo3/backend/code-editor/autocomplete/ts-ref.js"
import{TsParser as s}from"@typo3/backend/code-editor/autocomplete/ts-parser.js"
import{CompletionResult as o}from"@typo3/backend/code-editor/autocomplete/completion-result.js"
export class TsCodeCompletion{constructor(e){this.extTsObjTree={},this.parser=null,this.proposals=null,this.compResult=null,this.tsRef=new t,this.parser=new s(this.tsRef,this.extTsObjTree),this.tsRef.loadTsrefAsync(),this.loadExtTemplatesAsync(e)}refreshCodeCompletion(e){const t=this.getFilter(e),s=this.parser.buildTsObjTree(e)
this.compResult=new o(this.tsRef,s),this.proposals=this.compResult.getFilteredProposals(t)
const r=[]
for(let l=0;l<this.proposals.length;l++)r[l]=this.proposals[l].word
return r}loadExtTemplatesAsync(t){if(Number.isNaN(t)||0===t)return null
new e(TYPO3.settings.ajaxUrls.codeeditor_codecompletion_loadtemplates).withQueryArguments({pageId:t}).get().then((async e=>{this.extTsObjTree.c=await e.resolve(),this.resolveExtReferencesRec(this.extTsObjTree.c)}))}resolveExtReferencesRec(e){for(const t of Object.keys(e)){let s
if(e[t].v&&e[t].v.startsWith("<")&&!e[t].v.includes(">")){const o=e[t].v.replace(/</,"").trim();-1===o.indexOf(" ")&&null!==(s=this.getExtChildNode(o))&&(e[t]=s)}!s&&e[t].c&&this.resolveExtReferencesRec(e[t].c)}}getExtChildNode(e){let t=this.extTsObjTree
const s=e.split(".")
for(let o=0;o<s.length;o++){const r=s[o]
if(void 0===t.c||void 0===t.c[r])return null
t=t.c[r]}return t}getFilter(e){return e.completingAfterDot?"":e.token.string.replace(".","").replace(/\s/g,"")}}