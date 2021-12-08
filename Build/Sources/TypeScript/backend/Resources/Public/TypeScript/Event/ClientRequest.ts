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

import InteractionRequest = require('TYPO3/CMS/Backend/Event/InteractionRequest');

class ClientRequest extends InteractionRequest {
  public readonly clientEvent: any;

  constructor(type: string, clientEvent: Event = null) {
    super(type);
    this.clientEvent = clientEvent;
  }
}

export = ClientRequest;
