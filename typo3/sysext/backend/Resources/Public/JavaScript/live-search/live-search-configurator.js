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
class a{renderers={};invokeHandlers={};getRenderers(){return this.renderers}addRenderer(r,n,t){this.renderers[r]={module:n,callback:t}}getInvokeHandlers(){return this.invokeHandlers}addInvokeHandler(r,n,t){this.invokeHandlers[r+"_"+n]=t}}let e;top.TYPO3.LiveSearchConfigurator?e=top.TYPO3.LiveSearchConfigurator:(e=new a,top.TYPO3.LiveSearchConfigurator=e);var o=e;export{o as default};
