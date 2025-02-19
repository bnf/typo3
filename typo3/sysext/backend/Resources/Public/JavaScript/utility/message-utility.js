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
class i{static getOrigin(){return window.origin}static verifyOrigin(t){return i.getOrigin()===t}static send(t,r=window){r.postMessage(t,i.getOrigin())}}export{i as MessageUtility};