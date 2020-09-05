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
 * Gets the module properties from module menu markup (data attributes)
 *
 * @param {string} name
 * @returns {Module}
 * @internal
 */
function getRecordFromName(name) {
    const moduleElement = document.getElementById(name);
    if (!moduleElement) {
        return {
            name: name,
            component: '',
            navigationComponentId: '',
            navigationFrameScript: '',
            navigationFrameScriptParam: '',
            link: ''
        };
    }
    return {
        name: name,
        component: moduleElement.dataset.component,
        navigationComponentId: moduleElement.dataset.navigationcomponentid,
        navigationFrameScript: moduleElement.dataset.navigationframescript,
        navigationFrameScriptParam: moduleElement.dataset.navigationframescriptparameters,
        link: moduleElement.dataset.link
    };
}

export { getRecordFromName };
