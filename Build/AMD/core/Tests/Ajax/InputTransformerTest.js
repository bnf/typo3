define(['../../Resources/Public/TypeScript/Ajax/InputTransformer'], function (InputTransformer) { 'use strict';

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
    describe('TYPO3/CMS/Core/Ajax/InputTransformer', () => {
        it('converts object to FormData', () => {
            const input = { foo: 'bar', bar: 'baz', nested: { works: 'yes' } };
            const expected = new FormData();
            expected.set('foo', 'bar');
            expected.set('bar', 'baz');
            expected.set('nested[works]', 'yes');
            expect(InputTransformer.InputTransformer.toFormData(input)).toEqual(expected);
        });
        it('undefined values are removed in FormData', () => {
            const input = { foo: 'bar', bar: 'baz', removeme: undefined };
            const expected = new FormData();
            expected.set('foo', 'bar');
            expected.set('bar', 'baz');
            expect(InputTransformer.InputTransformer.toFormData(input)).toEqual(expected);
        });
        it('converts object to SearchParams', () => {
            const input = { foo: 'bar', bar: 'baz', nested: { works: 'yes' } };
            const expected = 'foo=bar&bar=baz&nested[works]=yes';
            expect(InputTransformer.InputTransformer.toSearchParams(input)).toEqual(expected);
        });
        it('merges array to SearchParams', () => {
            const input = ['foo=bar', 'bar=baz'];
            const expected = 'foo=bar&bar=baz';
            expect(InputTransformer.InputTransformer.toSearchParams(input)).toEqual(expected);
        });
        it('keeps string in SearchParams', () => {
            const input = 'foo=bar&bar=baz';
            const expected = 'foo=bar&bar=baz';
            expect(InputTransformer.InputTransformer.toSearchParams(input)).toEqual(expected);
        });
        it('undefined values are removed in SearchParams', () => {
            const input = { foo: 'bar', bar: 'baz', removeme: undefined };
            const expected = 'foo=bar&bar=baz';
            expect(InputTransformer.InputTransformer.toSearchParams(input)).toEqual(expected);
        });
    });

});
