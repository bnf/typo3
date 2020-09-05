import jQuery from '../../core/Resources/Public/JavaScript/Contrib/jquery.esm.js';
import NotificationService from '../Resources/Public/JavaScript/Notification.esm.js';
import DeferredAction from '../Resources/Public/JavaScript/ActionButton/DeferredAction.esm.js';
import ImmediateAction from '../Resources/Public/JavaScript/ActionButton/ImmediateAction.esm.js';

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
describe('TYPO3/CMS/Backend/Notification:', () => {
    beforeEach(() => {
        jQuery.fx.off = true;
        jasmine.clock().install();
        const alertContainer = document.getElementById('alert-container');
        while (alertContainer !== null && alertContainer.firstChild) {
            alertContainer.removeChild(alertContainer.firstChild);
        }
    });
    afterEach(() => {
        jasmine.clock().uninstall();
    });
    describe('can render notifications with dismiss after 1000ms', () => {
        function notificationProvider() {
            return [
                {
                    method: NotificationService.notice,
                    title: 'Notice message',
                    message: 'This notification describes a notice',
                    class: 'alert-notice',
                },
                {
                    method: NotificationService.info,
                    title: 'Info message',
                    message: 'This notification describes an informative action',
                    class: 'alert-info',
                },
                {
                    method: NotificationService.success,
                    title: 'Success message',
                    message: 'This notification describes a successful action',
                    class: 'alert-success',
                },
                {
                    method: NotificationService.warning,
                    title: 'Warning message',
                    message: 'This notification describes a harmful action',
                    class: 'alert-warning',
                },
                {
                    method: NotificationService.error,
                    title: 'Error message',
                    message: 'This notification describes an erroneous action',
                    class: 'alert-danger',
                },
            ];
        }
        for (let dataSet of notificationProvider()) {
            it('can render a notification of type ' + dataSet.class, () => {
                dataSet.method(dataSet.title, dataSet.message, 1);
                const alertSelector = 'div.alert.' + dataSet.class;
                const alertBox = document.querySelector(alertSelector);
                expect(alertBox).not.toBe(null);
                expect(alertBox.querySelector('.alert-title').textContent).toEqual(dataSet.title);
                expect(alertBox.querySelector('.alert-message').textContent).toEqual(dataSet.message);
                jasmine.clock().tick(1200);
                expect(document.querySelector(alertSelector)).toBe(null);
            });
        }
    });
    it('can render action buttons', () => {
        NotificationService.info('Info message', 'Some text', 1, [
            {
                label: 'My action',
                action: new ImmediateAction((promise) => {
                    return promise;
                }),
            },
            {
                label: 'My other action',
                action: new DeferredAction((promise) => {
                    return promise;
                }),
            },
        ]);
        const alertBox = document.querySelector('div.alert');
        expect(alertBox.querySelector('.alert-actions')).not.toBe(null);
        expect(alertBox.querySelectorAll('.alert-actions a').length).toEqual(2);
        expect(alertBox.querySelectorAll('.alert-actions a')[0].textContent).toEqual('My action');
        expect(alertBox.querySelectorAll('.alert-actions a')[1].textContent).toEqual('My other action');
    });
    it('immediate action is called', () => {
        const observer = {
            callback: () => {
                return;
            },
        };
        spyOn(observer, 'callback').and.callThrough();
        NotificationService.info('Info message', 'Some text', 1, [
            {
                label: 'My immediate action',
                action: new ImmediateAction(observer.callback),
            },
        ]);
        const alertBox = document.querySelector('div.alert');
        alertBox.querySelector('.alert-actions a').click();
        expect(observer.callback).toHaveBeenCalled();
    });
});
