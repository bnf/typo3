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
export class TsRefType{constructor(e,t,r){this.properties={},this.typeId=e,this.extends=t,this.properties=r}}export class TsRefProperty{constructor(e,t,r){this.parentType=e,this.name=t,this.value=r}}export class TsRef{constructor(){this.typeTree={},this.doc=null}async loadTsrefAsync(){const t=await new e(TYPO3.settings.ajaxUrls.codeeditor_tsref).get()
this.doc=await t.resolve(),this.buildTree()}buildTree(){for(const e of Object.keys(this.doc)){const t=this.doc[e]
this.typeTree[e]=new TsRefType(e,t.extends||void 0,Object.fromEntries(Object.entries(t.properties).map((([propName,property])=>[propName,new TsRefProperty(e,propName,property.type)]))))}for(const e of Object.keys(this.typeTree))void 0!==this.typeTree[e].extends&&this.addPropertiesToType(this.typeTree[e],this.typeTree[e].extends,100)}addPropertiesToType(e,t,r){if(r<0)throw"Maximum recursion depth exceeded while trying to resolve the extends in the TSREF!"
const s=t.split(",")
for(let o=0;o<s.length;o++)if(void 0!==this.typeTree[s[o]]){void 0!==this.typeTree[s[o]].extends&&this.addPropertiesToType(this.typeTree[s[o]],this.typeTree[s[o]].extends,r-1)
const i=this.typeTree[s[o]].properties
for(const p in i)void 0===e.properties[p]&&(e.properties[p]=i[p])}}getPropertiesFromTypeId(e){return void 0!==this.typeTree[e]?(this.typeTree[e].properties.clone=function(){const e={}
for(const t of Object.keys(this))e[t]=new TsRefProperty(this[t].parentType,this[t].name,this[t].value)
return e},this.typeTree[e].properties):{}}typeHasProperty(e,t){return void 0!==this.typeTree[e]&&void 0!==this.typeTree[e].properties[t]}getType(e){return this.typeTree[e]}isType(e){return void 0!==this.typeTree[e]}}