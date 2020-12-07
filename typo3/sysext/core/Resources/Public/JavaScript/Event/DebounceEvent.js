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
define(["./RegularEvent"],(function(t){"use strict";return class extends t{constructor(t,e,l=250,n=!1){super(t,e),this.callback=this.debounce(this.callback,l,n)}debounce(t,e,l){let n=null;return function(...u){const s=l&&!n;clearTimeout(n),s?(t.apply(this,u),n=setTimeout(()=>{n=null},e)):n=setTimeout(()=>{n=null,l||t.apply(this,u)},e)}}}}));