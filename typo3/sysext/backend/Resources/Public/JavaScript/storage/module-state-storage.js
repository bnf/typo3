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
class t{static{this.prefix="t3-module-state-"}static update(e,i){if("number"==typeof i)i=i.toString(10);else if("string"!=typeof i)throw new SyntaxError("identifier must be of type string");const r=t.current(e),n={identifier:i,treeIdentifier:i===r.identifier?r.treeIdentifier:null};return t.commit(e,"update",n),n}static updateWithTreeIdentifier(e,i,r){if("number"==typeof i)i=i.toString(10);else if("string"!=typeof i)throw new SyntaxError("identifier must be of type string");if("number"==typeof r)r=r.toString(10);else if("string"!=typeof r)throw new SyntaxError("treeIdentifier must be of type string");const n={identifier:i,treeIdentifier:r};return t.commit(e,"update-with-tree-identifier",n),n}static updateWithCurrentMount(e,i){t.update(e,i)}static current(e){return{...t.getInitialState(),...t.fetch(e)??{}}}static purge(){Object.keys(sessionStorage).filter((e=>e.startsWith(t.prefix))).forEach((t=>sessionStorage.removeItem(t)))}static fetch(e){const i=sessionStorage.getItem(t.prefix+e);return null===i?null:JSON.parse(i)}static async commit(e,i,r){const n=t.current(e);sessionStorage.setItem(t.prefix+e,JSON.stringify(r)),top.document.dispatchEvent(new CustomEvent("typo3:module-state-storage:"+i+":"+e,{detail:{state:r,oldState:n}}))}static getInitialState(){return{identifier:"",treeIdentifier:null}}}window.ModuleStateStorage=t;export{t as ModuleStateStorage};