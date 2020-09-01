import Icons from '../Icons.mjs';
import { AbstractAction } from './AbstractAction.mjs';

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
 * Action used when an operation execution time is unknown.
 */
class DeferredAction extends AbstractAction {
    async execute(el) {
        Icons.getIcon('spinner-circle-light', Icons.sizes.small).then((spinner) => {
            el.innerHTML = spinner;
        });
        return await this.executeCallback();
    }
    async executeCallback() {
        return await this.callback();
    }
}

export default DeferredAction;
