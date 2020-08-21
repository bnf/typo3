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
define(["jquery","./Viewport","./Icons","jquery/autocomplete","./Input/Clearable"],(function(e,t,o){"use strict";var a;!function(e){e.containerSelector="#typo3-cms-backend-backend-toolbaritems-livesearchtoolbaritem",e.toolbarItem=".t3js-toolbar-item-search",e.dropdownToggle=".t3js-toolbar-search-dropdowntoggle",e.searchFieldSelector=".t3js-topbar-navigation-search-field",e.formSelector=".t3js-topbar-navigation-search"}(a||(a={}));return new class{constructor(){this.url=TYPO3.settings.ajaxUrls.livesearch,t.Topbar.Toolbar.registerEvent(()=>{let t;this.registerAutocomplete(),this.registerEvents(),e(a.toolbarItem).removeAttr("style"),null!==(t=document.querySelector(a.searchFieldSelector))&&t.clearable({onClear:()=>{e(a.toolbarItem).hasClass("open")&&e(a.dropdownToggle).dropdown("toggle")}})})}registerAutocomplete(){e(a.searchFieldSelector).autocomplete({serviceUrl:this.url,paramName:"q",dataType:"json",minChars:2,width:"100%",groupBy:"typeLabel",noCache:!0,containerClass:a.toolbarItem.substr(1,a.toolbarItem.length),appendTo:a.containerSelector+" .dropdown-menu",forceFixPosition:!1,preserveInput:!0,showNoSuggestionNotice:!0,triggerSelectOnValidInput:!1,preventBadQueries:!1,noSuggestionNotice:'<h3 class="dropdown-headline">'+TYPO3.lang.liveSearch_listEmptyText+"</h3><p>"+TYPO3.lang.liveSearch_helpTitle+"</p><hr><p>"+TYPO3.lang.liveSearch_helpDescription+"<br>"+TYPO3.lang.liveSearch_helpDescriptionPages+"</p>",transformResult:t=>({suggestions:e.map(t,e=>({value:e.title,data:e}))}),formatGroup:(e,t,o)=>{let a="";return o>0&&(a="<hr>"),a+'<h3 class="dropdown-headline">'+t+"</h3>"},formatResult:e=>'<div class="dropdown-table"><div class="dropdown-table-row"><div class="dropdown-table-column dropdown-table-icon">'+e.data.iconHTML+'</div><div class="dropdown-table-column dropdown-table-title"><a class="dropdown-table-title-ellipsis dropdown-list-link" href="#" data-pageid="'+e.data.pageId+'" data-target="'+e.data.editLink+'">'+e.data.title+"</a></div></div></div>",onSearchStart:()=>{const t=e(a.toolbarItem);t.hasClass("loading")||(t.addClass("loading"),o.getIcon("spinner-circle-light",o.sizes.small,"",o.states.default,o.markupIdentifiers.inline).then(e=>{t.find(".icon-apps-toolbar-menu-search").replaceWith(e)}))},onSearchComplete:()=>{const t=e(a.toolbarItem),l=e(a.searchFieldSelector);!t.hasClass("open")&&l.val().length>1&&(e(a.dropdownToggle).dropdown("toggle"),l.focus()),t.hasClass("loading")&&(t.removeClass("loading"),o.getIcon("apps-toolbar-menu-search",o.sizes.small,"",o.states.default,o.markupIdentifiers.inline).then(e=>{t.find(".icon-spinner-circle-light").replaceWith(e)}))},beforeRender:t=>{t.append('<hr><div><a href="#" class="btn btn-primary pull-right t3js-live-search-show-all">'+TYPO3.lang.liveSearch_showAllResults+"</a></div>"),e(a.toolbarItem).hasClass("open")||(e(a.dropdownToggle).dropdown("toggle"),e(a.searchFieldSelector).focus())},onHide:()=>{e(a.toolbarItem).hasClass("open")&&e(a.dropdownToggle).dropdown("toggle")}})}registerEvents(){const t=e(a.searchFieldSelector);if(e(a.containerSelector).on("click",".t3js-live-search-show-all",e=>{e.preventDefault(),TYPO3.ModuleMenu.App.showModule("web_list","id=0&search_levels=-1&search_field="+encodeURIComponent(t.val())),t.val("").trigger("change")}),t.length){e("."+a.toolbarItem.substr(1,a.toolbarItem.length)).on("click.autocomplete",".dropdown-list-link",o=>{o.preventDefault();const a=e(o.currentTarget);top.jump(a.data("target"),"web_list","web",a.data("pageid")),t.val("").trigger("change")})}e(a.formSelector).on("submit",e=>{e.preventDefault()})}}}));