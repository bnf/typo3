define(['jquery', './Icons', './Viewport', './Input/Clearable', 'jquery/autocomplete'], function ($, Icons, Viewport, Clearable, autocomplete) { 'use strict';

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    var $__default = /*#__PURE__*/_interopDefaultLegacy($);

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
    var Identifiers;
    (function (Identifiers) {
        Identifiers["containerSelector"] = "#typo3-cms-backend-backend-toolbaritems-livesearchtoolbaritem";
        Identifiers["toolbarItem"] = ".t3js-toolbar-item-search";
        Identifiers["dropdownToggle"] = ".t3js-toolbar-search-dropdowntoggle";
        Identifiers["searchFieldSelector"] = ".t3js-topbar-navigation-search-field";
        Identifiers["formSelector"] = ".t3js-topbar-navigation-search";
    })(Identifiers || (Identifiers = {}));
    /**
     * Module: TYPO3/CMS/Backend/LiveSearch
     * Global search to deal with everything in the backend that is search-related
     * @exports TYPO3/CMS/Backend/LiveSearch
     */
    class LiveSearch {
        constructor() {
            this.url = TYPO3.settings.ajaxUrls.livesearch;
            Viewport.Topbar.Toolbar.registerEvent(() => {
                this.registerAutocomplete();
                this.registerEvents();
                // Unset height, width and z-index
                $__default['default'](Identifiers.toolbarItem).removeAttr('style');
                let searchField;
                if ((searchField = document.querySelector(Identifiers.searchFieldSelector)) !== null) {
                    searchField.clearable({
                        onClear: () => {
                            if ($__default['default'](Identifiers.toolbarItem).hasClass('open')) {
                                $__default['default'](Identifiers.dropdownToggle).dropdown('toggle');
                            }
                        },
                    });
                }
            });
        }
        registerAutocomplete() {
            $__default['default'](Identifiers.searchFieldSelector).autocomplete({
                // ajax options
                serviceUrl: this.url,
                paramName: 'q',
                dataType: 'json',
                minChars: 2,
                width: '100%',
                groupBy: 'typeLabel',
                noCache: true,
                containerClass: Identifiers.toolbarItem.substr(1, Identifiers.toolbarItem.length),
                appendTo: Identifiers.containerSelector + ' .dropdown-menu',
                forceFixPosition: false,
                preserveInput: true,
                showNoSuggestionNotice: true,
                triggerSelectOnValidInput: false,
                preventBadQueries: false,
                noSuggestionNotice: '<h3 class="dropdown-headline">' + TYPO3.lang.liveSearch_listEmptyText + '</h3>'
                    + '<p>' + TYPO3.lang.liveSearch_helpTitle + '</p>'
                    + '<hr>'
                    + '<p>' + TYPO3.lang.liveSearch_helpDescription + '<br>' + TYPO3.lang.liveSearch_helpDescriptionPages + '</p>',
                // put the AJAX results in the right format
                transformResult: (response) => {
                    return {
                        suggestions: $__default['default'].map(response, (dataItem) => {
                            return { value: dataItem.title, data: dataItem };
                        }),
                    };
                },
                formatGroup: (suggestion, category, i) => {
                    let html = '';
                    // add a divider if it's not the first group
                    if (i > 0) {
                        html = '<hr>';
                    }
                    return html + '<h3 class="dropdown-headline">' + category + '</h3>';
                },
                // Rendering of each item
                formatResult: (suggestion) => {
                    return ''
                        + '<div class="dropdown-table">'
                        + '<div class="dropdown-table-row">'
                        + '<div class="dropdown-table-column dropdown-table-icon">' + suggestion.data.iconHTML + '</div>'
                        + '<div class="dropdown-table-column dropdown-table-title">'
                        + '<a class="dropdown-table-title-ellipsis dropdown-list-link"'
                        + ' href="#" data-pageid="' + suggestion.data.pageId + '" data-target="' + suggestion.data.editLink + '">'
                        + suggestion.data.title
                        + '</a>'
                        + '</div>'
                        + '</div>'
                        + '</div>'
                        + '';
                },
                onSearchStart: () => {
                    const $toolbarItem = $__default['default'](Identifiers.toolbarItem);
                    if (!$toolbarItem.hasClass('loading')) {
                        $toolbarItem.addClass('loading');
                        Icons.getIcon('spinner-circle-light', Icons.sizes.small, '', Icons.states.default, Icons.markupIdentifiers.inline).then((markup) => {
                            $toolbarItem.find('.icon-apps-toolbar-menu-search').replaceWith(markup);
                        });
                    }
                },
                onSearchComplete: () => {
                    const $toolbarItem = $__default['default'](Identifiers.toolbarItem);
                    const $searchField = $__default['default'](Identifiers.searchFieldSelector);
                    if (!$toolbarItem.hasClass('open') && $searchField.val().length > 1) {
                        $__default['default'](Identifiers.dropdownToggle).dropdown('toggle');
                        $searchField.focus();
                    }
                    if ($toolbarItem.hasClass('loading')) {
                        $toolbarItem.removeClass('loading');
                        Icons.getIcon('apps-toolbar-menu-search', Icons.sizes.small, '', Icons.states.default, Icons.markupIdentifiers.inline).then((markup) => {
                            $toolbarItem.find('.icon-spinner-circle-light').replaceWith(markup);
                        });
                    }
                },
                beforeRender: (container) => {
                    container.append('<hr><div>' +
                        '<a href="#" class="btn btn-primary pull-right t3js-live-search-show-all">' +
                        TYPO3.lang.liveSearch_showAllResults +
                        '</a>' +
                        '</div>');
                    if (!$__default['default'](Identifiers.toolbarItem).hasClass('open')) {
                        $__default['default'](Identifiers.dropdownToggle).dropdown('toggle');
                        $__default['default'](Identifiers.searchFieldSelector).focus();
                    }
                },
                onHide: () => {
                    if ($__default['default'](Identifiers.toolbarItem).hasClass('open')) {
                        $__default['default'](Identifiers.dropdownToggle).dropdown('toggle');
                    }
                },
            });
        }
        registerEvents() {
            const $searchField = $__default['default'](Identifiers.searchFieldSelector);
            $__default['default'](Identifiers.containerSelector).on('click', '.t3js-live-search-show-all', (evt) => {
                evt.preventDefault();
                TYPO3.ModuleMenu.App.showModule('web_list', 'id=0&search_levels=-1&search_field=' + encodeURIComponent($searchField.val()));
                $searchField.val('').trigger('change');
            });
            if ($searchField.length) {
                const $autocompleteContainer = $__default['default']('.' + Identifiers.toolbarItem.substr(1, Identifiers.toolbarItem.length));
                $autocompleteContainer.on('click.autocomplete', '.dropdown-list-link', (evt) => {
                    evt.preventDefault();
                    const $me = $__default['default'](evt.currentTarget);
                    top.jump($me.data('target'), 'web_list', 'web', $me.data('pageid'));
                    $searchField.val('').trigger('change');
                });
            }
            // Prevent submitting the search form
            $__default['default'](Identifiers.formSelector).on('submit', (evt) => {
                evt.preventDefault();
            });
        }
    }
    var LiveSearch$1 = new LiveSearch();

    return LiveSearch$1;

});
