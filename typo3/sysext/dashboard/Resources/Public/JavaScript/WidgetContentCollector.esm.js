import AjaxRequest from '../../../../core/Resources/Public/JavaScript/Ajax/AjaxRequest.esm.js';
import RegularEvent from '../../../../core/Resources/Public/JavaScript/Event/RegularEvent.esm.js';

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
class WidgetContentCollector {
    constructor() {
        this.selector = '.dashboard-item';
        this.initialize();
    }
    initialize() {
        this.registerEvents();
        const items = document.querySelectorAll(this.selector);
        items.forEach((triggerElement) => {
            let event;
            const eventInitDict = {
                bubbles: true,
            };
            event = new Event('widgetRefresh', eventInitDict);
            triggerElement.dispatchEvent(event);
        });
    }
    registerEvents() {
        new RegularEvent('widgetRefresh', (e, target) => {
            e.preventDefault();
            this.getContentForWidget(target);
        }).delegateTo(document, this.selector);
    }
    getContentForWidget(element) {
        const widgetWaitingElement = element.querySelector('.widget-waiting');
        const widgetContentElement = element.querySelector('.widget-content');
        const widgetErrorElement = element.querySelector('.widget-error');
        widgetWaitingElement.classList.remove('hide');
        widgetContentElement.classList.add('hide');
        widgetErrorElement.classList.add('hide');
        const sentRequest = (new AjaxRequest(TYPO3.settings.ajaxUrls.dashboard_get_widget_content))
            .withQueryArguments({
            widget: element.dataset.widgetKey,
        })
            .get()
            .then(async (response) => {
            const data = await response.resolve();
            if (widgetContentElement !== null) {
                widgetContentElement.innerHTML = data.content;
                widgetContentElement.classList.remove('hide');
            }
            if (widgetWaitingElement !== null) {
                widgetWaitingElement.classList.add('hide');
            }
            let event;
            const eventInitDict = {
                bubbles: true,
            };
            if (Object.keys(data.eventdata).length > 0) {
                event = new CustomEvent('widgetContentRendered', Object.assign(Object.assign({}, eventInitDict), { detail: data.eventdata }));
            }
            else {
                event = new Event('widgetContentRendered', eventInitDict);
            }
            element.dispatchEvent(event);
        });
        sentRequest.catch((reason) => {
            if (widgetErrorElement !== null) {
                widgetErrorElement.classList.remove('hide');
            }
            if (widgetWaitingElement !== null) {
                widgetWaitingElement.classList.add('hide');
            }
            console.warn(`Error while retrieving widget [${element.dataset.widgetKey}] content: ${reason.message}`);
        });
    }
}
var WidgetContentCollector$1 = new WidgetContentCollector();

export default WidgetContentCollector$1;
