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
define(["./InteractionRequest"],(function(e){"use strict";return class extends e{constructor(e,t=null){super(e,t)}concerns(t){if(this===t)return!0;let n=this;for(;n.parentRequest instanceof e;)if(n=n.parentRequest,n===t)return!0;return!1}concernsTypes(t){if(t.includes(this.type))return!0;let n=this;for(;n.parentRequest instanceof e;)if(n=n.parentRequest,t.includes(n.type))return!0;return!1}}}));