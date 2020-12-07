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
define((function(){"use strict";return class e{static get default(){return console.warn("The property .default of module JQueryNativePromises has been deprecated, use JQueryNativePromises directly."),this}static support(){"function"!=typeof Promise.prototype.done&&(Promise.prototype.done=function(e){return arguments.length?this.then.apply(this,arguments):Promise.prototype.then}),"function"!=typeof Promise.prototype.fail&&(Promise.prototype.fail=function(t){return this.catch(async s=>{const o=s.response;t(await e.createFakeXhrObject(o),"error",o.statusText)}),this})}static async createFakeXhrObject(e){const t={readyState:4};return t.responseText=await e.text(),t.responseURL=e.url,t.status=e.status,t.statusText=e.statusText,e.headers.has("Content-Type")&&e.headers.get("Content-Type").includes("application/json")?(t.responseType="json",t.contentJSON=await e.json()):t.responseType="text",t}}}));