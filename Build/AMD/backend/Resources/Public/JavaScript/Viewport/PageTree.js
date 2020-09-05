define(function () { 'use strict';

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
    class PageTree {
        constructor(instance) {
            this.instance = null;
            this.instance = instance;
        }
        refreshTree() {
            if (this.instance !== null) {
                this.instance.refreshOrFilterTree();
            }
        }
        setTemporaryMountPoint(pid) {
            if (this.instance !== null) {
                this.instance.setTemporaryMountPoint(pid);
            }
        }
        unsetTemporaryMountPoint() {
            if (this.instance !== null) {
                this.instance.unsetTemporaryMountPoint();
            }
        }
        selectNode(node) {
            if (this.instance !== null) {
                this.instance.selectNode(node);
            }
        }
        getFirstNode() {
            if (this.instance !== null) {
                return this.instance.getFirstNode();
            }
            return {};
        }
    }

    return PageTree;

});
