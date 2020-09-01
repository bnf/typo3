import ThrottleEvent from '../../../../core/Resources/Public/JavaScript/Event/ThrottleEvent.esm.js';
import documentService from '../../../../core/Resources/Public/JavaScript/DocumentService.esm.js';
import Persistent from './Storage/Persistent.esm.js';
import flatpickr from '../../../../core/Resources/Public/JavaScript/Contrib/flatpickr/flatpickr.min.esm.js';
import __import_moment from '../../../../core/Resources/Public/JavaScript/Contrib/moment.esm.js';

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
 * Module: TYPO3/CMS/Backend/DateTimePicker
 * contains all logic for the date time picker used in FormEngine
 * and EXT:belog and EXT:scheduler
 */
class DateTimePicker {
    constructor(selector) {
        var _a;
        this.fieldSelector = '.t3js-datetimepicker';
        this.format = (typeof ((_a = opener === null || opener === void 0 ? void 0 : opener.top) === null || _a === void 0 ? void 0 : _a.TYPO3) !== 'undefined' ? opener.top : top).TYPO3.settings.DateTimePicker.DateFormat;
        documentService.ready().then(() => {
            this.initialize(selector);
        });
    }
    /**
     * Format a given date for the hidden FormEngine field
     *
     * Format the value for the hidden field that is passed on to the backend, i.e. most likely DataHandler.
     * The format for that is the timestamp for time fields, and a full-blown ISO-8601 timestamp for all date-related fields.
     *
     * @param {moment} date
     * @param {string} type
     * @returns {string}
     */
    static formatDateForHiddenField(date, type) {
        if (type === 'time' || type === 'timesec') {
            date.year(1970).month(0).date(1);
        }
        return date.format();
    }
    /**
     * initialize date fields to add a datepicker to each field
     * note: this function can be called multiple times (e.g. after AJAX requests) because it only
     * applies to fields which haven't been used yet.
     */
    initialize(element) {
        let dateTimePickers;
        if (element instanceof HTMLElement) {
            if (element.dataset.datepickerInitialized !== 'undefined') {
                return;
            }
            dateTimePickers = [element];
        }
        else {
            console.warn('Initializing all date pickers globally has been marked as deprecated. Please pass a specific element.');
            dateTimePickers = Array.from(document.querySelectorAll(element || this.fieldSelector)).filter((inputElement) => {
                return typeof inputElement.dataset.datepickerInitialized === 'undefined';
            });
        }
        if (dateTimePickers.length === 0) {
            return;
        }
        let userLocale = Persistent.get('lang');
        if (userLocale === '') {
            userLocale = 'default';
        }
        else if (userLocale === 'ch') {
            // Fix our made up locale "ch"
            userLocale = 'zh';
        }
        dateTimePickers.forEach((inputElement) => {
            inputElement.dataset.datepickerInitialized = '1';
            import('../../../../core/Resources/Public/JavaScript/Contrib/flatpickr/locales.esm.js').then(() => {
                this.initializeField(inputElement, userLocale);
            });
        });
    }
    /**
     * Initialize a single field
     *
     * @param {HTMLInputElement} inputElement
     * @param {string} locale
     */
    initializeField(inputElement, locale) {
        const scrollEvent = this.getScrollEvent();
        const options = this.getDateOptions(inputElement);
        options.locale = locale;
        options.onOpen = [
            () => {
                scrollEvent.bindTo(document.querySelector('.t3js-module-body'));
            }
        ];
        options.onClose = () => {
            scrollEvent.release();
        };
        // initialize the date time picker on this element
        const dateTimePicker = flatpickr(inputElement, options);
        inputElement.addEventListener('input', () => {
            // Update selected date in picker
            const value = dateTimePicker._input.value;
            const parsedDate = dateTimePicker.parseDate(value);
            const formattedDate = dateTimePicker.formatDate(parsedDate, dateTimePicker.config.dateFormat);
            if (value === formattedDate) {
                dateTimePicker.setDate(value);
            }
        });
        inputElement.addEventListener('change', (e) => {
            e.stopImmediatePropagation();
            const target = e.target;
            const hiddenField = inputElement.parentElement.parentElement.querySelector('input[type="hidden"]');
            if (target.value !== '') {
                const type = target.dataset.dateType;
                const date = __import_moment.utc(target.value, target._flatpickr.config.dateFormat);
                if (date.isValid()) {
                    hiddenField.value = DateTimePicker.formatDateForHiddenField(date, type);
                }
                else {
                    target.value = DateTimePicker.formatDateForHiddenField(__import_moment.utc(hiddenField.value), type);
                }
            }
            else {
                hiddenField.value = '';
            }
            target.dispatchEvent(new Event('formengine.dp.change'));
        });
    }
    /**
     * Due to some whack CSS the scrollPosition of the document stays 0 which renders a stuck date time picker.
     * Because of this the position is recalculated on scrolling `.t3js-module-body`.
     *
     * @return {ThrottleEvent}
     */
    getScrollEvent() {
        return new ThrottleEvent('scroll', () => {
            const activeFlatpickrElement = document.querySelector('.flatpickr-input.active');
            if (activeFlatpickrElement === null) {
                return;
            }
            const bounds = activeFlatpickrElement.getBoundingClientRect();
            const additionalOffset = 2;
            const calendarHeight = activeFlatpickrElement._flatpickr.calendarContainer.offsetHeight;
            const distanceFromBottom = window.innerHeight - bounds.bottom;
            const showOnTop = distanceFromBottom < calendarHeight && bounds.top > calendarHeight;
            let newPosition;
            let arrowClass;
            if (showOnTop) {
                newPosition = bounds.y - calendarHeight - additionalOffset;
                arrowClass = 'arrowBottom';
            }
            else {
                newPosition = bounds.y + bounds.height + additionalOffset;
                arrowClass = 'arrowTop';
            }
            activeFlatpickrElement._flatpickr.calendarContainer.style.top = newPosition + 'px';
            activeFlatpickrElement._flatpickr.calendarContainer.classList.remove('arrowBottom', 'arrowTop');
            activeFlatpickrElement._flatpickr.calendarContainer.classList.add(arrowClass);
        }, 15);
    }
    /**
     * Initialize a single field
     *
     * @param {HTMLInputElement} inputElement
     */
    getDateOptions(inputElement) {
        const format = this.format;
        const type = inputElement.dataset.dateType;
        const options = {
            allowInput: true,
            dateFormat: '',
            defaultDate: inputElement.value,
            enableSeconds: false,
            enableTime: false,
            formatDate: (date, format) => {
                return __import_moment(date).format(format);
            },
            parseDate: (datestr, format) => {
                return __import_moment(datestr, format, true).toDate();
            },
            maxDate: '',
            minDate: '',
            minuteIncrement: 1,
            noCalendar: false,
            weekNumbers: true,
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
                options.dateFormat = 'Y';
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
var DateTimePicker$1 = new DateTimePicker();

export default DateTimePicker$1;
