import RegularEvent from '../../../../core/Resources/Public/JavaScript/Event/RegularEvent.esm.js';
import NotificationService from './Notification.esm.js';
import documentService from '../../../../core/Resources/Public/JavaScript/DocumentService.esm.js';

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
var Selectors;
(function (Selectors) {
    Selectors["actionsSelector"] = ".t3js-multi-record-selection-actions";
    Selectors["checkboxSelector"] = ".t3js-multi-record-selection-check";
    Selectors["checkboxActionsSelector"] = "#multi-record-selection-check-actions";
})(Selectors || (Selectors = {}));
var Buttons;
(function (Buttons) {
    Buttons["actionButton"] = "button[data-multi-record-selection-action]";
    Buttons["checkboxActionButton"] = "button[data-multi-record-selection-check-action]";
    Buttons["checkboxActionsToggleButton"] = "button[data-bs-target=\"multi-record-selection-check-actions\"]";
})(Buttons || (Buttons = {}));
var Actions;
(function (Actions) {
    Actions["edit"] = "edit";
})(Actions || (Actions = {}));
var CheckboxActions;
(function (CheckboxActions) {
    CheckboxActions["checkAll"] = "check-all";
    CheckboxActions["checkNone"] = "check-none";
    CheckboxActions["toggle"] = "toggle";
})(CheckboxActions || (CheckboxActions = {}));
var CheckboxState;
(function (CheckboxState) {
    CheckboxState["any"] = "";
    CheckboxState["checked"] = ":checked";
    CheckboxState["unchecked"] = ":not(:checked)";
})(CheckboxState || (CheckboxState = {}));
/**
 * Module: TYPO3/CMS/Backend/MultiRecordSelection
 */
