import jQuery from '../../../../core/Resources/Public/JavaScript/Contrib/jquery/jquery.esm.js';
import Modal from '../../../../backend/Resources/Public/JavaScript/Modal.esm.js';
import { MessageUtility } from '../../../../backend/Resources/Public/JavaScript/Utility/MessageUtility.esm.js';
import DocumentSaveActions from '../../../../backend/Resources/Public/JavaScript/DocumentSaveActions.esm.js';
import '../../../../core/Resources/Public/JavaScript/Contrib/tablesort.esm.js';

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
 * Module: TYPO3/CMS/Scheduler/Scheduler
 * @exports TYPO3/CMS/Scheduler/Scheduler
 */
class Scheduler {
    constructor() {
        this.allCheckedStatus = false;
        /**
         * This method reacts on changes to the task class
         * It switches on or off the relevant extra fields
         */
        this.actOnChangedTaskClass = (theSelector) => {
            let taskClass = theSelector.val();
            taskClass = taskClass.toLowerCase().replace(/\\/g, '-');
            // Hide all extra fields
            jQuery('.extraFields').hide();
            // Show only relevant extra fields
            jQuery('.extra_fields_' + taskClass).show();
        };
        /**
         * This method reacts on changes to the type of a task, i.e. single or recurring
         */
        this.actOnChangedTaskType = (evt) => {
            this.toggleFieldsByTaskType(jQuery(evt.currentTarget).val());
        };
        /**
         * This method reacts on field changes of all table field for table garbage collection task
         */
        this.actOnChangeSchedulerTableGarbageCollectionAllTables = (theCheckbox) => {
            let $numberOfDays = jQuery('#task_tableGarbageCollection_numberOfDays');
            let $taskTableGarbageCollectionTable = jQuery('#task_tableGarbageCollection_table');
            if (theCheckbox.prop('checked')) {
                $taskTableGarbageCollectionTable.prop('disabled', true);
                $numberOfDays.prop('disabled', true);
            }
            else {
                // Get number of days for selected table
                let numberOfDays = parseInt($numberOfDays.val(), 10);
                if (numberOfDays < 1) {
                    let selectedTable = $taskTableGarbageCollectionTable.val();
                    if (typeof (defaultNumberOfDays[selectedTable]) !== 'undefined') {
                        numberOfDays = defaultNumberOfDays[selectedTable];
                    }
                }
                $taskTableGarbageCollectionTable.prop('disabled', false);
                if (numberOfDays > 0) {
                    $numberOfDays.prop('disabled', false);
                }
            }
        };
        /**
         * This methods set the 'number of days' field to the default expire period
         * of the selected table
         */
        this.actOnChangeSchedulerTableGarbageCollectionTable = (theSelector) => {
            let $numberOfDays = jQuery('#task_tableGarbageCollection_numberOfDays');
            if (defaultNumberOfDays[theSelector.val()] > 0) {
                $numberOfDays.prop('disabled', false);
                $numberOfDays.val(defaultNumberOfDays[theSelector.val()]);
            }
            else {
                $numberOfDays.prop('disabled', true);
                $numberOfDays.val(0);
            }
        };
        /**
         * Check or uncheck all checkboxes
         */
        this.checkOrUncheckAllCheckboxes = (theSelector) => {
            theSelector.parents('.tx_scheduler_mod1_table').find(':checkbox').prop('checked', !this.allCheckedStatus);
            this.allCheckedStatus = !this.allCheckedStatus;
            return false;
        };
        /**
         * Toggle the relevant form fields by task type
         */
        this.toggleFieldsByTaskType = (taskType) => {
            // Single task option = 1, Recurring task option = 2
            taskType = parseInt(taskType + '', 10);
            jQuery('#task_end_col').toggle(taskType === 2);
            jQuery('#task_frequency_row').toggle(taskType === 2);
        };
        /**
         * Toggle the visibility of task groups by clicking anywhere on the
         * task group header
         */
        this.toggleTaskGroups = (theSelector) => {
            let taskGroup = theSelector.data('task-group-id');
            jQuery('#recordlist-task-group-' + taskGroup).collapse('toggle');
        };
        /**
         * Registers listeners
         */
        this.initializeEvents = () => {
            jQuery('.checkall').on('click', (evt) => {
                this.checkOrUncheckAllCheckboxes(jQuery(evt.currentTarget));
            });
            jQuery('#task_class').on('change', (evt) => {
                this.actOnChangedTaskClass(jQuery(evt.currentTarget));
            });
            jQuery('#task_type').on('change', this.actOnChangedTaskType);
            jQuery('#task_tableGarbageCollection_allTables').on('change', (evt) => {
                this.actOnChangeSchedulerTableGarbageCollectionAllTables(jQuery(evt.currentTarget));
            });
            jQuery('#task_tableGarbageCollection_table').on('change', (evt) => {
                this.actOnChangeSchedulerTableGarbageCollectionTable(jQuery(evt.currentTarget));
            });
            jQuery('[data-update-task-frequency]').on('change', (evt) => {
                const $target = jQuery(evt.currentTarget);
                const $taskFrequency = jQuery('#task_frequency');
                $taskFrequency.val($target.val());
                $target.val($target.attr('value')).trigger('blur');
            });
            const taskGroupTable = document.querySelector('table.taskGroup-table');
            if (taskGroupTable !== null) {
                new Tablesort(taskGroupTable);
            }
            jQuery(document).on('click', '.t3js-element-browser', (e) => {
                e.preventDefault();
                const el = e.currentTarget;
                Modal.advanced({
                    type: Modal.types.iframe,
                    content: el.href + '&mode=' + el.dataset.mode + '&bparams=' + el.dataset.params,
                    size: Modal.sizes.large
                });
            });
            window.addEventListener('message', this.listenOnElementBrowser);
        };
        /**
         * Initialize default states
         */
        this.initializeDefaultStates = () => {
            let $taskType = jQuery('#task_type');
            if ($taskType.length) {
                this.toggleFieldsByTaskType($taskType.val());
            }
            let $taskClass = jQuery('#task_class');
            if ($taskClass.length) {
                this.actOnChangedTaskClass($taskClass);
                Scheduler.updateElementBrowserTriggers();
            }
        };
        this.listenOnElementBrowser = (e) => {
            if (!MessageUtility.verifyOrigin(e.origin)) {
                throw 'Denied message sent by ' + e.origin;
            }
            if (e.data.actionName === 'typo3:elementBrowser:elementAdded') {
                if (typeof e.data.fieldName === 'undefined') {
                    throw 'fieldName not defined in message';
                }
                if (typeof e.data.value === 'undefined') {
                    throw 'value not defined in message';
                }
                const result = e.data.value.split('_');
                const field = document.querySelector('input[name="' + e.data.fieldName + '"]');
                field.value = result[1];
            }
        };
        this.initializeEvents();
        this.initializeDefaultStates();
        DocumentSaveActions.getInstance().addPreSubmitCallback(() => {
            let taskClass = jQuery('#task_class').val();
            taskClass = taskClass.toLowerCase().replace(/\\/g, '-');
            jQuery('.extraFields').appendTo(jQuery('#extraFieldsHidden'));
            jQuery('.extra_fields_' + taskClass).appendTo(jQuery('#extraFieldsSection'));
        });
    }
    static updateElementBrowserTriggers() {
        const triggers = document.querySelectorAll('.t3js-element-browser');
        triggers.forEach((el) => {
            const triggerField = document.getElementById(el.dataset.triggerFor);
            el.dataset.params = triggerField.name + '|||pages';
        });
    }
}
var Scheduler$1 = new Scheduler();

export default Scheduler$1;
