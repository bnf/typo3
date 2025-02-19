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
class e{constructor(e,t){this.tsRef=e,this.tsTreeNode=t}getType(){const e=this.tsTreeNode.getValue();return this.tsRef.isType(e)?this.tsRef.getType(e):null}getFilteredProposals(e){const t={},s=[],o=this.tsTreeNode.getChildNodes(),r=this.tsTreeNode.getValue();for(const e in o)if(void 0!==o[e].value&&null!==o[e].value){const i={};i.word=e,this.tsRef.typeHasProperty(r,o[e].name)?(this.tsRef.cssClass="definedTSREFProperty",i.type=o[e].value):(i.cssClass="userProperty",this.tsRef.isType(o[e].value)?i.type=o[e].value:i.type=""),s.push(i),t[e]=!0}const i=this.tsRef.getPropertiesFromTypeId(this.tsTreeNode.getValue());for(const e in i)if(void 0!==i[e].value&&!0!==t[e]){const t={word:e,cssClass:"undefinedTSREFProperty",type:i[e].value};s.push(t)}const l=[];let n="";for(let t=0;t<s.length;t++)0!==e.length?(n=s[t].word.substring(0,e.length),n.toLowerCase()===e.toLowerCase()&&l.push(s[t])):l.push(s[t]);return l}}export{e as CompletionResult};