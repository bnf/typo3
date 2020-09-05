// rollup.config.js
import typescript from '@rollup/plugin-typescript';
//import resolve from '@rollup/plugin-node-resolve';
import copy from 'rollup-plugin-copy'
import path from 'path';
//mport { eslint } from "rollup-plugin-eslint";
//import { terser } from "rollup-plugin-terser";
import amd from 'rollup-plugin-amd';
import { /*CompilerOptions,*/ findConfigFile, /*nodeModuleNameResolver,*/ sys } from 'typescript';
//import { typescriptPaths } from 'rollup-plugin-typescript-paths';
//import pkg from './package.json'


const contribDir = 'Sources/TypeScript/core/Resources/Public/JavaScript/Contrib';

const UMDtoES6 = (source) => {
  return [
    'export default (new function () {',
    'const module = { exports: {} };',
    'let exports = module.exports;',
    'let define = null;',
    source,
    'this.module = module',
    '}).module.exports'
  ].join('\n');
};

const provideImports = (imports) => {
  var src = new Array();
  imports.forEach(module => {
    var variableName = '__import_' + module.replace('/', '_').replace('@','')
    src.push('import ' + variableName + ' from "' + module + '"')
  })

  src.push('var require = function(name) {');
  src.push('  switch (name) {');
  imports.forEach(module => {
    var variableName = '__import_' + module.replace('/', '_').replace('@','')
    src.push('  case "' + module + '":');
    src.push('    return ' + variableName)
  })

  src.push('  }');
  src.push('  throw new Error("module " + name + " missing")')
  src.push('}');

  return src.join('\n');
}

const UMDemulateAMD = (source) => {
  return [
    "function define(dependencies, callback) {",
    "  var promises = [];",
    "  dependencies.forEach(function (v, i) {",
    "    promises[i] = import('/typo3/sysext/core/Resources/Public/JavaScript/Contrib/' + v + '.esm.js').then(module => { return { index: i, module: module } })",
    "  });",
    "  var args = []",
    "  Promise.all(promises).then(function(dependencies) {",
    "    dependencies.forEach(function (v) {",
    "      args[v.index] = v.module.default;",
    "    })",
    "    callback.apply(null, args);",
    "  });",
    "}",
    "define.amd = true;",
    source,
  ].join('\n');
}


const getTsConfig = (configPath) => {
	const defaults = { compilerOptions: {}, outDir: '.' };

	if (!configPath) {
		return defaults;
	}

	const configJson = sys.readFile(configPath);

	if (!configJson) {
		return defaults;
	}

	const config = JSON.parse(configJson);

	return { ...defaults, ...config };
};

export const sysextPaths = () => {
	const tsConfigPath = findConfigFile('./', sys.fileExists);
	const { compilerOptions, outDir } = getTsConfig(tsConfigPath);

	return {
		name: 'resolve-sysext-paths',
    resolveId: (importee, importer) => {

      //console.log(importee, importer)

      if (typeof importer === 'undefined' || importee.startsWith('\0') || !compilerOptions.paths) {
        return null;
      }

      if (importee === 'TYPO3/CMS/Install/chosen.jquery.min') {
        return path.resolve(__dirname, 'Sources', 'TypeScript', 'install', 'Resources', 'Public', 'JavaScript', 'Contrib', 'chosen.jquery' + '.mjs')
      }
      if (importee === 'TYPO3/CMS/Dashboard/Contrib/chartjs') {
        return path.resolve(__dirname, 'Sources', 'TypeScript', 'dashboard', 'Resources', 'Public', 'JavaScript', 'Contrib', 'chartjs' + '.mjs')
      }

      var mapping = {
        'jquery/autocomplete': 'jquery.autocomplete',
        'broadcastchannel': 'broadcastchannel-polyfill',
        'cm/lib/codemirror': 'codemirror',
      }

      if (importee in mapping) {
        importee = mapping[importee];
      }

      if (importee.indexOf('./') !== -1) {
        return null;
      }

      /* Ugly heuristic to differentiate between TYPO/CMS/Foo and jquery-ui/foo */
      if (importee.split('/').length > 2) {
        return null;
      }

      if (importer.indexOf('/') !== -1) {
        return path.resolve(__dirname, 'Sources', 'TypeScript', 'core', 'Resources', 'Public', 'JavaScript', 'Contrib', importee + '.mjs')
      }

      return null
    }
  }
}


