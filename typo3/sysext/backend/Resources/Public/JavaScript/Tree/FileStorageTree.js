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
define(["TYPO3/CMS/Core/Ajax/AjaxRequest","../SvgTree"],(function(e,t){"use strict";class s extends t.SvgTree{constructor(){super(),this.settings.defaultProperties={hasChildren:!1,nameSourceField:"title",itemType:"sys_file",prefix:"",suffix:"",locked:!1,loaded:!1,overlayIcon:"",selectable:!0,expanded:!1,checked:!1,backgroundColor:"",class:"",readableRootline:""}}showChildren(e){this.loadChildrenOfNode(e),super.showChildren(e)}getNodeTitle(e){return decodeURIComponent(e.name)}loadChildrenOfNode(t){if(t.loaded)return this.prepareDataForVisibleNodes(),void this.updateVisibleNodes();this.nodesAddPlaceholder(),new e(this.settings.dataUrl+"&parent="+t.identifier+"&currentDepth="+t.depth).get({cache:"no-cache"}).then(e=>e.resolve()).then(e=>{let s=Array.isArray(e)?e:[];const o=this.nodes.indexOf(t)+1;s.forEach((e,t)=>{this.nodes.splice(o+t,0,e)}),t.loaded=!0,this.setParametersNode(),this.prepareDataForVisibleNodes(),this.updateVisibleNodes(),this.nodesRemovePlaceholder(),this.switchFocusNode(t)}).catch(e=>{throw this.errorNotification(e,!1),this.nodesRemovePlaceholder(),e})}}return{FileStorageTree:s}}));