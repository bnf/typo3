define(['../../../../core/Resources/Public/JavaScript/Contrib/jquery', '../../../../backend/Resources/Public/JavaScript/Modal', '../../../../backend/Resources/Public/JavaScript/Utility/MessageUtility'], function (jquery, Modal, MessageUtility) { 'use strict';

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
     * Module: TYPO3/CMS/Recordlist/ElementBrowser
     * @exports TYPO3/CMS/Recordlist/ElementBrowser
     * ElementBrowser communication with parent windows
     */
    class ElementBrowser {
        constructor() {
            this.opener = null;
            this.thisScriptUrl = '';
            this.mode = '';
            this.formFieldName = '';
            this.fieldReference = '';
            this.fieldReferenceSlashed = '';
            this.rte = {
                parameters: '',
                configuration: '',
            };
            this.irre = {
                objectId: 0,
            };
            this.focusOpenerAndClose = () => {
                if (this.getParent()) {
                    this.getParent().focus();
                }
                Modal.dismiss();
                close();
            };
            jquery(() => {
                const data = jquery('body').data();
                this.thisScriptUrl = data.thisScriptUrl;
                this.mode = data.mode;
                this.formFieldName = data.formFieldName;
                this.fieldReference = data.fieldReference;
                this.fieldReferenceSlashed = data.fieldReferenceSlashed;
                this.rte.parameters = data.rteParameters;
                this.rte.configuration = data.rteConfiguration;
                this.irre.objectId = data.irreObjectId;
            });
        }
        setReferences() {
            if (this.getParent() && this.getParent().content && this.getParent().content.document.editform
                && this.getParent().content.document.editform[this.formFieldName]) {
                this.targetDoc = this.getParent().content.document;
                this.elRef = this.targetDoc.editform[this.formFieldName];
                return true;
            }
            else {
                return false;
            }
        }
        /**
         * Dynamically calls a function on a given context object.
         */
        executeFunctionByName(functionName, context, ...args) {
            const namespaces = functionName.split('.');
            const func = namespaces.pop();
            for (let namespace of namespaces) {
                context = context[namespace];
            }
            return context[func].apply(context, args);
        }
        /**
         * Returns the parent document object
         */
        getParent() {
            if (this.opener === null) {
                if (typeof window.parent !== 'undefined' &&
                    typeof window.parent.document.list_frame !== 'undefined' &&
                    window.parent.document.list_frame.parent.document.querySelector('.t3js-modal-iframe') !== null) {
                    this.opener = window.parent.document.list_frame;
                }
                else if (typeof window.parent !== 'undefined' &&
                    typeof window.parent.frames.list_frame !== 'undefined' &&
                    window.parent.frames.list_frame.parent.document.querySelector('.t3js-modal-iframe') !== null) {
                    this.opener = window.parent.frames.list_frame;
                }
                else if (typeof window.frames !== 'undefined' &&
                    typeof window.frames.frameElement !== 'undefined' &&
                    window.frames.frameElement !== null &&
                    window.frames.frameElement.classList.contains('t3js-modal-iframe')) {
                    this.opener = window.frames.frameElement.contentWindow.parent;
                }
                else if (window.opener) {
                    this.opener = window.opener;
                }
            }
            return this.opener;
        }
        insertElement(table, uid, type, filename, fp, filetype, imagefile, action, close) {
            // Call a check function in the opener window (e.g. for uniqueness handling):
            if (this.irre.objectId) {
                if (this.getParent()) {
                    const message = {
                        actionName: 'typo3:foreignRelation:insert',
                        objectGroup: this.irre.objectId,
                        table: table,
                        uid: uid,
                    };
                    MessageUtility.MessageUtility.send(message, this.getParent());
                }
                else {
                    alert('Error - reference to main window is not set properly!');
                    this.focusOpenerAndClose();
                }
                if (close) {
                    this.focusOpenerAndClose();
                }
                return true;
            }
            if (this.fieldReference && !this.rte.parameters && !this.rte.configuration) {
                this.addElement(filename, table + '_' + uid, fp, close);
            }
            return false;
        }
        addElement(elName, elValue, altElValue, close) {
            if (this.getParent()) {
                const message = {
                    actionName: 'typo3:elementBrowser:elementAdded',
                    fieldName: this.fieldReference,
                    value: altElValue ? altElValue : elValue,
                    label: elName
                };
                MessageUtility.MessageUtility.send(message, this.getParent());
                if (close) {
                    this.focusOpenerAndClose();
                }
            }
            else {
                alert('Error - reference to main window is not set properly!');
                this.focusOpenerAndClose();
            }
        }
    }
    var ElementBrowser$1 = new ElementBrowser();

    return ElementBrowser$1;

});
