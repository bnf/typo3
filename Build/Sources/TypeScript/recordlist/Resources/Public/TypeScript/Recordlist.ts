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

import $ from 'jquery';
import Icons from 'TYPO3/CMS/Backend/Icons';
import PersistentStorage from 'TYPO3/CMS/Backend/Storage/Persistent';
import RegularEvent from 'TYPO3/CMS/Core/Event/RegularEvent';
import Tooltip from 'TYPO3/CMS/Backend/Tooltip';
import DocumentService from 'TYPO3/CMS/Core/DocumentService';
import {ModalResponseEvent} from 'TYPO3/CMS/Backend/ModalInterface';

interface IconIdentifier {
  collapse: string;
  expand: string;
  editMultiple: string;
}
interface RecordlistIdentifier {
  entity: string;
  toggle: string;
  localize: string;
  searchboxToolbar: string;
  searchboxToggle: string;
  searchField: string;
  icons: IconIdentifier;
}
interface DataHandlerEventPayload {
  action: string;
  component: string;
  table: string;
  uid: number;
}

/**
 * Module: TYPO3/CMS/Recordlist/Recordlist
 * Usability improvements for the record list
 * @exports TYPO3/CMS/Recordlist/Recordlist
 */
class Recordlist {
  identifier: RecordlistIdentifier = {
    entity: '.t3js-entity',
    toggle: '.t3js-toggle-recordlist',
    localize: '.t3js-action-localize',
    searchboxToolbar: '#db_list-searchbox-toolbar',
    searchboxToggle: '.t3js-toggle-search-toolbox',
    searchField: '#search_field',
    icons: {
      collapse: 'actions-view-list-collapse',
      expand: 'actions-view-list-expand',
      editMultiple: '.t3js-record-edit-multiple',
    },
  };

  private static submitClipboardFormWithCommand(cmd: string, target: HTMLButtonElement) {
    const clipboardForm = <HTMLFormElement>target.closest('form');
    if (!clipboardForm) {
      return;
    }
    const commandField = <HTMLInputElement>clipboardForm.querySelector('input[name="cmd"]');
    if (!commandField) {
      return;
    }
    commandField.value = cmd;
    clipboardForm.submit();
  }

  constructor() {
    $(document).on('click', this.identifier.toggle, this.toggleClick);
    $(document).on('click', this.identifier.icons.editMultiple, this.onEditMultiple);
    $(document).on('click', this.identifier.localize, this.disableButton);
    $(document).on('click', this.identifier.searchboxToggle, this.toggleSearchbox);
    DocumentService.ready().then((): void => {
      Tooltip.initialize('.table-fit a[title]');
      this.registerPaginationEvents();
    });
    new RegularEvent('typo3:datahandler:process', this.handleDataHandlerResult.bind(this)).bindTo(document);

    // clipboard events
    new RegularEvent('recordlist:clipboard:cmd', (event: ModalResponseEvent): void => {
      if (event.detail.result) {
        Recordlist.submitClipboardFormWithCommand(<string>event.detail.payload, <HTMLButtonElement>event.target);
      }
    }).delegateTo(document, 'button[data-event-name="recordlist:clipboard:cmd"]');
    new RegularEvent('click', (event: Event, target: HTMLButtonElement): void => {
      event.preventDefault();
      Recordlist.submitClipboardFormWithCommand(target.dataset.recordlistClipboardCmd, target);
    }).delegateTo(document, '[data-recordlist-clipboard-cmd]:not([data-recordlist-clipboard-cmd=""])');
  }

  public toggleClick = (e: JQueryEventObject): void => {
    e.preventDefault();

    const $me = $(e.currentTarget);
    const table = $me.data('table');
    const $target = $($me.data('bs-target'));
    const isExpanded = $target.data('state') === 'expanded';
    const $collapseIcon = $me.find('.collapseIcon');
    const toggleIcon = isExpanded ? this.identifier.icons.expand : this.identifier.icons.collapse;

    Icons.getIcon(toggleIcon, Icons.sizes.small).done((icon: string): void => {
      $collapseIcon.html(icon);
    });

    // Store collapse state in UC
    let storedModuleDataList = {};

    if (PersistentStorage.isset('moduleData.list')) {
      storedModuleDataList = PersistentStorage.get('moduleData.list');
    }

    const collapseConfig: any = {};
    collapseConfig[table] = isExpanded ? 1 : 0;

    $.extend(storedModuleDataList, collapseConfig);
    PersistentStorage.set('moduleData.list', storedModuleDataList).done((): void => {
      $target.data('state', isExpanded ? 'collapsed' : 'expanded');
    });
  }

