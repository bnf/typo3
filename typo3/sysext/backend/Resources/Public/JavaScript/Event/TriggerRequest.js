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
define(["require","exports","TYPO3/CMS/Backend/Event/InteractionRequest"],(function(e,t,n){"use strict";return class extends n{constructor(e,t=null){super(e,t)}concerns(e){if(this===e)return!0;let t=this;for(;t.parentRequest instanceof n;)if(t=t.parentRequest,t===e)return!0;return!1}concernsTypes(e){if(e.includes(this.type))return!0;let t=this;for(;t.parentRequest instanceof n;)if(t=t.parentRequest,e.includes(t.type))return!0;return!1}}}));