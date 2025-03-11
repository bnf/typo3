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
export class CompletionResult{constructor(e,t){this.tsRef=e,this.tsTreeNode=t}getType(){const e=this.tsTreeNode.getValue()
return this.tsRef.isType(e)?this.tsRef.getType(e):null}getFilteredProposals(e){const t={},s=[],o=this.tsTreeNode.getChildNodes(),r=this.tsTreeNode.getValue()
for(const i in o)if(void 0!==o[i].value&&null!==o[i].value){(n={}).word=i,this.tsRef.typeHasProperty(r,o[i].name)?(this.tsRef.cssClass="definedTSREFProperty",n.type=o[i].value):(n.cssClass="userProperty",this.tsRef.isType(o[i].value)?n.type=o[i].value:n.type=""),s.push(n),t[i]=!0}const l=this.tsRef.getPropertiesFromTypeId(this.tsTreeNode.getValue())
for(const i in l)if(void 0!==l[i].value&&!0!==t[i]){const n={word:i,cssClass:"undefinedTSREFProperty",type:l[i].value}
s.push(n)}const u=[]
for(let p=0;p<s.length;p++)0!==e.length?s[p].word.substring(0,e.length).toLowerCase()===e.toLowerCase()&&u.push(s[p]):u.push(s[p])
return u}}