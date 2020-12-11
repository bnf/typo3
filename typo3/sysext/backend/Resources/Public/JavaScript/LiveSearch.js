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
var __importDefault=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};define(["require","exports","jquery","./Viewport","./Icons","lit-html","lit-html/directives/unsafe-html","jquery/autocomplete","./Input/Clearable"],(function(e,t,l,a,o,r,n){"use strict";var s;l=__importDefault(l),function(e){e.containerSelector="#typo3-cms-backend-backend-toolbaritems-livesearchtoolbaritem",e.toolbarItem=".t3js-toolbar-item-search",e.dropdownToggle=".t3js-toolbar-search-dropdowntoggle",e.searchFieldSelector=".t3js-topbar-navigation-search-field",e.formSelector=".t3js-topbar-navigation-search"}(s||(s={}));return new class{constructor(){this.url=TYPO3.settings.ajaxUrls.livesearch,a.Topbar.Toolbar.registerEvent(()=>{let e;this.registerAutocomplete(),this.registerEvents(),l.default(s.toolbarItem).removeAttr("style"),null!==(e=document.querySelector(s.searchFieldSelector))&&e.clearable({onClear:()=>{l.default(s.toolbarItem).hasClass("open")&&l.default(s.dropdownToggle).dropdown("toggle")}})})}registerAutocomplete(){l.default(s.searchFieldSelector).autocomplete({serviceUrl:this.url,paramName:"q",dataType:"json",minChars:2,width:"100%",groupBy:"typeLabel",noCache:!0,containerClass:s.toolbarItem.substr(1,s.toolbarItem.length),appendTo:s.containerSelector+" .dropdown-menu",forceFixPosition:!1,preserveInput:!0,showNoSuggestionNotice:!0,triggerSelectOnValidInput:!1,preventBadQueries:!1,noSuggestionNotice:'<h3 class="dropdown-headline">'+TYPO3.lang.liveSearch_listEmptyText+"</h3><p>"+TYPO3.lang.liveSearch_helpTitle+"</p><hr><p>"+TYPO3.lang.liveSearch_helpDescription+"<br>"+TYPO3.lang.liveSearch_helpDescriptionPages+"</p>",transformResult:e=>({suggestions:l.default.map(e,e=>({value:e.title,data:e}))}),formatGroup:(e,t,l)=>{const a=document.createElement("div");return r.render(r.html`
          ${l>0?r.html`<hr>`:""}
          <h3 class="dropdown-headline">${t}</h3>
        `,a),a.innerHTML},formatResult:e=>{const t=document.createElement("div");return r.render(r.html`
          <div class="dropdown-table">
            <div class="dropdown-table-row">
              <div class="dropdown-table-column dropdown-table-icon">
                ${n.unsafeHTML(e.data.iconHTML)}
              </div>
              <div class="dropdown-table-column dropdown-table-title">
                <a class="dropdown-table-title-ellipsis dropdown-list-link"
                   href="#" data-pageid="${e.data.pageId}" data-target="${e.data.editLink}">
                  ${e.data.title}
                </a>
              </div>
            </div>
          </div>
        `,t),t.innerHTML},onSearchStart:()=>{const e=l.default(s.toolbarItem);e.hasClass("loading")||(e.addClass("loading"),o.getIcon("spinner-circle-light",o.sizes.small,"",o.states.default,o.markupIdentifiers.inline).then(t=>{e.find(".icon-apps-toolbar-menu-search").replaceWith(t)}))},onSearchComplete:()=>{const e=l.default(s.toolbarItem),t=l.default(s.searchFieldSelector);!e.hasClass("open")&&t.val().length>1&&(l.default(s.dropdownToggle).dropdown("toggle"),t.focus()),e.hasClass("loading")&&(e.removeClass("loading"),o.getIcon("apps-toolbar-menu-search",o.sizes.small,"",o.states.default,o.markupIdentifiers.inline).then(t=>{e.find(".icon-spinner-circle-light").replaceWith(t)}))},beforeRender:e=>{e.append('<hr><div><a href="#" class="btn btn-primary pull-right t3js-live-search-show-all">'+TYPO3.lang.liveSearch_showAllResults+"</a></div>"),l.default(s.toolbarItem).hasClass("open")||(l.default(s.dropdownToggle).dropdown("toggle"),l.default(s.searchFieldSelector).focus())},onHide:()=>{l.default(s.toolbarItem).hasClass("open")&&l.default(s.dropdownToggle).dropdown("toggle")}})}registerEvents(){const e=l.default(s.searchFieldSelector);if(l.default(s.containerSelector).on("click",".t3js-live-search-show-all",t=>{t.preventDefault(),TYPO3.ModuleMenu.App.showModule("web_list","id=0&search_levels=-1&search_field="+encodeURIComponent(e.val())),e.val("").trigger("change")}),e.length){l.default("."+s.toolbarItem.substr(1,s.toolbarItem.length)).on("click.autocomplete",".dropdown-list-link",t=>{t.preventDefault();const a=l.default(t.currentTarget);top.jump(a.data("target"),"web_list","web",a.data("pageid")),e.val("").trigger("change")})}l.default(s.formSelector).on("submit",e=>{e.preventDefault()})}}}));