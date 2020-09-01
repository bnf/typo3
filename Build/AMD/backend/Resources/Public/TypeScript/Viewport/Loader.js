define(['../Enum/Viewport/ScaffoldIdentifier', 'nprogress'], function (ScaffoldIdentifier, NProgress) { 'use strict';

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    var NProgress__default = /*#__PURE__*/_interopDefaultLegacy(NProgress);

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
    class Loader {
        static start() {
            NProgress__default['default'].configure({ parent: ScaffoldIdentifier.ScaffoldIdentifierEnum.contentModule, showSpinner: false });
            NProgress__default['default'].start();
        }
        static finish() {
            NProgress__default['default'].done();
        }
    }

    return Loader;

});
