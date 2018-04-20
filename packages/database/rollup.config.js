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
  'mongodb': 'mongodb'
};

module.exports = {
  entry: '../../dist/packages-dist/database/esm5/database.js',
  dest: '../../dist/packages-dist/database/bundles/database.umd.js',
  format: 'umd',
  exports: 'named',
  amd: {id: '@tdadmin/database'},
  moduleName: 'td.database',
  plugins: [resolve(), sourcemaps()],
  external: Object.keys(globals),
  globals: globals
};
