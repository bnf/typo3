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
define(["./RegularEvent"],(function(n){"use strict";return class extends n{constructor(n,t){super(n,t),this.callback=this.req(this.callback)}req(n){let t=null;return()=>{const e=this,i=arguments;t&&window.cancelAnimationFrame(t),t=window.requestAnimationFrame((function(){n.apply(e,i)}))}}}}));