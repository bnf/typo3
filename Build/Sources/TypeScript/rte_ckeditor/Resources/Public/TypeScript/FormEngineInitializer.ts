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

import $ from 'jquery';
import FormEngine from 'TYPO3/CMS/Backend/FormEngine';

interface CKEditorOptions {
  fieldId: string;
  configuration: any;
  configurationHash: string;
  externalPlugins: CKEditorExternalPlugin[];
}

interface CKEditorExternalPlugin {
  name: string;
  resource: string;
}

/**
 * @exports TYPO3/CMS/RteCkeditor/FormEngineInitializer
 */
export class FormEngineInitializer {
  public static initializeCKEditor(options: CKEditorOptions): void {
    import('ckeditor', ).then(({default: CKEDITOR}: {default: any}) => {
      CKEDITOR.timestamp += '-' + options.configurationHash;
      options.externalPlugins
        .forEach((item: CKEditorExternalPlugin) => CKEDITOR.plugins.addExternal(item.name, item.resource, ''));
      $(() => {
        const fieldId = options.fieldId;
        const escapedFieldSelector = '#' + $.escapeSelector(fieldId);
        CKEDITOR.replace(fieldId, options.configuration);

        const instance = CKEDITOR.instances[fieldId];
        instance.on('change', (evt: CKEDITOR.eventInfo) => {
          let commands = evt.sender.commands;
          instance.updateElement();
          FormEngine.Validation.validateField($(escapedFieldSelector));
          FormEngine.Validation.markFieldAsChanged($(escapedFieldSelector));

          // remember changes done in maximized state and mark field as changed, once minimized again
          if (typeof commands.maximize !== 'undefined' && commands.maximize.state === 1) {
            instance.on('maximize', (evt: CKEDITOR.eventInfo) => {
              $(this).off('maximize');
              FormEngine.Validation.markFieldAsChanged($(escapedFieldSelector));
            });
          }
        });
        instance.on('mode', (evt: CKEDITOR.eventInfo) => {
          // detect field changes in source mode
          if (evt.editor.mode === 'source') {
            const sourceArea = instance.editable();
            sourceArea.attachListener(sourceArea, 'change', () => {
              FormEngine.Validation.markFieldAsChanged($(escapedFieldSelector));
            });
          }
        });
        document.addEventListener('inline:sorting-changed', () => {
          instance.destroy();
          CKEDITOR.replace(fieldId, options.configuration);
        });
        document.addEventListener('formengine:flexform:sorting-changed', () => {
          instance.destroy();
          CKEDITOR.replace(fieldId, options.configuration);
        });
      });
    });
  }
}
