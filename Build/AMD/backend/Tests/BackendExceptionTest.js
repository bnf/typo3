define(['../Resources/Public/TypeScript/BackendException'], function (BackendException) { 'use strict';

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
    describe('TYPO3/CMS/Backend/BackendException', () => {
        it('sets exception message', () => {
            const backendException = new BackendException.BackendException('some message');
            expect(backendException.message).toBe('some message');
        });
        it('sets exception code', () => {
            const backendException = new BackendException.BackendException('', 12345);
            expect(backendException.code).toBe(12345);
        });
    });

});
