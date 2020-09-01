define(['require', 'jquery', './Storage/Persistent', 'moment'], function (require, $, Persistent, moment) { 'use strict';

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    function _interopNamespace(e) {
        if (e && e.__esModule) { return e; } else {
            var n = Object.create(null);
            if (e) {
                Object.keys(e).forEach(function (k) {
                    if (k !== 'default') {
                        var d = Object.getOwnPropertyDescriptor(e, k);
                        Object.defineProperty(n, k, d.get ? d : {
                            enumerable: true,
                            get: function () {
                                return e[k];
                            }
                        });
                    }
                });
            }
            n['default'] = e;
            return Object.freeze(n);
        }
    }

    var $__default = /*#__PURE__*/_interopDefaultLegacy($);
    var moment__default = /*#__PURE__*/_interopDefaultLegacy(moment);

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
            this.fieldSelector = '.t3js-datetimepicker';
            this.format = (opener != null && typeof opener.top.TYPO3 !== 'undefined' ? opener.top : top)
                .TYPO3.settings.DateTimePicker.DateFormat;
            $__default['default'](() => {
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
        initialize(selector) {
            // fetch the date time fields that haven't been initialized yet
            const $dateTimeFields = $__default['default'](selector || this.fieldSelector).filter((index, element) => {
                return typeof $__default['default'](element).data('DateTimePicker') === 'undefined';
            });
            if ($dateTimeFields.length > 0) {
                new Promise(function (resolve, reject) { require(['twbs/bootstrap-datetimepicker'], function (m) { resolve(/*#__PURE__*/_interopNamespace(m)); }, reject) }).then(() => {
                    let userLocale = Persistent.get('lang');
                    // Fix our made up locale "ch"
                    if (userLocale === 'ch') {
                        userLocale = 'zh-cn';
                    }
                    const setLocale = userLocale ? moment__default['default'].locale(userLocale) : '';
                    // initialize the datepicker on each selected element
                    $dateTimeFields.each((index, element) => {
                        this.initializeField($__default['default'](element), setLocale);
                    });
                    $dateTimeFields.on('blur', (e) => {
                        const $element = $__default['default'](e.currentTarget);
                        const $hiddenField = $element.parent().parent().find('input[type="hidden"]');
                        if ($element.val() === '') {
                            $hiddenField.val('');
                        }
                        else {
                            const type = $element.data('dateType');
                            const format = $element.data('DateTimePicker').format();
                            const date = moment__default['default'].utc($element.val(), format);
                            if (date.isValid()) {
                                $hiddenField.val(DateTimePicker.formatDateForHiddenField(date, type));
                            }
                            else {
                                $element.val(DateTimePicker.formatDateForHiddenField(moment__default['default'].utc($hiddenField.val()), type));
                            }
                        }
                    });
                    // on datepicker change, write the selected date with the timezone offset to the hidden field
                    $dateTimeFields.on('dp.change', (e) => {
                        const $element = $__default['default'](e.currentTarget);
                        const $hiddenField = $element.parent().parent().find('input[type=hidden]');
                        const type = $element.data('dateType');
                        let value = '';
                        if ($element.val() !== '') {
                            value = DateTimePicker.formatDateForHiddenField(e.date.utc(), type);
                        }
                        $hiddenField.val(value);
                        $__default['default'](document).trigger('formengine.dp.change', [$element]);
                    });
                });
            }
        }
        /**
         * Initialize a single field
         *
         * @param {JQuery} $element
         * @param {string} locale
         */
        initializeField($element, locale) {
            const format = this.format;
            const type = $element.data('dateType');
            const options = {
                format: '',
                locale: '',
                sideBySide: true,
                showTodayButton: true,
                toolbarPlacement: 'bottom',
                icons: {
                    time: 'fa fa-clock-o',
                    date: 'fa fa-calendar',
                    up: 'fa fa-chevron-up',
                    down: 'fa fa-chevron-down',
                    previous: 'fa fa-chevron-left',
                    next: 'fa fa-chevron-right',
                    today: 'fa fa-calendar-o',
                    clear: 'fa fa-trash',
                },
            };
            // set options based on type
            switch (type) {
                case 'datetime':
                    options.format = format[1];
                    break;
                case 'date':
                    options.format = format[0];
                    break;
                case 'time':
                    options.format = 'HH:mm';
                    break;
                case 'timesec':
                    options.format = 'HH:mm:ss';
                    break;
                case 'year':
                    options.format = 'YYYY';
                    break;
                default:
            }
            // datepicker expects the min and max dates to be formatted with options.format but unix timestamp given
            if ($element.data('dateMindate')) {
                $element.data('dateMindate', moment__default['default'].unix($element.data('dateMindate')).format(options.format));
            }
            if ($element.data('dateMaxdate')) {
                $element.data('dateMaxdate', moment__default['default'].unix($element.data('dateMaxdate')).format(options.format));
            }
            if (locale) {
                options.locale = locale;
            }
            // initialize the date time picker on this element
            $element.datetimepicker(options);
        }
    }
    var DateTimePicker$1 = new DateTimePicker();

    return DateTimePicker$1;

});
