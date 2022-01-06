
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
/**
 * This handler is used as client-side counterpart of `\TYPO3\CMS\Core\Page\PageRenderer`.
 *
 * @module TYPO3/CMS/Core/RequireJSConfigHandler
 * @internal Use in TYPO3 core only, API can change at any time!
 */

// @todo Handle document.currentScript.async
if (document.currentScript) {
  window.require.config(
    // extracts JSON payload from `/* [JSON] */` content
    JSON.parse(document.currentScript.textContent.replace(/^\s*\/\*\s*|\s*\*\/\s*/g, ''))
  );
}
