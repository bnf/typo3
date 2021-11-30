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

import FormEngineValidation = require('TYPO3/CMS/Backend/FormEngineValidation')

/**
 * Module: TYPO3/CMS/Redirects/FormEngineEvaluation
 * @exports TYPO3/CMS/Redirects/FormEngineEvaluation
 */
export class FormEngineEvaluation {
  static registerCustomEvaluation(name: string): void {
    FormEngineValidation.registerCustomEvaluation(name, FormEngineEvaluation.evaluateSourceHost);
  }

  public static evaluateSourceHost(value: string): string {
    if (value === '*') {
      return value;
    }
    if (!value.includes('://')) {
      value = 'http://' + value;
    }
    return (new URL(value)).host;
  }
}
