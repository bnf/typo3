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
import DocumentSaveActions from"TYPO3/CMS/Backend/DocumentSaveActions";class SplitButtons{constructor(){console.warn("TYPO3/CMS/Backend/SplitButtons has been marked as deprecated, consider using TYPO3/CMS/Backend/DocumentSaveActions instead")}addPreSubmitCallback(t){DocumentSaveActions.getInstance().addPreSubmitCallback(t)}}export default new SplitButtons;