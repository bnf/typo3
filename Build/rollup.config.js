// rollup.config.js
import typescript from '@rollup/plugin-typescript';
//import resolve from '@rollup/plugin-node-resolve';
import copy from 'rollup-plugin-copy'
import path from 'path';
//mport { eslint } from "rollup-plugin-eslint";
//import { terser } from "rollup-plugin-terser";
import { /*CompilerOptions,*/ findConfigFile, /*nodeModuleNameResolver,*/ sys } from 'typescript';
//import { typescriptPaths } from 'rollup-plugin-typescript-paths';
//import pkg from './package.json'


const contribDir = 'Sources/TypeScript/core/Resources/Public/JavaScript/Contrib';

const UMDtoES6 = (source) => {
  return [
    'export default (new function () {',
    'const module = { exports: {} }',
    'let exports = module.exports',
    source,
    'this.module = module',
    '}).module.exports'
  ].join('\n');
};


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
      console.log(importee, importer)
			if (typeof importer === 'undefined' || importee.startsWith('\0') || !compilerOptions.paths) {
				return null;
			}


			//compilerOptions.paths.forEach((paths, path) => {
//      for (const [path, paths] of Object.entries(compilerOptions.paths)) {
//				if (new RegExp(path.replace('*', '\\w*')).test(importee)) {
//          return {
//            id: importee.replace(path.replace('*', ''), paths[0].replace('*', '')) /*+ '.mjs'*/,
//            //id: importee + '.js',
//            external: true
//          }
//        }
//      }

      if (importee.indexOf('./') !== -1) {
        return null;
      }

      //if (importee.indexOf('/') !== -1) {
      /* Ugly heuristic to differentiate between TYPO/CMS/Foo and jquery-ui/foo */
      if (importee.split('/').length > 2) {
        return null;
      }

      if (importer.indexOf('/') !== -1) {
        return path.resolve(__dirname, 'Sources', 'TypeScript', 'core', 'Resources', 'Public', 'JavaScript', 'Contrib', importee + '.mjs')
        //return path.relative(path.resolve(importer, '..'), path.resolve(__dirname, 'Sources', 'TypeScript', 'core', 'Resources', 'Public', 'JavaScript', 'Contrib', importee + '.mjs'))
      }

      return null
      /*
      return {
        id: 'TYPO3/CMS/Core/Contrib/' + importee,
        external: true
      }
      */
    }
  }
}


export default {
  input: 'Sources/TypeScript/EntryPoint.ts',
  output: [
    { dir: 'AMD', format: 'amd', preserveModules: true, entryFileNames: '[name].js'/*, esModule: false*/ },
    { dir: 'ESM', format: 'esm', preserveModules: true, entryFileNames: '[name].mjs' }
  ],
  treeshake: false,
  external: [
    'broadcastchannel',
    'bootstrap',
    'ckeditor',
    'cm/lib/codemirror',
    //'jquery/autocomplete',
    //'jquery-ui/droppable',
    //'jquery-ui/resizable',
    //'jquery-ui/draggable',
    //'tablesort.dotsep',
    'twbs/bootstrap-datetimepicker',
    // Part of friendsoftypo3/rsaauth
    'TYPO3/CMS/Rsaauth/RsaEncryptionModule',
    //'Sortable',
    'TYPO3/CMS/Core/Contrib/imagesloaded.pkgd.min',
    'TYPO3/CMS/Core/Contrib/jquery.autocomplete',
    'TYPO3/CMS/Core/Contrib/jquery.minicolors',
    'TYPO3/CMS/Install/chosen.jquery.min',
    'TYPO3/CMS/Backend/FormEngine',
    'TYPO3/CMS/Backend/FormEngineValidation',
    'TYPO3/CMS/Backend/FormEngine/Element/SelectTree',
    'TYPO3/CMS/Backend/FormEngine/Element/TreeToolbar',
    'TYPO3/CMS/Backend/LegacyTree',
    'TYPO3/CMS/Dashboard/Contrib/chartjs',
    //...Object.keys(pkg.dependencies || {})
    //"autosize",
    "broadcastchannel-polyfill",
    "chart.js",
    "chosen-js",
    "ckeditor-wordcount-plugin",
    "ckeditor4",
    "codemirror",
    //"cropperjs",
    //"d3",
    "devbridge-autocomplete",
    "eonasdan-bootstrap-datetimepicker",
    "font-awesome",
    //"imagesloaded",
    //"jquery",
    //"jquery-ui",
    //"moment",
    //"moment-timezone",
    //"muuri",
    //"nprogress",
    "requirejs",
    //"sortablejs",
    "source-sans-pro",
    //"tablesort",
    "taboverride",
    "tagsort",
  ],
  plugins: [
    copy({
         targets: [
           { src: 'node_modules/cropperjs/dist/cropper.esm.js', dest: contribDir, rename: 'cropper.mjs' },
           { src: 'node_modules/jquery/dist/jquery.mjs', dest: contribDir },
           {
             // UMD sources, that need conversion to ES6
             src: [
               'node_modules/autosize/dist/autosize.js',
               'node_modules/d3/build/d3.js',
               'node_modules/imagesloaded/imagesloaded.pkgd.js',
               'node_modules/@claviska/jquery-minicolors/jquery.minicolors.js',
               'node_modules/moment/moment.js',
               'node_modules/moment-timezone/moment-timezone.js',
               'node_modules/muuri/dist/muuri.js',
               'node_modules/nprogress/nprogress.js',
               'node_modules/sortablejs/Sortable.js',
               'node_modules/tablesort/src/tablesort.js',
               'node_modules/tablesort/src/sorts/tablesort.dotsep.js',
             ],
             dest: contribDir,
             rename: (name, extension) => name.replace('.pkgd', '') + '.mjs',
             transform: contents => UMDtoES6(contents.toString()),
           },
           {
             // UMD sources, that need conversion to ES6
             src: 'node_modules/devbridge-autocomplete/dist/jquery.autocomplete.js',
             dest: contribDir + '/jquery',
             rename: 'autocomplete.mjs',
             transform: contents => UMDtoES6(contents.toString()),
           },
           {
             // UMD sources, that need conversion to ES6
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
           // @todo AMD sources, use rollup-plugin-amd
           // e.g. ../typo3/sysext/form/Resources/Public/JavaScript/Backend/Contrib/jquery.mjs.nestedSortable.js
        ],
        hook: 'buildStart',
        verbose: true,
        copyOnce: true
    }),
    //resolve(),
    //eslint({configFile: './eslintrc.js', cache: true, cacheLocation: './.cache/eslintcache/'}),
    sysextPaths(),
    typescript({}),
    //typescriptPaths(),
    //sysextPaths(),
    //terser(),
  ]
}
