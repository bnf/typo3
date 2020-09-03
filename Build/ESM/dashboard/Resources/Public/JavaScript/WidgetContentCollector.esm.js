import AjaxRequest from '../../../../core/Resources/Public/JavaScript/Ajax/AjaxRequest.esm.js';

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
        const items = document.querySelectorAll(this.selector);
        items.forEach((triggerElement) => {
            const widgetWaitingElement = triggerElement.querySelector('.widget-waiting');
            const widgetContentElement = triggerElement.querySelector('.widget-content');
            const widgetErrorElement = triggerElement.querySelector('.widget-error');
            const sentRequest = (new AjaxRequest(TYPO3.settings.ajaxUrls.dashboard_get_widget_content))
                .withQueryArguments({
                widget: triggerElement.dataset.widgetKey,
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
                triggerElement.dispatchEvent(event);
            });
            sentRequest.catch((reason) => {
                if (widgetErrorElement !== null) {
                    widgetErrorElement.classList.remove('hide');
                }
                if (widgetWaitingElement !== null) {
                    widgetWaitingElement.classList.add('hide');
                }
                console.warn(`Error while retrieving widget [${triggerElement.dataset.widgetKey}] content: ${reason.message}`);
            });
        });
    }
}
var WidgetContentCollector$1 = new WidgetContentCollector();

export default WidgetContentCollector$1;
