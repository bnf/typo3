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
var Sizes;
(function (Sizes) {
    Sizes["small"] = "small";
    Sizes["default"] = "default";
    Sizes["large"] = "large";
    Sizes["mega"] = "mega";
    Sizes["overlay"] = "overlay";
})(Sizes || (Sizes = {}));
var States;
(function (States) {
    States["default"] = "default";
    States["disabled"] = "disabled";
})(States || (States = {}));
var MarkupIdentifiers;
(function (MarkupIdentifiers) {
    MarkupIdentifiers["default"] = "default";
    MarkupIdentifiers["inline"] = "inline";
})(MarkupIdentifiers || (MarkupIdentifiers = {}));

export { MarkupIdentifiers, Sizes, States };
