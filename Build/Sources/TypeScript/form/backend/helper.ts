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

import { loadModule, JavaScriptItemPayload } from '@typo3/core/java-script-item-processor';
import DocumentService from '@typo3/core/document-service';
import { topLevelModuleImport } from '@typo3/backend/utility/top-level-module-import';

interface ModuleRequirements {
  app: JavaScriptItemPayload;
  viewModel: JavaScriptItemPayload;
  mediator?: JavaScriptItemPayload;
}

interface FormEditorLike {
  getInstance(options: any, mediator: MediatorLike, viewModel: typeof import('@typo3/form/backend/form-manager/view-model')): FormEditorLike;
  run(): FormEditorLike;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface MediatorLike {
}

/**
 * @exports @typo3/form/backend/helper
 */
export class Helper {
  public static dispatchFormEditor(requirements: ModuleRequirements, options: any): void {
    DocumentService.ready().then((): void => {
      Promise.all([
        loadModule(requirements.app),
        loadModule(requirements.mediator),
        loadModule(requirements.viewModel),
      ]).then((modules: [any, any, any]) =>
        ((app: FormEditorLike, mediator: MediatorLike, viewModel: typeof import('@typo3/form/backend/form-manager/view-model')) => {
          window.TYPO3.FORMEDITOR_APP = app.getInstance(options, mediator, viewModel).run();
        })(...modules)
      );
    });
  }

  public static dispatchFormManager(requirements: ModuleRequirements, options: any): void {
    DocumentService.ready().then((): void => {
      Promise.all([
        loadModule(requirements.app),
        loadModule(requirements.viewModel)
      ]).then((modules: [any, any]) =>
        ((
          formManager: typeof import('@typo3/form/backend/form-manager'),
          viewModel: typeof import('@typo3/form/backend/form-manager/view-model')
        ) => {
          window.TYPO3.FORMMANAGER_APP = formManager.getInstance(options, viewModel).run();
        })(...modules)
      );
    });
  }

  public static prepareTopLevelModule(moduleName: string, languagePrefix: string): void
  {
    let topTYPO3: typeof TYPO3 = window.TYPO3;
    try {
      // fetch from opening window
      if (window.opener && window.opener.TYPO3) {
        topTYPO3 = window.opener.TYPO3;
      }

      // fetch from parent
      if (window.parent && window.parent.TYPO3) {
        topTYPO3 = window.parent.TYPO3;
      }

      // fetch object from outer frame
      if (window.top && window.top.TYPO3) {
        topTYPO3 = window.top.TYPO3;
      }
    } catch (e) {
      // This only happens if the opener, parent or top is some other url (eg a local file)
      // which loaded the current window. Then the browser's cross domain policy jumps in
      // and raises an exception.
      // For this case we are safe and use the window.TYPO3 reference
    }

    // Make formMananger.* language keys available to the top frame
    Object.entries(TYPO3.lang)
      .filter(([key,]) => key.startsWith(languagePrefix))
      .forEach(([key, value]) => topTYPO3.lang[key] = value);

    topLevelModuleImport('@typo3/form/backend/' + moduleName + '.js');
  }
}
