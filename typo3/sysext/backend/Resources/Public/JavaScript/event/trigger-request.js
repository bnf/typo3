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
import e from"@typo3/backend/event/interaction-request.js";class t extends e{constructor(e,t=null){super(e,t)}concerns(t){if(this===t)return!0;for(let r=this.parentRequest;r instanceof e;r=r.parentRequest)if(r===t)return!0;return!1}concernsTypes(t){if(t.includes(this.type))return!0;for(let r=this.parentRequest;r instanceof e;r=r.parentRequest)if(t.includes(r.type))return!0;return!1}}export{t as default};