export default {
  input: 'Sources/TypeScript/EntryPoint.ts',
  output: [
    { dir: 'AMD', format: 'amd', preserveModules: true, entryFileNames: '[name].js'/*, esModule: false*/ },
    { dir: '../typo3/sysext', format: 'esm', preserveModules: true, entryFileNames: '[name].esm.js' }
  ],
  treeshake: false,
  external: [
    //'broadcastchannel',
    //'bootstrap',
    //'ckeditor',
    //'cm/lib/codemirror',
    //'jquery/autocomplete',
    //'jquery-ui/droppable',
    //'jquery-ui/resizable',
    //'jquery-ui/draggable',
    //'tablesort.dotsep',
    //'twbs/bootstrap-datetimepicker',
    // Part of friendsoftypo3/rsaauth
    //'TYPO3/CMS/Rsaauth/RsaEncryptionModule',
    //'Sortable',
    //'TYPO3/CMS/Core/Contrib/imagesloaded.pkgd.min',
    //'TYPO3/CMS/Core/Contrib/jquery.autocomplete',
    //'TYPO3/CMS/Core/Contrib/jquery.minicolors',
    //'TYPO3/CMS/Install/chosen.jquery.min',
    //'TYPO3/CMS/Backend/FormEngine',
    //'TYPO3/CMS/Backend/FormEngineValidation',
    //'TYPO3/CMS/Backend/FormEngine/Element/SelectTree',
    //'TYPO3/CMS/Backend/FormEngine/Element/TreeToolbar',
    //'TYPO3/CMS/Backend/LegacyTree',
    //'TYPO3/CMS/Dashboard/Contrib/chartjs',
    //...Object.keys(pkg.dependencies || {})
    //"autosize",
    //"broadcastchannel-polyfill",
    //"chart.js",
    //"chosen-js",
    //"ckeditor-wordcount-plugin",
    //"ckeditor4",
    //"codemirror",
    //"cropperjs",
    //"d3",
    //"devbridge-autocomplete",
    //"eonasdan-bootstrap-datetimepicker",
    //"font-awesome",
    //"imagesloaded",
    //"jquery",
    //"jquery-ui",
    //"moment",
    //"moment-timezone",
    //"muuri",
    //"nprogress",
    //"requirejs",
    //"sortablejs",
    //"source-sans-pro",
    //"tablesort",
    //"taboverride",
    //"tagsort",
  ],
  plugins: [
    copy({
         targets: [
           { src: 'node_modules/cropperjs/dist/cropper.esm.js', dest: contribDir, rename: 'cropperjs.mjs' },

           /*
            * jQuery as native ES module would currently require a jquery fork of 4.0.0-pre(!):
            *   https://github.com/bnf/jquery#esm-bundle
            * But other components like bootstrap are not yet jquery 4 compatible, therefore we
            * transform the UMD bundle to ES6 instead
           { src: 'node_modules/jquery/dist/jquery.mjs', dest: contribDir, transform: contents => contents.toString() + [
               '',
               // Add jquery.trim which has been removed in jquery v4 but is needed by @todo
               'jQuery.trim = function( text ) {',
               '   var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;',
               '  return text == null ?',
               '  "" :',
               '  ( text + "" ).replace( rtrim, "" );',
               '};'
             ].join('\n')
           },
           */

           {
             // UMD sources, that need conversion to ES6
             src: [
               'node_modules/jquery/dist/jquery.js',
               'node_modules/autosize/dist/autosize.js',
               'node_modules/codemirror/lib/codemirror.js',
               'node_modules/d3/build/d3.js',
               'node_modules/imagesloaded/imagesloaded.pkgd.js',
               'node_modules/moment/moment.js',
               'node_modules/moment-timezone/moment-timezone.js',
               'node_modules/muuri/dist/muuri.js',
               'node_modules/nprogress/nprogress.js',
               'node_modules/sortablejs/Sortable.js',
               'node_modules/tablesort/src/tablesort.js',
               'node_modules/tablesort/src/sorts/tablesort.dotsep.js',
               'node_modules/taboverride/build/output/taboverride.js',
             ],
             dest: contribDir,
             rename: (name, extension) => name.replace('.pkgd', '') + '.mjs',
             transform: contents => UMDtoES6(contents.toString()),
           },
           {
             // UMD sources, that need conversion to ES6 and require jquery during load
             src: [
               'node_modules/devbridge-autocomplete/dist/jquery.autocomplete.js',
               'node_modules/@claviska/jquery-minicolors/jquery.minicolors.js',
               // todo: chartjs
             ],
             dest: contribDir,
             rename: (name, extension) => name.replace('.pkgd', '') + '.mjs',
             transform: contents => provideImports(['jquery']) + '\n' + UMDtoES6(contents.toString()),
           },
           {
             // UMD sources, that need conversion to ES6 and require jquery during load
             src: 'node_modules/chart.js/dist/Chart.js',
             dest: 'Sources/TypeScript/dashboard/Resources/Public/JavaScript/Contrib',
             rename: (name, extension) => 'chartjs.mjs',
             transform: contents => provideImports(['moment']) + '\n' + UMDtoES6(contents.toString()),
           },
           {
             // UMD sources, that need conversion to ES6 in Contrib subfolder jquery-ui
             src: [
               'node_modules/jquery-ui/ui/core.js',
               'node_modules/jquery-ui/ui/draggable.js',
               'node_modules/jquery-ui/ui/droppable.js',
               'node_modules/jquery-ui/ui/mouse.js',
               'node_modules/jquery-ui/ui/position.js',
               'node_modules/jquery-ui/ui/resizable.js',
               'node_modules/jquery-ui/ui/selectable.js',
               'node_modules/jquery-ui/ui/sortable.js',
               'node_modules/jquery-ui/ui/widget.js',
             ],
             dest: contribDir + '/jquery-ui',
             rename: (name, extension) => name + '.mjs',
             transform: contents => UMDtoES6(contents.toString()),
           },
           {
             // UMD sources, that need conversion to ES6 in subflder twbs
             // @todo: requires imports
             src: 'node_modules/eonasdan-bootstrap-datetimepicker/src/js/bootstrap-datetimepicker.js',
             dest: contribDir + '/twbs',
             rename: (name, extension) => name + '.mjs',
             transform: contents => UMDtoES6(contents.toString()),
           },
           {
             // UMD sources, that need conversion to ES6 and require jQuery as global
             src: 'node_modules/bootstrap/dist/js/bootstrap.js',
             dest: contribDir,
             rename: (name, extension) => name + '.mjs',
             transform: contents => 'import jQuery from "jquery";' + UMDtoES6(contents.toString()),
           },
           { src :'node_modules/ckeditor4/ckeditor.js', dest: contribDir, rename: (name, extension) => name + '.mjs' },
           {
             src: 'node_modules/broadcastchannel-polyfill/index.js',
             dest: contribDir,
             rename: 'broadcastchannel-polyfill.mjs',
           },
           {
             src: 'node_modules/chosen-js/chosen.jquery.js',
             dest: 'Sources/TypeScript/install/Resources/Public/JavaScript/Contrib',
             rename: (name, extension) => name + '.mjs',
            },

           // @todo AMD sources, use rollup-plugin-amd
           // e.g. ../typo3/sysext/form/Resources/Public/JavaScript/Backend/Contrib/jquery.mjs.nestedSortable.js

           {
             src: [
               '../typo3/sysext/backend/Resources/Public/JavaScript/FormEngineValidation.js',
               '../typo3/sysext/backend/Resources/Public/JavaScript/LegacyTree.js',
               // patched
               //'../typo3/sysext/backend/Resources/Public/JavaScript/SvgTree.js',
               //'../typo3/sysext/backend/Resources/Public/JavaScript/FormEngine.js',
             ],
             dest: 'Sources/TypeScript/backend/Resources/Public/JavaScript',
           },
           {
             src: [
               '../typo3/sysext/backend/Resources/Public/JavaScript/FormEngine/Element/SelectTree.js',
               '../typo3/sysext/backend/Resources/Public/JavaScript/FormEngine/Element/TreeToolbar.js',
              ],
             dest: 'Sources/TypeScript/backend/Resources/Public/JavaScript/FormEngine/Element',
           },
        ],
        hook: 'buildStart',
        verbose: true,
        copyOnce: true
    }),
    //resolve(),
    //eslint({configFile: './eslintrc.js', cache: true, cacheLocation: './.cache/eslintcache/'}),
    amd({
      include: 'Sources/TypeScript/**/*.js',
      exclude: [
        'Sources/TypeScript/backend/Resources/Public/JavaScript/FormEngine.js',
        'Sources/TypeScript/backend/Resources/Public/JavaScript/SvgTree.js'
      ],
    }),
    sysextPaths(),
    typescript({}),
    //typescriptPaths(),
    //sysextPaths(),
    //terser(),
  ]
}
