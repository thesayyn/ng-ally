/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const resolve = require('rollup-plugin-node-resolve');
const sourcemaps = require('rollup-plugin-sourcemaps');

const globals = {
  '@angular/core': 'ng.core',
  'express': 'express',
};

module.exports = {
  entry: '../../dist/packages-dist/platform-server/esm5/platform-server.js',
  dest: '../../dist/packages-dist/platform-server/bundles/platform-server.umd.js',
  format: 'umd',
  exports: 'named',
  amd: {id: '@tdadmin/platform-server'},
  moduleName: 'td.platformServer',
  plugins: [resolve(), sourcemaps()],
  external: Object.keys(globals),
  globals: globals
};
