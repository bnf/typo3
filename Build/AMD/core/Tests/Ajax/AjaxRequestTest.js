define(['../../Resources/Public/TypeScript/Ajax/AjaxRequest'], function (AjaxRequest) { 'use strict';

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
    describe('TYPO3/CMS/Core/Ajax/AjaxRequest', () => {
        let promiseHelper;
        beforeEach(() => {
            const fetchPromise = new Promise(((resolve, reject) => {
                promiseHelper = {
                    resolve: resolve,
                    reject: reject,
                };
            }));
            spyOn(window, 'fetch').and.returnValue(fetchPromise);
        });
        it('sends GET request', () => {
            (new AjaxRequest('https://example.com')).get();
            expect(window.fetch).toHaveBeenCalledWith('https://example.com/', jasmine.objectContaining({ method: 'GET' }));
        });
        for (let requestMethod of ['POST', 'PUT', 'DELETE']) {
            describe(`send a ${requestMethod} request`, () => {
                function* requestDataProvider() {
                    yield [
                        'object as payload',
                        requestMethod,
                        { foo: 'bar', bar: 'baz', nested: { works: 'yes' } },
                        () => {
                            const expected = new FormData();
                            expected.set('foo', 'bar');
                            expected.set('bar', 'baz');
                            expected.set('nested[works]', 'yes');
                            return expected;
                        },
                        {}
                    ];
                    yield [
                        'JSON object as payload',
                        requestMethod,
                        { foo: 'bar', bar: 'baz', nested: { works: 'yes' } },
                        () => {
                            return JSON.stringify({ foo: 'bar', bar: 'baz', nested: { works: 'yes' } });
                        },
                        { 'Content-Type': 'application/json' }
                    ];
                    yield [
                        'JSON string as payload',
                        requestMethod,
                        JSON.stringify({ foo: 'bar', bar: 'baz', nested: { works: 'yes' } }),
                        () => {
                            return JSON.stringify({ foo: 'bar', bar: 'baz', nested: { works: 'yes' } });
                        },
                        { 'Content-Type': 'application/json' }
                    ];
                }
                for (let providedData of requestDataProvider()) {
                    let [name, requestMethod, payload, expectedFn, headers] = providedData;
                    const requestFn = requestMethod.toLowerCase();
                    it(`with ${name}`, (done) => {
                        const request = (new AjaxRequest('https://example.com'));
                        request[requestFn](payload, { headers: headers });
                        expect(window.fetch).toHaveBeenCalledWith('https://example.com/', jasmine.objectContaining({ method: requestMethod, body: expectedFn() }));
                        done();
                    });
                }
            });
        }
        describe('send GET requests', () => {
            function* responseDataProvider() {
                yield [
                    'plaintext',
                    'foobar huselpusel',
                    {},
                    (data, responseBody) => {
                        expect(typeof data === 'string').toBeTruthy();
                        expect(data).toEqual(responseBody);
                    }
                ];
                yield [
                    'JSON',
                    JSON.stringify({ foo: 'bar', baz: 'bencer' }),
                    { 'Content-Type': 'application/json' },
                    (data, responseBody) => {
                        expect(typeof data === 'object').toBeTruthy();
                        expect(JSON.stringify(data)).toEqual(responseBody);
                    }
                ];
                yield [
                    'JSON with utf-8',
                    JSON.stringify({ foo: 'bar', baz: 'bencer' }),
                    { 'Content-Type': 'application/json; charset=utf-8' },
                    (data, responseBody) => {
                        expect(typeof data === 'object').toBeTruthy();
                        expect(JSON.stringify(data)).toEqual(responseBody);
                    }
                ];
            }
            for (let providedData of responseDataProvider()) {
                let [name, responseText, headers, onfulfill] = providedData;
                it('receives a ' + name + ' response', (done) => {
                    const response = new Response(responseText, { headers: headers });
                    promiseHelper.resolve(response);
                    (new AjaxRequest('https://example.com')).get().then(async (response) => {
                        const data = await response.resolve();
                        expect(window.fetch).toHaveBeenCalledWith('https://example.com/', jasmine.objectContaining({ method: 'GET' }));
                        onfulfill(data, responseText);
                        done();
                    });
                });
            }
        });
        describe('send requests with different input urls', () => {
            function* urlInputDataProvider() {
                yield [
                    'absolute url with domain',
                    'https://example.com',
                    {},
                    'https://example.com/',
                ];
                yield [
                    'absolute url with domain, with query parameter',
                    'https://example.com',
                    { foo: 'bar', bar: { baz: 'bencer' } },
                    'https://example.com/?foo=bar&bar[baz]=bencer',
                ];
                yield [
                    'absolute url without domain',
                    '/foo/bar',
                    {},
                    window.location.origin + '/foo/bar',
                ];
                yield [
                    'absolute url without domain, with query parameter',
                    '/foo/bar',
                    { foo: 'bar', bar: { baz: 'bencer' } },
                    window.location.origin + '/foo/bar?foo=bar&bar[baz]=bencer',
                ];
                yield [
                    'relative url without domain',
                    'foo/bar',
                    {},
                    window.location.origin + '/foo/bar',
                ];
                yield [
                    'relative url without domain, with query parameter',
                    'foo/bar',
                    { foo: 'bar', bar: { baz: 'bencer' } },
                    window.location.origin + '/foo/bar?foo=bar&bar[baz]=bencer',
                ];
                yield [
                    'fallback to current script if not defined',
                    '?foo=bar&baz=bencer',
                    {},
                    window.location.origin + window.location.pathname + '?foo=bar&baz=bencer',
                ];
            }
            for (let providedData of urlInputDataProvider()) {
                let [name, input, queryParameter, expected] = providedData;
                it('with ' + name, () => {
                    (new AjaxRequest(input)).withQueryArguments(queryParameter).get();
                    expect(window.fetch).toHaveBeenCalledWith(expected, jasmine.objectContaining({ method: 'GET' }));
                });
            }
        });
        describe('send requests with query arguments', () => {
            function* queryArgumentsDataProvider() {
                yield [
                    'single level of arguments',
                    { foo: 'bar', bar: 'baz' },
                    'https://example.com/?foo=bar&bar=baz',
                ];
                yield [
                    'nested arguments',
                    { foo: 'bar', bar: { baz: 'bencer' } },
                    'https://example.com/?foo=bar&bar[baz]=bencer',
                ];
                yield [
                    'string argument',
                    'hello=world&foo=bar',
                    'https://example.com/?hello=world&foo=bar',
                ];
                yield [
                    'array of arguments',
                    ['foo=bar', 'husel=pusel'],
                    'https://example.com/?foo=bar&husel=pusel',
                ];
                yield [
                    'object with array',
                    { foo: ['bar', 'baz'] },
                    'https://example.com/?foo[0]=bar&foo[1]=baz',
                ];
                yield [
                    'complex object',
                    {
                        foo: 'bar',
                        nested: {
                            husel: 'pusel',
                            bar: 'baz',
                            array: ['5', '6']
                        },
                        array: ['1', '2']
                    },
                    'https://example.com/?foo=bar&nested[husel]=pusel&nested[bar]=baz&nested[array][0]=5&nested[array][1]=6&array[0]=1&array[1]=2',
                ];
                yield [
                    'complex, deeply nested object',
                    {
                        foo: 'bar',
                        nested: {
                            husel: 'pusel',
                            bar: 'baz',
                            array: ['5', '6'],
                            deep_nested: {
                                husel: 'pusel',
                                bar: 'baz',
                                array: ['5', '6']
                            },
                        },
                        array: ['1', '2']
                    },
                    'https://example.com/?foo=bar&nested[husel]=pusel&nested[bar]=baz&nested[array][0]=5&nested[array][1]=6&nested[deep_nested][husel]=pusel&nested[deep_nested][bar]=baz&nested[deep_nested][array][0]=5&nested[deep_nested][array][1]=6&array[0]=1&array[1]=2',
                ];
            }
            for (let providedData of queryArgumentsDataProvider()) {
                let [name, input, expected] = providedData;
                it('with ' + name, () => {
                    (new AjaxRequest('https://example.com/')).withQueryArguments(input).get();
                    expect(window.fetch).toHaveBeenCalledWith(expected, jasmine.objectContaining({ method: 'GET' }));
                });
            }
        });
    });

});