class MultiRecordSelection {
    static getCheckboxes(state = CheckboxState.any) {
        return document.querySelectorAll(Selectors.checkboxSelector + state);
    }
    static changeCheckboxState(checkbox, check) {
        if (checkbox.checked === check || checkbox.dataset.manuallyChanged) {
            // Return in case state did not change or another component has already changed it
            return;
        }
        checkbox.checked = check;
        checkbox.dispatchEvent(new Event('checkbox:state:changed', { bubbles: true, cancelable: false }));
    }
    static getReturnUrl(returnUrl) {
        if (returnUrl === '') {
            returnUrl = top.list_frame.document.location.pathname + top.list_frame.document.location.search;
        }
        return encodeURIComponent(returnUrl);
    }
    /**
     * This restores (initializes) a temporary state, which is required in case
     * the user returns to the listing using the browsers' history back feature,
     * which will not result in a new request.
     */
    static restoreTemporaryState() {
        const checked = MultiRecordSelection.getCheckboxes(CheckboxState.checked);
        // In case nothing is checked we don't have to do anything here
        if (!checked.length) {
            return;
        }
        checked.forEach((checkbox) => {
            checkbox.closest('tr').classList.add('success');
        });
        const actionContainers = document.querySelectorAll(Selectors.actionsSelector);
        actionContainers.length && actionContainers.forEach((container) => container.classList.remove('hidden'));
    }
    /**
     * Toggles the state of the actions, depending on the
     * currently selected elements and their nature.
     */
    static toggleActionsState() {
        const actionContainers = document.querySelectorAll(Selectors.actionsSelector);
        if (!actionContainers.length) {
            // Early return in case no action containers are defined
            return;
        }
        if (!MultiRecordSelection.getCheckboxes(CheckboxState.checked).length) {
            // In case no checkbox is checked, hide all action containers and return
            actionContainers.forEach((container) => container.classList.add('hidden'));
            return;
        }
        // Remove hidden state of all action containers, since checked checkboxes exist
        actionContainers.forEach((container) => container.classList.remove('hidden'));
        const actions = document.querySelectorAll([Selectors.actionsSelector, Buttons.actionButton].join(' '));
        if (!actions.length) {
            // Early return in case no action is defined
            return;
        }
        actions.forEach((action) => {
            if (!action.dataset.multiRecordSelectionActionConfig) {
                // In case the action does not define any configuration, no toggling is possible
                return;
            }
            const configuration = JSON.parse(action.dataset.multiRecordSelectionActionConfig);
            if (!configuration.idField) {
                // Return in case the idField (where to find the id on selected elements) is not defined
                return;
            }
            // Start the evaluation by disabling the action
            action.classList.add('disabled');
            // Get all currently checked elements
            const checked = MultiRecordSelection.getCheckboxes(CheckboxState.checked);
            for (let i = 0; i < checked.length; i++) {
                // Evaluate each checked element if it contains the specified idField
                if (checked[i].closest('tr').dataset[configuration.idField]) {
                    // If a checked element contains the idField, remove the "disabled"
                    // state and end the search since the action can be performed.
                    action.classList.remove('disabled');
                    break;
                }
            }
        });
    }
    /**
     * The manually changed attribute can be set by components, using
     * this module while implementing custom logic to change checkbox
     * state. To not cancel each others action, all actions in this
     * module respect this attribute before changing checkbox state.
     * Therefore, this method is called prior to every action in
     * this module, which changes checkbox states. Otherwise old
     * state would may led to misbehaviour.
     */
    static unsetManuallyChangedAttribute() {
        MultiRecordSelection.getCheckboxes().forEach((checkbox) => {
            checkbox.removeAttribute('data-manually-changed');
        });
    }
    constructor() {
        documentService.ready().then(() => {
            MultiRecordSelection.restoreTemporaryState();
            this.registerActions();
            this.registerActionsEventHandlers();
            this.registerCheckboxActions();
            this.registerToggleCheckboxActions();
            this.registerDispatchCheckboxStateChangedEvent();
            this.registerCheckboxStateChangedEventHandler();
        });
    }
    registerActions() {
        new RegularEvent('click', (e, target) => {
            const checked = MultiRecordSelection.getCheckboxes(CheckboxState.checked);
            if (!target.dataset.multiRecordSelectionAction || !checked.length) {
                // Return if we don't deal with a valid action or in case there is
                // currently no element checked to perform the action on.
                return;
            }
            // Perform requested action
            switch (target.dataset.multiRecordSelectionAction) {
                case Actions.edit:
                    e.preventDefault();
                    const configuration = JSON.parse(target.dataset.multiRecordSelectionActionConfig || '');
                    if (!configuration || !configuration.idField || !configuration.table) {
                        break;
                    }
                    const list = [];
                    checked.forEach((checkbox) => {
                        const checkboxContainer = checkbox.closest('tr');
                        if (checkboxContainer !== null && checkboxContainer.dataset[configuration.idField]) {
                            list.push(checkboxContainer.dataset[configuration.idField]);
                        }
                    });
                    if (list.length) {
                        window.location.href = top.TYPO3.settings.FormEngine.moduleUrl
                            + '&edit[' + configuration.table + '][' + list.join(',') + ']=edit'
                            + '&returnUrl=' + MultiRecordSelection.getReturnUrl(configuration.returnUrl || '');
                    }
                    else {
                        NotificationService.warning('The selected elements can not be edited.');
                    }
                    break;
                default:
                    // Not all actions are handled here. Therefore we simply skip them and just
                    // dispatch an event so those components can react on the triggered action.
                    target.dispatchEvent(new Event('multiRecordSelection:action:' + target.dataset.multiRecordSelectionAction, { bubbles: true, cancelable: false }));
                    break;
            }
        }).delegateTo(document, [Selectors.actionsSelector, Buttons.actionButton].join(' '));
        // After registering the event, toggle their state
        MultiRecordSelection.toggleActionsState();
    }
    /**
     * Other components can dispatch the "multiRecordSelection:actions"
     * events to influence the display depending on their custom logic.
     */
    registerActionsEventHandlers() {
        new RegularEvent('multiRecordSelection:actions:show', () => {
            const actionContainers = document.querySelectorAll(Selectors.actionsSelector);
            actionContainers && actionContainers.forEach((container) => container.classList.remove('hidden'));
        }).bindTo(document);
        new RegularEvent('multiRecordSelection:actions:hide', () => {
            const actionContainers = document.querySelectorAll(Selectors.actionsSelector);
            actionContainers && actionContainers.forEach((container) => container.classList.add('hidden'));
        }).bindTo(document);
    }
    registerCheckboxActions() {
        new RegularEvent('click', (e, target) => {
            e.preventDefault();
            const checkboxes = MultiRecordSelection.getCheckboxes();
            if (!target.dataset.multiRecordSelectionCheckAction || !checkboxes.length) {
                // Return if we don't deal with a valid action or in case there
                // are no checkboxes (elements) to perform the action on.
                return;
            }
            // Unset manually changed attribute so we can be sure, in case this is
            // set on a checkbox, while executing the requested action, the checkbox
            // was already changed by another component.
            MultiRecordSelection.unsetManuallyChangedAttribute();
            // Perform requested action
            switch (target.dataset.multiRecordSelectionCheckAction) {
                case CheckboxActions.checkAll:
                    checkboxes.forEach((checkbox) => {
                        MultiRecordSelection.changeCheckboxState(checkbox, true);
                    });
                    break;
                case CheckboxActions.checkNone:
                    checkboxes.forEach((checkbox) => {
                        MultiRecordSelection.changeCheckboxState(checkbox, false);
                    });
                    break;
                case CheckboxActions.toggle:
                    checkboxes.forEach((checkbox) => {
                        MultiRecordSelection.changeCheckboxState(checkbox, !checkbox.checked);
                    });
                    break;
                default:
                    // Unknown action
                    NotificationService.warning('Unknown checkbox action');
            }
            // To prevent possible side effects we simply clean up and unset the attribute here again
            MultiRecordSelection.unsetManuallyChangedAttribute();
        }).delegateTo(document, [Selectors.checkboxActionsSelector, Buttons.checkboxActionButton].join(' '));
    }
    registerDispatchCheckboxStateChangedEvent() {
        new RegularEvent('change', (e, target) => {
            target.dispatchEvent(new Event('checkbox:state:changed', { bubbles: true, cancelable: false }));
        }).delegateTo(document, Selectors.checkboxSelector);
    }
    registerCheckboxStateChangedEventHandler() {
        new RegularEvent('checkbox:state:changed', (e) => {
            const checkbox = e.target;
            if (checkbox.checked) {
                checkbox.closest('tr').classList.add('success');
            }
            else {
                checkbox.closest('tr').classList.remove('success');
            }
            // Toggle actions for changed checkbox state
            MultiRecordSelection.toggleActionsState();
        }).bindTo(document);
    }
    registerToggleCheckboxActions() {
        new RegularEvent('click', () => {
            const checkAll = document.querySelector('button[data-multi-record-selection-check-action="' + CheckboxActions.checkAll + '"]');
            if (checkAll !== null) {
                checkAll.classList.toggle('disabled', !MultiRecordSelection.getCheckboxes(CheckboxState.unchecked).length);
            }
            const checkNone = document.querySelector('button[data-multi-record-selection-check-action="' + CheckboxActions.checkNone + '"]');
            if (checkNone !== null) {
                checkNone.classList.toggle('disabled', !MultiRecordSelection.getCheckboxes(CheckboxState.checked).length);
            }
        }).delegateTo(document, Buttons.checkboxActionsToggleButton);
    }
}
var MultiRecordSelection$1 = new MultiRecordSelection();

export default MultiRecordSelection$1;
