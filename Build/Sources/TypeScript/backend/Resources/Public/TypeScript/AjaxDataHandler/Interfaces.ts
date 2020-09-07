import SimpleResponseInterface from 'TYPO3/CMS/Core/Ajax/SimpleResponseInterface';
import ResponseInterface from 'TYPO3/CMS/Backend/AjaxDataHandler/ResponseInterface';
import {GenericKeyValue} from 'TYPO3/CMS/Core/Ajax/InputTransformer';

export declare type AjaxDataHandlerProcessMessage = {
  hasErrors: boolean;
  response: Response | SimpleResponseInterface;
  result?: ResponseInterface | any;
} | AjaxDataHandlerProcessEventDict | AjaxDataHandlerScope;

export interface AjaxDataHandlerScope {
  processToken: string;
  parameters: string | Array<string> | GenericKeyValue;
  action: string;
}

export declare type AjaxDataHandlerProcessEventDict = {
  component: string;
  action: string;
} | AjaxDataHandlerRecord | AjaxDataHandlerElement;

export interface AjaxDataHandlerRecord {
  table: string;
  uid: number;
}

export interface AjaxDataHandlerElement {
  elementIdentifier: string;
}

export interface AjaxDataHandlerInstruction extends AjaxDataHandlerScope, AjaxDataHandlerElement {
}
