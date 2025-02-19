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
class e{constructor(){this.renderers={},this.invokeHandlers={}}getRenderers(){return this.renderers}addRenderer(e,r,n){this.renderers[e]={module:r,callback:n}}getInvokeHandlers(){return this.invokeHandlers}addInvokeHandler(e,r,n){this.invokeHandlers[e+"_"+r]=n}}let r;top.TYPO3.LiveSearchConfigurator?r=top.TYPO3.LiveSearchConfigurator:(r=new e,top.TYPO3.LiveSearchConfigurator=r);export default r;