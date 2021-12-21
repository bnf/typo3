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
  export let WindowManager: any;
  export let Wizard: any;
  export let WorkspacesMenu: any;
  export let settings: any;
  export const lang: { [key: string]: string };
  export const configuration: any;
  export namespace CMS {
    export namespace Core {
      export class JavaScriptHandler {
        public processItems(data: string|any[], isParsed?: boolean): void;
        public globalAssignment(data: string|any, isParsed?: boolean): void;
        public javaScriptModuleInstruction(data: string|any, isParsed?: boolean): void;
      }
    }

    export namespace Backend {
      export class FormEngineValidation {
        public USmode: number;
        public readonly errorClass: string;
        public markFieldAsChanged(field: HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement|JQuery): void;
        public trimExplode(delimiter: string, string: string): Array<string>;
        public parseInt(value: number|string|boolean): number;
        public parseDouble(value: number|string|boolean): string;
        public ltrim(value: string): string;
        public btrim(value: string): string;
        public getYear(timeObj: Date): number|null;
        public getDate(timeObj: Date): number;
        public splitStr(theStr1: string, delim: string, index: number): Array<string>;
        public initializeInputFields(): void;
        public registerCustomEvaluation(name: string, handler: Function): void;
        public formatValue(type: string, value: string|number, config: Object): string;
        public validate(section?: Element): void;
        public validateField(field: HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement|JQuery, value?: string): void;
        public processValue(command: string, value: string, config: Object): string;
        public initialize(): void;
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

      // @todo transform to proper interface, once FormEngine.js is migrated to TypeScript
      export interface OnFieldChangeItem {
        name: string;
        data: {[key: string]: string|number|boolean|null}
      }

      export class FormEngine {
        public readonly Validation: FormEngineValidation;
        public legacyFieldChangedCb(): void;
        public getFieldElement(fieldName: string, appendix?: string, noFallback?: boolean): JQuery;
        public updateHiddenFieldValueFromSelect(selectFieldEl: HTMLElement, originalFieldEl: HTMLElement): void;
        public preventFollowLinkIfNotSaved(href: string): boolean;
        public initializeNullNoPlaceholderCheckboxes(): void;
        public initializeNullWithPlaceholderCheckboxes(): void;
        public requestFormEngineUpdate(askForUpdate: boolean): void
        public processOnFieldChange(items: OnFieldChangeItem[]): void
      }

      export class MultiStepWizard {
        public addSlide(identifier: string, title: string, content: string, severity: number, callback?: Function): MultiStepWizard;
        public lockNextStep(): JQuery;
        public unlockNextStep(): JQuery;
        public lockPrevStep(): JQuery;
        public unlockPrevStep(): JQuery;
        public blurCancelStep(): JQuery;
        public getComponent(): JQuery;
        public addFinalProcessingSlide(callback?: Function): Promise<void>;
        public show(): MultiStepWizard;
        public dismiss(): MultiStepWizard;
      }
    }
  }
}

/**
 * Current AMD/RequireJS modules are returning *instances* of ad-hoc *classes*, make that known to TypeScript
 */

declare module 'TYPO3/CMS/Core/JavaScriptHandler' {
  const _exported: TYPO3.CMS.Core.JavaScriptHandler;
  export = _exported;
}

declare module 'TYPO3/CMS/Backend/FormEngineValidation' {
  const _exported: TYPO3.CMS.Backend.FormEngineValidation;
  export = _exported;
}

declare module 'TYPO3/CMS/Backend/FormEngine' {
  const _exported: TYPO3.CMS.Backend.FormEngine;
  export = _exported;
}

// type definition for global namespace object
interface Window {
  TYPO3: any;
  $: any; // only required in ImageManipulation.ts
  require: Function;
  list_frame: Window;
  jump: Function;

  // required for Paste.ts
  // TODO these should be passed as data attributes
  pasteAfterLinkTemplate: string;
  pasteIntoLinkTemplate: string;
}

/**
 * Needed type declarations for provided libs
 */
declare module 'muuri';
declare module 'codemirror';
declare module 'flatpickr/flatpickr.min';
declare module 'flatpickr/locales';
declare module 'moment';
declare module 'TYPO3/CMS/Backend/LegacyTree';
declare module 'TYPO3/CMS/Install/chosen.jquery.min';
declare module 'TYPO3/CMS/Recordlist/LinkBrowser';
declare module 'TYPO3/CMS/Dashboard/Contrib/chartjs';
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

interface JQueryTypedEvent<T extends Event> extends JQueryEventObject {
  originalEvent: T;
}

/**
 * Required to make jQuery plugins "available" in TypeScript
 */
interface JQuery {
  datetimepicker(options?: any): JQuery;

  dragUploader(options?: any): JQuery;

  // To be able to use devbridge-autocomplete we have to override the definition of jquerui
  autocomplete(options?: { [key: string]: any }): any;
  disablePagingAction(): void;
}

interface JQueryStatic {
  escapeSelector(selector: string): string;
}
