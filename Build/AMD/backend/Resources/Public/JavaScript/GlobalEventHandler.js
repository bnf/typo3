define(['../../../../core/Resources/Public/JavaScript/Event/RegularEvent', '../../../../core/Resources/Public/JavaScript/DocumentService'], function (RegularEvent, DocumentService) { 'use strict';

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
     * Module: TYPO3/CMS/Backend/GlobalEventHandler
     *
     * + `data-global-event="change"`
     *   + `data-action-submit="..."` submits form data
     *     + `$form` parent form element of current element is submitted
     *     + `<any CSS selector>` queried element is submitted (if implementing HTMLFormElement)
     *   + `data-action-navigate="..."` navigates to URL
     *     + `$value` URL taken from value of current element
     *     + `$data` URL taken from `data-navigate-value`
     *     + `$data=~s/$value/` URL taken from `data-navigate-value`,
     *        substituting literal `${value}` and `$[value]` of current element
     * + `data-global-event="submit"`
     *   + `data-value-selector`="..."` retrieves `$value` from corresponding CSS selector
     *   + `data-action-navigate="..."` navigates to URL
     *     + `$form=~s/$value/` URL taken from `form[action]`,
     *        substituting literal `${value}` and `$[value]` taken from `data-value-selector`
     * + `data-global-event="click"`
     *   + @todo
     *
     * @example
     * <form action="..." id="...">
     *   <input name="name" value="value" data-global-event="change" data-action-submit="$form">
     * </form>
     */
    class GlobalEventHandler {
        constructor() {
            this.options = {
                onChangeSelector: '[data-global-event="change"]',
                onClickSelector: '[data-global-event="click"]',
                onSubmitSelector: 'form[data-global-event="submit"]',
            };
            DocumentService.ready().then(() => this.registerEvents());
        }
        ;
        registerEvents() {
            new RegularEvent('change', this.handleChangeEvent.bind(this))
                .delegateTo(document, this.options.onChangeSelector);
            new RegularEvent('click', this.handleClickEvent.bind(this))
                .delegateTo(document, this.options.onClickSelector);
            new RegularEvent('submit', this.handleSubmitEvent.bind(this))
                .delegateTo(document, this.options.onSubmitSelector);
        }
        handleChangeEvent(evt, resolvedTarget) {
            evt.preventDefault();
            this.handleFormChildSubmitAction(evt, resolvedTarget)
                || this.handleFormChildNavigateAction(evt, resolvedTarget);
        }
        handleClickEvent(evt, resolvedTarget) {
            evt.preventDefault();
        }
        handleSubmitEvent(evt, resolvedTarget) {
            evt.preventDefault();
            this.handleFormNavigateAction(evt, resolvedTarget);
        }
        handleFormChildSubmitAction(evt, resolvedTarget) {
            const actionSubmit = resolvedTarget.dataset.actionSubmit;
            if (!actionSubmit) {
                return false;
            }
            // @example [data-action-submit]="$form"
            if (actionSubmit === '$form' && this.isHTMLFormChildElement(resolvedTarget)) {
                resolvedTarget.form.submit();
                return true;
            }
            const formCandidate = document.querySelector(actionSubmit);
            if (formCandidate instanceof HTMLFormElement) {
                formCandidate.submit();
                return true;
            }
            return false;
        }
        handleFormChildNavigateAction(evt, resolvedTarget) {
            const actionNavigate = resolvedTarget.dataset.actionNavigate;
            if (!actionNavigate) {
                return false;
            }
            const value = this.resolveHTMLFormChildElementValue(resolvedTarget);
            const navigateValue = resolvedTarget.dataset.navigateValue;
            if (actionNavigate === '$data=~s/$value/' && navigateValue && value !== null) {
                window.location.href = this.substituteValueVariable(navigateValue, value);
                return true;
            }
            if (actionNavigate === '$data' && navigateValue) {
                window.location.href = navigateValue;
                return true;
            }
            if (actionNavigate === '$value' && value) {
                window.location.href = value;
                return true;
            }
            return false;
        }
        handleFormNavigateAction(evt, resolvedTarget) {
            const formAction = resolvedTarget.action;
            const actionNavigate = resolvedTarget.dataset.actionNavigate;
            if (!formAction || !actionNavigate) {
                return false;
            }
            const navigateValue = resolvedTarget.dataset.navigateValue;
            const valueSelector = resolvedTarget.dataset.valueSelector;
            const value = this.resolveHTMLFormChildElementValue(resolvedTarget.querySelector(valueSelector));
            if (actionNavigate === '$form=~s/$value/' && navigateValue && value !== null) {
                window.location.href = this.substituteValueVariable(navigateValue, value);
                return true;
            }
            if (actionNavigate === '$form') {
                window.location.href = formAction;
                return true;
            }
            return false;
        }
        substituteValueVariable(haystack, substitute) {
            // replacing `${value}` and `$[value]` and its URL encoded representation
            // (`${value}` is difficult to achieve with Fluid, that's why there's `$[value]` as well)
            return haystack.replace(/(\$\{value\}|%24%7Bvalue%7D|\$\[value\]|%24%5Bvalue%5D)/gi, substitute);
        }
        isHTMLFormChildElement(element) {
            return element instanceof HTMLSelectElement
                || element instanceof HTMLInputElement
                || element instanceof HTMLTextAreaElement;
        }
        resolveHTMLFormChildElementValue(element) {
            const type = element.getAttribute('type');
            if (element instanceof HTMLSelectElement) {
                return element.options[element.selectedIndex].value;
            }
            else if (element instanceof HTMLInputElement && type === 'checkbox') {
                return element.checked ? element.value : '';
            }
            else if (element instanceof HTMLInputElement) {
                return element.value;
            }
            return null;
        }
    }
    var GlobalEventHandler$1 = new GlobalEventHandler();

    return GlobalEventHandler$1;

});
