define(['../../../../core/Resources/Public/JavaScript/Contrib/jquery', './LinkBrowser'], function (jquery, LinkBrowser) { 'use strict';

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
     * Module: TYPO3/CMS/Recordlist/MailLinkHandler
     * @exports TYPO3/CMS/Recordlist/MailLinkHandler
     * Mail link interaction
     */
    class MailLinkHandler {
        constructor() {
            jquery(() => {
                jquery('#lmailform').on('submit', (event) => {
                    event.preventDefault();
                    let value = jquery(event.currentTarget).find('[name="lemail"]').val();
                    if (value === 'mailto:') {
                        return;
                    }
                    while (value.substr(0, 7) === 'mailto:') {
                        value = value.substr(7);
                    }
                    LinkBrowser.finalizeFunction('mailto:' + value);
                });
            });
        }
    }
    var MailLinkHandler$1 = new MailLinkHandler();

    return MailLinkHandler$1;

});
