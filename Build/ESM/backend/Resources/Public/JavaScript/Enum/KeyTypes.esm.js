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
var KeyTypesEnum;
(function (KeyTypesEnum) {
    KeyTypesEnum[KeyTypesEnum["ENTER"] = 13] = "ENTER";
    KeyTypesEnum[KeyTypesEnum["ESCAPE"] = 27] = "ESCAPE";
    KeyTypesEnum[KeyTypesEnum["SPACE"] = 32] = "SPACE";
    KeyTypesEnum[KeyTypesEnum["END"] = 35] = "END";
    KeyTypesEnum[KeyTypesEnum["HOME"] = 36] = "HOME";
    KeyTypesEnum[KeyTypesEnum["LEFT"] = 37] = "LEFT";
    KeyTypesEnum[KeyTypesEnum["UP"] = 38] = "UP";
    KeyTypesEnum[KeyTypesEnum["RIGHT"] = 39] = "RIGHT";
    KeyTypesEnum[KeyTypesEnum["DOWN"] = 40] = "DOWN";
})(KeyTypesEnum || (KeyTypesEnum = {}));

export { KeyTypesEnum };