  /**
   * Handles editing multiple records.
   */
  public onEditMultiple = (event: JQueryEventObject): void => {
    event.preventDefault();
    let $tableContainer: JQuery;
    let tableName: string;
    let entityIdentifiers: string;
    let uri: string;
    let patterns: RegExpMatchArray;

    $tableContainer = $(event.currentTarget).closest('[data-table]');
    if ($tableContainer.length === 0) {
      return;
    }

    uri = $(event.currentTarget).data('uri');
    tableName = $tableContainer.data('table');
    entityIdentifiers = $tableContainer
      .find(this.identifier.entity + '[data-uid][data-table="' + tableName + '"]')
      .map((index: number, entity: Element): void => {
        return $(entity).data('uid');
      })
      .toArray()
      .join(',');

    patterns = uri.match(/{[^}]+}/g);
    $.each(patterns, (patternIndex: string, pattern: string) => {
      const expression: string = pattern.substr(1, pattern.length - 2);
      const pipes: Array<string> = expression.split(':');
      const name: string = pipes.shift();
      let value: string;

      switch (name) {
        case 'entityIdentifiers':
          value = entityIdentifiers;
          break;
        default:
          return;
      }

      $.each(pipes, (pipeIndex: string, pipe: string): void => {
        if (pipe === 'editList') {
          value = this.editList(tableName, value);
        }
      });

      uri = uri.replace(pattern, value);
    });

    window.location.href = uri;
  }

  private editList(table: string, idList: string): string {
    const list: Array<string> = [];

    let pointer = 0;
    let pos = idList.indexOf(',');
    while (pos !== -1) {
      if (this.getCheckboxState(table + '|' + idList.substr(pointer, pos - pointer))) {
        list.push(idList.substr(pointer, pos - pointer));
      }
      pointer = pos + 1;
      pos = idList.indexOf(',', pointer);
    }

    if (this.getCheckboxState(table + '|' + idList.substr(pointer))) {
      list.push(idList.substr(pointer));
    }

    return list.length > 0 ? list.join(',') : idList;
  }

  private disableButton = (event: JQueryEventObject): void => {
    const $me = $(event.currentTarget);

    $me.prop('disable', true).addClass('disabled');
  }

  private toggleSearchbox = (): void => {
    const toolbar: JQuery = $(this.identifier.searchboxToolbar);
    toolbar.toggle();
    if (toolbar.is(':visible')) {
      $(this.identifier.searchField).focus();
    }
  };

  private handleDataHandlerResult(e: CustomEvent): void {
    const payload = e.detail.payload;
    if (payload.hasErrors) {
      return;
    }

    if (payload.component === 'datahandler') {
      // In this case the delete action was triggered by AjaxDataHandler itself, which currently has its own handling.
      // Visual handling is about to get decoupled from data handling itself, thus the logic is duplicated for now.
      return;
    }

    if (payload.action === 'delete') {
      this.deleteRow(payload);
    }
  };

  private deleteRow = (payload: DataHandlerEventPayload): void => {
    const $tableElement = $(`table[data-table="${payload.table}"]`);
    const $rowElement = $tableElement.find(`tr[data-uid="${payload.uid}"]`);
    const $panel = $tableElement.closest('.panel');
    const $panelHeading = $panel.find('.panel-heading');
    const $translatedRowElements = $tableElement.find(`[data-l10nparent="${payload.uid}"]`);

    const $rowElements = $().add($rowElement).add($translatedRowElements);
    $rowElements.fadeTo('slow', 0.4, (): void => {
      $rowElements.slideUp('slow', (): void => {
        $rowElements.remove();
        if ($tableElement.find('tbody tr').length === 0) {
          $panel.slideUp('slow');
        }
      });
    });
    if ($rowElement.data('l10nparent') === '0' || $rowElement.data('l10nparent') === '') {
      const count = Number($panelHeading.find('.t3js-table-total-items').html());
      $panelHeading.find('.t3js-table-total-items').text(count - 1);
    }

    if (payload.table === 'pages') {
      top.document.dispatchEvent(new CustomEvent('typo3:pagetree:refresh'));
    }
  }

  private getCheckboxState(CBname: string): boolean {
    const fullName = 'CBC[' + CBname + ']';
    const checkbox: HTMLInputElement = document.querySelector('input[name="' + fullName + '"]');
    return checkbox !== null ? checkbox.checked : false;
  }

  private registerPaginationEvents = (): void => {
    document.querySelectorAll('.t3js-recordlist-paging').forEach((trigger: HTMLInputElement) => {
      trigger.addEventListener('keyup', (e: KeyboardEvent) => {
        e.preventDefault();
        let value = parseInt(trigger.value, 10);
        if (value < parseInt(trigger.min, 10)) {
          value = parseInt(trigger.min, 10);
        }
        if (value > parseInt(trigger.max, 10)) {
          value = parseInt(trigger.max, 10);
        }
        if (e.key === 'Enter' && value !== parseInt(trigger.dataset.currentpage, 10)) {
          window.location.href = trigger.dataset.currenturl + value.toString();
        }
      });
    });
  }
}

export default new Recordlist();
