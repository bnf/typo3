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

import flatpickr from 'flatpickr/flatpickr.min';
import ShortcutButtonsPlugin from 'flatpickr/plugins/shortcut-buttons.min';
import { DateTime } from 'luxon';

interface FlatpickrInputElement extends HTMLInputElement {
  _flatpickr: any;
}

/**
 * Module: @typo3/backend/date-time-picker
 * contains all logic for the date time picker used in FormEngine
 * and EXT:belog and EXT:scheduler
 */
class DateTimePicker {
  private readonly format: string = (typeof opener?.top?.TYPO3 !== 'undefined' ? opener.top : top).TYPO3.settings.DateTimePicker.DateFormat;

  /**
   * Format a given date for the hidden FormEngine field
   *
   * Format the value for the hidden field that is passed on to the backend, i.e. most likely DataHandler.
   * The format for that is the timestamp for time fields, and a full-blown ISO-8601 timestamp for all date-related fields.
   *
   * @param {DateTime} date
   * @param {string} type
   * @returns {string}
   */
  private static formatDateForHiddenField(date: DateTime, type: string): string {
    if (type === 'time' || type === 'timesec') {
      date = date.set({
        year: 1970,
        month: 1,
        day: 1
      });
    }
    return date.toISO({ suppressMilliseconds: true });
  }

  /**
   * initialize date fields to add a datepicker to each field
   * note: this function can be called multiple times (e.g. after AJAX requests) because it only
   * applies to fields which haven't been used yet.
   */
  public initialize(element: HTMLInputElement): void {
    if (!(element instanceof HTMLInputElement) || typeof element.dataset.datepickerInitialized !== 'undefined') {
      return;
    }

    let userLocale = document.documentElement.lang;
    if (!userLocale || userLocale === 'en') {
      // flatpickr's English localization is "default"
      userLocale = 'default';
    } else if (userLocale === 'ch') {
      // Fix our made up locale "ch"
      userLocale = 'zh';
    }

    element.dataset.datepickerInitialized = '1';
    import('flatpickr/locales').then((): void => {
      this.initializeField(element, userLocale);
    });
  }

  /**
   * Initialize a single field
   *
   * @param {HTMLInputElement} inputElement
   * @param {string} locale
   */
  private initializeField(inputElement: HTMLInputElement, locale: string): void {
    const options = this.getDateOptions(inputElement);
    options.locale = locale;

    // initialize the date time picker on this element
    const dateTimePicker = flatpickr(inputElement, options);

    inputElement.addEventListener('input', (): void => {
      // Update selected date in picker
      const value = dateTimePicker._input.value;
      const parsedDate = dateTimePicker.parseDate(value);
      const formattedDate = dateTimePicker.formatDate(parsedDate, dateTimePicker.config.dateFormat);

      if (value === formattedDate) {
        dateTimePicker.setDate(value);
      }
    });

    inputElement.addEventListener('keyup', (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        dateTimePicker.close();
      }
    });

    inputElement.addEventListener('change', (e: Event): void => {
      e.stopImmediatePropagation();

      const target = (e.target as FlatpickrInputElement);
      const hiddenField = inputElement.parentElement.parentElement.querySelector('input[type="hidden"]') as HTMLInputElement;

      if (target.value !== '') {
        const type = target.dataset.dateType;
        const date = DateTime.fromFormat(target.value, target._flatpickr.config.dateFormat, { zone: 'utc' });
        if (date.isValid) {
          hiddenField.value = DateTimePicker.formatDateForHiddenField(date, type);
        } else {
          target.value = DateTimePicker.formatDateForHiddenField(DateTime.fromISO(hiddenField.value, { zone: 'utc' }), type);
        }
      } else {
        hiddenField.value = '';
      }

      target.dispatchEvent(new Event('formengine.dp.change'));
    });
  }

  /**
   * Initialize a single field
   *
   * @param {HTMLInputElement} inputElement
   */
  private getDateOptions(inputElement: HTMLInputElement): { [key: string]: any } {
    const format = this.format;
    const type = inputElement.dataset.dateType;
    const now = new Date();
    const options = {
      allowInput: true,
      dateFormat: '',
      defaultDate: inputElement.value,
      defaultHour: now.getHours(),
      defaultMinute: now.getMinutes(),
      enableSeconds: false,
      enableTime: false,
      formatDate: (date: Date, format: string) => {
        return DateTime.fromJSDate(date).toFormat(format);
      },
      parseDate: (datestr: string, format: string): Date => {
        return DateTime.fromFormat(datestr, format).toJSDate();
      },
      maxDate: '',
      minDate: '',
      minuteIncrement: 1,
      noCalendar: false,
      weekNumbers: true,
      time_24hr: !Intl.DateTimeFormat(navigator.language, { hour: 'numeric' }).resolvedOptions().hour12,
      plugins: [
        ShortcutButtonsPlugin({
          theme: 'typo3',
          button: [
            {
              label: top.TYPO3.lang['labels.datepicker.today'] || 'Today'
            },
          ],
          onClick: (index: number, fp: any) => {
            fp.setDate(new Date(), true);
          }
        })
      ],
    };

    // set options based on type
    switch (type) {
      case 'datetime':
        options.dateFormat = format[1];
        options.enableTime = true;
        break;
      case 'date':
        options.dateFormat = format[0];
        break;
      case 'time':
        options.dateFormat = 'HH:mm';
        options.enableTime = true;
        options.noCalendar = true;
        break;
      case 'timesec':
        options.dateFormat = 'HH:mm:ss';
        options.enableSeconds = true;
        options.enableTime = true;
        options.noCalendar = true;
        break;
      case 'year':
        options.dateFormat = 'yyyy';
        break;
      default:
    }

    if (inputElement.dataset.dateMindate !== 'undefined') {
      options.minDate = inputElement.dataset.dateMindate;
    }
    if (inputElement.dataset.dateMaxdate !== 'undefined') {
      options.maxDate = inputElement.dataset.dateMaxdate;
    }

    return options;
  }
}

export default new DateTimePicker();
