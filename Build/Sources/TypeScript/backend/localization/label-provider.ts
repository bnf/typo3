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

//import { IntlMessageFormat, PART_TYPE, type PrimitiveType, type FormatXMLElementFn } from 'intl-messageformat';
import { IntlMessageFormat, type PrimitiveType, type FormatXMLElementFn } from 'intl-messageformat';
//import { IntlMessageFormat, type PrimitiveType } from 'intl-messageformat';
//import type { TemplateResult } from 'lit';

//type NamedParameters<T> = Record<string, PrimitiveType | FormatXMLElementFn<T>>;
type NamedParametersIn = Record<string, PrimitiveType | ((chunks: unknown[]) => unknown)>;
//type NamedParameters<T> = Record<string, PrimitiveType | FormatXMLElementFn<T>>;
type SprintfParameters = Array<string|number>;

/*
type TemplatedParameters<Type, T> = {
  //[Property in keyof Type]: Type[Property] extends Function ? (chunks: (string|T)[]) => T : Type[Property];
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  [Property in keyof Type]: Type[Property] extends Function ? FormatXMLElementFn<T> : Type[Property];
  //[Property in keyof Type]: FormatXMLElementFn<T>;

  //[Property in keyof Type]: Type[Property] extends (() => void) ? FormatXMLElementFn<T> : Type[Property];
};
*/

type TemplatedParameters2<Type, T> = {
  //[Property in keyof Type]: Type[Property] extends Function ? (chunks: (string|T)[]) => T : Type[Property];
  //[Property in keyof Type]: Type[Property] extends Function ? FormatXMLElementFn<T> : Type[Property]|T;
  //[Property in keyof Type]: Type[Property] extends (() => void) ? FormatXMLElementFn<T> : Type[Property]|T;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  [Property in keyof Type]: Type[Property] extends Function ? FormatXMLElementFn<T> : (Type[Property] extends string ? Type[Property]|T : Type[Property]);
  //[Property in keyof Type]: FormatXMLElementFn<T>;

  //[Property in keyof Type]: Type[Property] extends (() => void) ? FormatXMLElementFn<T> : Type[Property];
};

/*
type CreateMutable<Type> = {
  -readonly [Property in keyof Type]: Type[Property];
};
*/

/*
type MapTemplatedParameters<Type, T> = {
  [Property in keyof Type]: TemplatedParameters<Type[Property], T>;
};
*/

//export class LabelProvider<LabelParameterMap extends Record<string, NamedParameters<string>|SprintfParameters|undefined>> {
export class LabelProvider<LabelParameterMap extends Record<string, NamedParametersIn|SprintfParameters|undefined>> {
  constructor(
    private readonly labels: Record<keyof LabelParameterMap, string>
  ) {}

  public get<K extends keyof LabelParameterMap>(
    key: K,
    // Workaround to ensure that TypeScript enforces the exact number of parameters
    // Note: `args?` allows to omit parameters, when they are actually required.
    ...args: (LabelParameterMap[K] extends undefined ? [] : [Readonly<TemplatedParameters2<LabelParameterMap[K], never>>])
  ): string;

  public get<K extends keyof LabelParameterMap>(
    key: K,
    args?: Readonly<TemplatedParameters2<LabelParameterMap[K], never>>,
  ): string {
    /*
    if (!(key in this.labels)) {
      throw new Error('Label is not defined: ' + String(key));
    }

    const label = this.labels[key];

    if (args === undefined) {
      return label;
    }

    if (Array.isArray(args)) {
      return this.sprintf(label, args);
    }

    // @todo get rid of `as string`, upstream `string | string[]` return type declaration is wrong:
    // https://github.com/formatjs/formatjs/blob/011a6e5d33b3ae09762b5316b07a2df5e4b4ce66/packages/intl-messageformat/src/core.ts#L157
    return new IntlMessageFormat(label, document.documentElement.lang).format<string>(args as NamedParameters) as string;
    */

    const res = this.render<K, never>(key, args);
    //const res = this.render<K, string>(key, args as any);
    return Array.isArray(res) ? res.join('') : res;
  }

  public render<K extends keyof LabelParameterMap, T extends object|never>(
    key: K,
    args: TemplatedParameters2<LabelParameterMap[K], T>,
  ): string | T | Array<string | T> {
    if (!(key in this.labels)) {
      throw new Error('Label is not defined: ' + String(key));
    }

    const label = this.labels[key];

    if (args === undefined) {
      return label;
    }

    if (Array.isArray(args)) {
      return this.sprintf(label, args);
    }

    // @todo get rid of `as string`, upstream `string | string[]` return type declaration is wrong:
    // https://github.com/formatjs/formatjs/blob/011a6e5d33b3ae09762b5316b07a2df5e4b4ce66/packages/intl-messageformat/src/core.ts#L157
    //const parts = new IntlMessageFormat(label, document.documentElement.lang).formatToParts<T>(args as CreateMutable<typeof args>);
    const parts = new IntlMessageFormat(label, document.documentElement.lang).formatToParts<T>(args as Record<string, PrimitiveType | T | FormatXMLElementFn<T>>);

    // Hot path for straight simple msg translations
    if (parts.length === 1) {
      return parts[0].value;
    }
    return parts.map(part => part.value);
    //return parts.reduce((all, part) => [...all, part.value], []);
  }

  private sprintf(
    label: string,
    args: Readonly<SprintfParameters>
  ): string {
    // code taken from lit-helper
    let index = 0;
    return label.replace(/%[sdf]/g, (match) => {
      const arg = args[index++];
      switch (match) {
        case '%s':
          return String(arg);
        case '%d':
          return String(typeof arg === 'number' ? arg : parseInt(String(arg), 10));
        case '%f':
          return String(typeof arg === 'number' ? arg : parseFloat(arg).toFixed(2));
        default:
          return match;
      }
    });
  }
}
