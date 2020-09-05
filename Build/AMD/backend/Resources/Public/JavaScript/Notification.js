define(['./Enum/Severity', '../../../../core/Resources/Public/JavaScript/Contrib/jquery/jquery', './Severity'], function (Severity, jquery, Severity$1) { 'use strict';

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
     * Module: TYPO3/CMS/Backend/Notification
     * Notification API for the TYPO3 backend
     */
    class Notification {
        /**
         * Show a notice notification
         *
         * @param {string} title
         * @param {string} message
         * @param {number} duration
         * @param {Action[]} actions
         */
        static notice(title, message, duration, actions) {
            Notification.showMessage(title, message, Severity.SeverityEnum.notice, duration, actions);
        }
        /**
         * Show a info notification
         *
         * @param {string} title
         * @param {string} message
         * @param {number} duration
         * @param {Action[]} actions
         */
        static info(title, message, duration, actions) {
            Notification.showMessage(title, message, Severity.SeverityEnum.info, duration, actions);
        }
        /**
         * Show a success notification
         *
         * @param {string} title
         * @param {string} message
         * @param {number} duration
         * @param {Action[]} actions
         */
        static success(title, message, duration, actions) {
            Notification.showMessage(title, message, Severity.SeverityEnum.ok, duration, actions);
        }
        /**
         * Show a warning notification
         *
         * @param {string} title
         * @param {string} message
         * @param {number} duration
         * @param {Action[]} actions
         */
        static warning(title, message, duration, actions) {
            Notification.showMessage(title, message, Severity.SeverityEnum.warning, duration, actions);
        }
        /**
         * Show a error notification
         *
         * @param {string} title
         * @param {string} message
         * @param {number} duration
         * @param {Action[]} actions
         */
        static error(title, message, duration = 0, actions) {
            Notification.showMessage(title, message, Severity.SeverityEnum.error, duration, actions);
        }
        /**
         * @param {string} title
         * @param {string} message
         * @param {SeverityEnum} severity
         * @param {number} duration
         * @param {Action[]} actions
         */
        static showMessage(title, message, severity = Severity.SeverityEnum.info, duration = this.duration, actions = []) {
            const className = Severity$1.getCssClass(severity);
            let icon = '';
            switch (severity) {
                case Severity.SeverityEnum.notice:
                    icon = 'lightbulb-o';
                    break;
                case Severity.SeverityEnum.ok:
                    icon = 'check';
                    break;
                case Severity.SeverityEnum.warning:
                    icon = 'exclamation';
                    break;
                case Severity.SeverityEnum.error:
                    icon = 'times';
                    break;
                case Severity.SeverityEnum.info:
                default:
                    icon = 'info';
            }
            duration = (typeof duration === 'undefined')
                ? this.duration
                : (typeof duration === 'string'
                    ? parseFloat(duration)
                    : duration);
            if (this.messageContainer === null || document.getElementById('alert-container') === null) {
                this.messageContainer = jquery('<div>', { 'id': 'alert-container' }).appendTo('body');
            }
            const notificationId = 'notification-' + Math.random().toString(36).substr(2, 5);
            const $box = jquery('<div id="' + notificationId + '" class="alert alert-' + className + ' alert-dismissible fade" role="alert">' +
                '<button type="button" class="close" data-dismiss="alert">' +
                '<span aria-hidden="true"><i class="fa fa-times-circle"></i></span>' +
                '<span class="sr-only">Close</span>' +
                '</button>' +
                '<div class="media">' +
                '<div class="media-left">' +
                '<span class="fa-stack fa-lg">' +
                '<i class="fa fa-circle fa-stack-2x"></i>' +
                '<i class="fa fa-' + icon + ' fa-stack-1x"></i>' +
                '</span>' +
                '</div>' +
                '<div class="media-body">' +
                '<h4 class="alert-title"></h4>' +
                '<p class="alert-message text-pre-wrap"></p>' +
                '</div>' +
                '</div>' +
                '<div class="alert-actions">' +
                '</div>' +
                '</div>');
            $box.find('.alert-title').text(title);
            $box.find('.alert-message').text(message);
            const $actionButtonContainer = $box.find('.alert-actions');
            if (actions.length > 0) {
                for (let action of actions) {
                    const $actionButton = jquery('<a />', {
                        href: '#',
                        title: action.label,
                    });
                    $actionButton.text(action.label);
                    $actionButton.on('click', (e) => {
                        // Remove potentially set timeout
                        $box.clearQueue();
                        const target = e.currentTarget;
                        target.classList.add('executing');
                        $actionButtonContainer.find('a').not(target).addClass('disabled');
                        action.action.execute(target).then(() => {
                            $box.alert('close');
                        });
                    });
                    $actionButtonContainer.append($actionButton);
                }
            }
            else {
                $actionButtonContainer.remove();
            }
            $box.on('close.bs.alert', (e) => {
                e.preventDefault();
                const $me = jquery(e.currentTarget);
                $me
                    .clearQueue()
                    .queue((next) => {
                    $me.removeClass('in');
                    next();
                })
                    .slideUp({
                    complete: () => {
                        $me.remove();
                    },
                });
            });
            $box.appendTo(this.messageContainer);
            $box.delay(200)
                .queue((next) => {
                $box.addClass('in');
                next();
            });
            if (duration > 0) {
                // if duration > 0 dismiss alert
                $box.delay(duration * 1000)
                    .queue((next) => {
                    $box.alert('close');
                    next();
                });
            }
        }
    }
    Notification.duration = 5;
    Notification.messageContainer = null;
    let notificationObject;
    try {
        // fetch from parent
        if (parent && parent.window.TYPO3 && parent.window.TYPO3.Notification) {
            notificationObject = parent.window.TYPO3.Notification;
        }
        // fetch object from outer frame
        if (top && top.TYPO3.Notification) {
            notificationObject = top.TYPO3.Notification;
        }
    }
    catch (_a) {
        // This only happens if the opener, parent or top is some other url (eg a local file)
        // which loaded the current window. Then the browser's cross domain policy jumps in
        // and raises an exception.
        // For this case we are safe and we can create our global object below.
    }
    if (!notificationObject) {
        notificationObject = Notification;
        // attach to global frame
        if (typeof TYPO3 !== 'undefined') {
            TYPO3.Notification = notificationObject;
        }
    }
    var NotificationService = notificationObject;

    return NotificationService;

});
