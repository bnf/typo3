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
define(["./RegularEvent"],(function(t){"use strict";return class extends t{constructor(t,e,s){super(t,e),this.callback=this.throttle(e,s)}throttle(t,e){let s=!1;return function(...r){s||(t.apply(this,r),s=!0,setTimeout(()=>{s=!1,t.apply(this,r)},e))}}}}));