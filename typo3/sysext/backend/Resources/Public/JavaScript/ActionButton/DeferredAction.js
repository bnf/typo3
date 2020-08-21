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
define(["./AbstractAction","../Icons"],(function(e,t){"use strict";class c extends e.AbstractAction{async execute(e){return t.getIcon("spinner-circle-light",t.sizes.small).then(t=>{e.innerHTML=t}),await this.executeCallback()}async executeCallback(){return await this.callback()}}return c}));