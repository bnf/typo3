import { decorateProperty as o } from './base.esm.js';

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function e(e){return o({descriptor:r=>({get(){var r;return null===(r=this.renderRoot)||void 0===r?void 0:r.querySelectorAll(e)},enumerable:!0,configurable:!0})})}

export { e as queryAll };
