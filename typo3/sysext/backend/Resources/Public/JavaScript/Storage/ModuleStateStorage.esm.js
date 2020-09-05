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
 * Module State previous known as `fsMod` with the previous description:
 *
 * > Used in main modules with a frameset for submodules to keep the ID
 * > between modules Typically that is set by something like this in a
 * > Web>* sub module
 *
 * Reading from `fsMod` is still possible as fall-back, however write
 * access is only possible via static API in this `ModuleStateStorage` class.
 *
 * @exports TYPO3/CMS/Backend/Storage/ModuleStateStorage
 */
class ModuleStateStorage {
    static update(module, identifier, selected, mount) {
        if (typeof identifier === 'number') {
            identifier = identifier.toString(10);
        }
        else if (typeof identifier !== 'string') {
            throw new SyntaxError('identifier must be of type string');
        }
        if (typeof mount === 'number') {
            mount = mount.toString(10);
        }
        else if (typeof mount !== 'string' && typeof mount !== 'undefined' && mount !== null) {
            throw new SyntaxError('mount must be of type string');
        }
        const state = ModuleStateStorage.assignProperties({ mount, identifier, selected }, ModuleStateStorage.fetch(module));
        ModuleStateStorage.commit(module, state);
    }
    static updateWithCurrentMount(module, identifier, selected) {
        ModuleStateStorage.update(module, identifier, selected, ModuleStateStorage.current(module).mount);
    }
    static current(module) {
        return ModuleStateStorage.fetch(module) || ModuleStateStorage.createCurrentState();
    }
    static purge() {
        Object.keys(sessionStorage)
            .filter((key) => key.startsWith(ModuleStateStorage.prefix))
            .forEach((key) => sessionStorage.removeItem(key));
    }
    static fetch(module) {
        const data = sessionStorage.getItem(ModuleStateStorage.prefix + module);
        if (data === null) {
            return null;
        }
        return JSON.parse(data);
    }
    static commit(module, state) {
        sessionStorage.setItem(ModuleStateStorage.prefix + module, JSON.stringify(state));
    }
    static assignProperties(change, state) {
        let target = Object.assign(ModuleStateStorage.createCurrentState(), state);
        if (change.mount) {
            target.mount = change.mount;
        }
        if (change.identifier) {
            target.identifier = change.identifier;
        }
        if (change.selected) {
            target.selection = target.identifier;
        }
        return target;
    }
    static createCurrentState() {
        return { mount: null, identifier: '', selection: null };
    }
}
ModuleStateStorage.prefix = 't3-module-state-';
// exposing `ModuleStateStorage`
window.ModuleStateStorage = ModuleStateStorage;
/**
 * Provides fallback handling for reading from `top.fsMod` directly.
 * + `top.fsMod.recentIds.web`
 * + `top.fsMod.navFrameHighlightedID.web`
 * + `top.fsMod.currentBank`
 *
 * @deprecated `top.fsMod` is deprecated, will be removed in TYPO3 v12.0
 */
if (!top.fsMod || !top.fsMod.isProxy) {
    const proxy = (aspect) => {
        return new Proxy({}, {
            get(target, p) {
                const prop = p.toString();
                const current = ModuleStateStorage.current(prop);
                if (aspect === 'identifier') {
                    return current.identifier;
                }
                if (aspect === 'selection') {
                    return current.selection;
                }
                return undefined;
            },
            set(target, p, value, receiver) {
                throw new Error('Writing to fsMod is not possible anymore, use ModuleStateStorage instead.');
            }
        });
    };
    const fsMod = {
        isProxy: true,
        recentIds: {},
        navFrameHighlightedID: {},
        currentBank: '0'
    };
    /*
     */
    top.fsMod = new Proxy(fsMod, {
        get(target, p) {
            const prop = p.toString();
            if (prop === 'isProxy') {
                return true;
            }
            console.warn('Reading from fsMod is deprecated, use ModuleStateStorage instead.');
            if (prop === 'recentIds') {
                return proxy('identifier');
            }
            if (prop === 'navFrameHighlightedID') {
                return proxy('selection');
            }
            if (prop === 'currentBank') {
                return ModuleStateStorage.current('web').mount;
            }
            return undefined;
        },
        set(target, p, value, receiver) {
            throw new Error('Writing to fsMod is not possible anymore, use ModuleStateStorage instead.');
        }
    });
}

export { ModuleStateStorage };
