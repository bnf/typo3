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

import { IntlMessageFormat, type PrimitiveType, type FormatXMLElementFn } from 'intl-messageformat';
import type { DateConfiguration } from '@typo3/backend/type/date-configuration';

type ChunkCallback = (chunks: unknown[]) => unknown;
type NamedParameters = Record<string, PrimitiveType | ChunkCallback>;
type SprintfParameters = Array<string|number>;

type TemplatedParameters<Type, T> = {
  [Property in keyof Type]: Type[Property] extends ChunkCallback
    // Map the ChunkCallback (that contains `unknown` type) to allow `T`
    ? FormatXMLElementFn<T>
    // Allow type T (e.g. lit TemplateResult) for all values that are a string
    : (Type[Property] extends string ? Type[Property]|T : Type[Property]);
};

export class LabelProvider<LabelParameterMap extends Record<string, NamedParameters|SprintfParameters|undefined>> {

  private readonly cache: Partial<Record<string, IntlMessageFormat>> = {};

  constructor(
    private readonly labels: Record<keyof LabelParameterMap, string>
  ) {}

  public get<K extends keyof LabelParameterMap>(
    key: K,
    // Workaround to ensure that TypeScript enforces the exact number of parameters
    // Note: `args?` allows to omit parameters, when they are actually required.
    ...args: (LabelParameterMap[K] extends undefined ? [] : [Readonly<TemplatedParameters<LabelParameterMap[K], never>>])
  ): string;

  public get<K extends keyof LabelParameterMap>(
    key: K,
    args?: Readonly<TemplatedParameters<LabelParameterMap[K], never>>,
  ): string {
    const res = this.render<K, never>(key, args);
    return Array.isArray(res) ? res.join('') : res;
  }

  public render<K extends keyof LabelParameterMap, T extends object|never>(
    key: K,
    args: Readonly<TemplatedParameters<LabelParameterMap[K], T>>,
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

    const parts = this.getFormatter(label).formatToParts<T>(args as Record<string, PrimitiveType | T | FormatXMLElementFn<T>>);

    // Hot path for straight simple msg translations
    if (parts.length === 1) {
      return parts[0].value;
    }
    return parts.map(part => part.value);
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

  private getFormatter(label: string): IntlMessageFormat {
    return (this.cache[label] ??= this.createFormatter(label));
  }

  private createFormatter(label: string): IntlMessageFormat {
    const timeZone = this.getConfiguredTimezone();
    const dateTimeConfig = { short: { timeZone }, medium: { timeZone }, long: { timeZone }, full: { timeZone } };
    return new IntlMessageFormat(
      label,
      document.documentElement.lang,
      {
        date: dateTimeConfig,
        time: dateTimeConfig,
      }
    );
  }

  private getConfiguredTimezone(): string|undefined {
    return this.getConfiguredDateFormats()?.timezone ?? undefined;
  }

  private getConfiguredDateFormats(): DateConfiguration | null {
    try {
      const root = (typeof opener?.top?.TYPO3 !== 'undefined' ? opener.top : top);
      return root.TYPO3.settings.DateConfiguration;
    } catch {
      return null;
    }
  }
}
