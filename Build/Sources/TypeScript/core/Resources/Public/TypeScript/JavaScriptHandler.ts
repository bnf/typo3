
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
 * This handler is used as client-side counterpart of `\TYPO3\CMS\Core\Page\JavaScriptRenderer`.
 *
 * @module TYPO3/CMS/Core/JavaScriptHandler
 * @internal Use in TYPO3 core only, API can change at any time!
 */
(function(): void {
  'use strict';

  // @todo Handle document.currentScript.async
  if (!document.currentScript) {
    return;
  }

  const moduleImporter = (moduleName: string) => import(moduleName).catch(() => (window as any).importShim(moduleName));
  const scriptElement = document.currentScript;
  // extracts JSON payload from `/* [JSON] */` content
  const textContent = scriptElement.textContent.replace(/^\s*\/\*\s*|\s*\*\/\s*/g, '')
  const items = JSON.parse(textContent);

  moduleImporter('TYPO3/CMS/Core/JavaScriptItemProcessor.js').then(({JavaScriptItemProcessor}) => {
    const allowedInvokableNames = ['loadRequireJs', 'globalAssignment', 'javaScriptModuleInstruction'];
    const processor = new JavaScriptItemProcessor(allowedInvokableNames);
    processor.processItems(items);
  });
})();
