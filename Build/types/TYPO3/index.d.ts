/* tslint:disable:max-classes-per-file */

/**
 * Currently a mixture between namespace and global object
 * Add types as you use them
 */
declare namespace TYPO3 {
  export let Backend: any;
  export let DebugConsole: any;
  export let ExtensionManager: any;
  export let Icons: any;
  export let InfoWindow: any;
  export let LoginRefresh: any;
  export let ModuleMenu: any;
  export let MultiStepWizard: any;
  export let Notification: any;
  export let Modal: any;
  export let OpendocsMenu: any;
  export let Permissions: any;
  export let Severity: any;
  export let ShortcutMenu: any;
  export let Storage: any;
  export let Tooltip: any;
  export let Utility: any;
  export let Wizard: any;
  export let WorkspacesMenu: any;
  export let settings: any;
  export const lang: { [key: string]: string };
  export const configuration: any;
  export namespace CMS {
    export namespace Backend {
      export class FormEngineValidation {
        public readonly errorClass: string;
        public markFieldAsChanged($field: JQuery): void;
        public initializeInputFields(): void;
        public validate(): void;
      }

      export namespace FormEngine {
        export namespace Element {
          export class SelectTree {
            public dispatch: {[key: string]: Function};
            public constructor();
            public initialize(selector: HTMLElement|JQuery, settings: {[key: string]: any}): boolean;
          }
        }
      }

      export class FormEngine {
        public readonly Validation: FormEngineValidation;
        public legacyFieldChangedCb(): void;
        public getFieldElement(fieldName: string, appendix?: string, noFallback?: boolean): JQuery;
        public updateHiddenFieldValueFromSelect(selectFieldEl: HTMLElement, originalFieldEl: HTMLElement): void;
        public preventFollowLinkIfNotSaved(href: string): boolean;
        public setSelectOptionFromExternalSource(
          fieldName: string,
          value: string,
          label: string,
          title: string,
          exclusiveValues?: string,
          optionEl?: HTMLOptionElement | JQuery,
        ): void;
        public reinitialize(): void;
        public openPopupWindow(mode: string, params: string): JQuery;
        public initializeNullNoPlaceholderCheckboxes(): void;
        public initializeNullWithPlaceholderCheckboxes(): void;
      }

      export class MultiStepWizard {
        public addSlide(identifier: string, title: string, content: string, severity: number, callback?: Function): MultiStepWizard;
        public lockNextStep(): JQuery;
        public unlockNextStep(): JQuery;
        public lockPrevStep(): JQuery;
        public unlockPrevStep(): JQuery;
        public blurCancelStep(): JQuery;
        public getComponent(): JQuery;
        public addFinalProcessingSlide(callback?: Function): JQueryXHR;
        public show(): MultiStepWizard;
        public dismiss(): MultiStepWizard;
      }
    }
  }
}

declare namespace TBE_EDITOR {
  export let fieldChanged: Function;
}

/**
 * Current AMD/RequireJS modules are returning *instances* of ad-hoc *classes*, make that known to TypeScript
 */
declare module 'TYPO3/CMS/Backend/FormEngineValidation' {
  const _exported: TYPO3.CMS.Backend.FormEngineValidation;
  export default _exported;
}

declare module 'TYPO3/CMS/Backend/FormEngine' {
  const _exported: TYPO3.CMS.Backend.FormEngine;
  export default _exported;
}

declare module 'TYPO3/CMS/Backend/FormEngine/Element/SelectTree' {
  const _exported: any;
  export default _exported;
}

interface Require {
  (modules: string[]): void;
  (modules: string[], ready: Function): void;
  (module: string): any;
  specified(module: string): boolean;
}

// type definition for global namespace object
interface Window {
  TYPO3: any;
  $: any; // only required in ImageManipulation.ts
  startInModule: Array<string>;
  loadEditId: (id: number, addGetVars?: string) => void;
  require: Require;
  list_frame: Window;
  jump: Function;
  currentSubScript: string;
  currentModuleLoaded: string;
  fsMod: { [key: string]: any };
  nextLoadModuleUrl: string;

  // required for Paste.ts
  // TODO these should be passed as data attributes
  pasteAfterLinkTemplate: string;
  pasteIntoLinkTemplate: string;
}

/**
 * Needed type declarations for provided libs
 */
declare module 'muuri';
declare module 'cm/lib/codemirror';
declare module 'flatpickr/flatpickr.min';
declare module 'flatpickr/locales';
declare module 'moment';
declare module 'Sortable';
interface Taboverride {
  set(elems: HTMLElement|HTMLElement[], enable?: boolean): Taboverride
}
declare module 'taboverride' {
  const _exported: Taboverride;
  export default _exported;
}
declare module 'autosize' {
  export default function (el: HTMLElement, options?: Object): HTMLElement;
}
declare module 'twbs/bootstrap-datetimepicker';
declare module 'TYPO3/CMS/Backend/FormEngine/Element/TreeToolbar';
declare module 'TYPO3/CMS/Backend/LegacyTree';
declare module 'TYPO3/CMS/Install/chosen.jquery.min';
declare module 'TYPO3/CMS/Recordlist/LinkBrowser';
interface RsaEncryption {
  registerForm(form: HTMLElement): void;
}
declare module 'TYPO3/CMS/Rsaauth/RsaEncryptionModule' {
  const _exported: RsaEncryption;
  export default _exported;
}
declare module 'TYPO3/CMS/Dashboard/Contrib/chartjs';

interface JQueryTypedEvent<T extends Event> extends JQueryEventObject {
  originalEvent: T;
}

/**
 * Required to make jQuery plugins "available" in TypeScript
 */
interface JQuery {
  datetimepicker(options?: any): JQuery;

  dragUploader(options?: any): JQuery;

  t3FormEngineFlexFormElement(options?: any): JQuery;

  // To be able to use devbridge-autocomplete we have to override the definition of jquerui
  autocomplete(options?: { [key: string]: any }): any;
  disablePagingAction(): void;
}
