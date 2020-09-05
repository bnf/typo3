import InfoWindow from './InfoWindow.esm.js';
import RegularEvent from '../../../../core/Resources/Public/JavaScript/Event/RegularEvent.esm.js';
import Utility from './Utility.esm.js';
import shortcutMenuObject from './Toolbar/ShortcutMenu.esm.js';
import windowManager from './WindowManager.esm.js';
import moduleMenuApp from './ModuleMenu.esm.js';
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
/**
 * Module: TYPO3/CMS/Backend/ActionDispatcher
 *
 * @example
 * <a class="btn btn-default" href="#"
 *  data-dispatch-action="TYPO3.InfoWindow.showItem"
 *  data-dispatch-args-list="tt_content,123"
 *  ...
 *  data-dispatch-args="[$quot;tt_content&quot;,123]"
 */
class ActionDispatcher {
    constructor() {
        this.delegates = {};
        this.createDelegates();
        documentService.ready().then(() => this.registerEvents());
    }
    static resolveArguments(element) {
        if (element.dataset.dispatchArgs) {
            // `&quot;` is the only literal of a PHP `json_encode` that needs to be substituted
            // all other payload values are expected to be serialized to unicode literals
            const json = element.dataset.dispatchArgs.replace(/&quot;/g, '"');
            const args = JSON.parse(json);
            return args instanceof Array ? Utility.trimItems(args) : null;
        }
        else if (element.dataset.dispatchArgsList) {
            const args = element.dataset.dispatchArgsList.split(',');
            return Utility.trimItems(args);
        }
        return null;
    }
    static enrichItems(items, evt, target) {
        return items.map((item) => {
            if (!(item instanceof Object) || !item.$event) {
                return item;
            }
            if (item.$target) {
                return target;
            }
            if (item.$event) {
                return evt;
            }
        });
    }
    createDelegates() {
        this.delegates = {
            'TYPO3.InfoWindow.showItem': InfoWindow.showItem.bind(null),
            'TYPO3.ShortcutMenu.createShortcut': shortcutMenuObject.createShortcut.bind(shortcutMenuObject),
            'TYPO3.WindowManager.localOpen': windowManager.localOpen.bind(windowManager),
            'TYPO3.ModuleMenu.showModule': moduleMenuApp.App.showModule.bind(moduleMenuApp.App),
        };
    }
    registerEvents() {
        new RegularEvent('click', this.handleClickEvent.bind(this))
            .delegateTo(document, '[data-dispatch-action]');
    }
    handleClickEvent(evt, target) {
        evt.preventDefault();
        this.delegateTo(target);
    }
    delegateTo(target) {
        const action = target.dataset.dispatchAction;
        const args = ActionDispatcher.resolveArguments(target);
        if (this.delegates[action]) {
            this.delegates[action].apply(null, args || []);
        }
    }
}
var ActionDispatcher$1 = new ActionDispatcher();

export default ActionDispatcher$1;
