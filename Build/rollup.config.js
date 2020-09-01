// rollup.config.js
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
//import { typescriptPaths } from 'rollup-plugin-typescript-paths';
import pkg from './package.json'


export default {
  input: 'Sources/TypeScript/EntryPoint.ts',
  output: {
    dir: 'AMD',
    format: 'amd',
  },
  preserveModules: true,
  external: [
    'broadcastchannel',
    'bootstrap',
    'ckeditor',
    'cm/lib/codemirror',
    'jquery/autocomplete',
    'jquery-ui/droppable',
    'jquery-ui/resizable',
    'jquery-ui/draggable',
    'tablesort.dotsep',
    'twbs/bootstrap-datetimepicker',
    // Part of friendsoftypo3/rsaauth
    'TYPO3/CMS/Rsaauth/RsaEncryptionModule',
    'Sortable',
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
    ...Object.keys(pkg.dependencies || {})
  ],
  plugins: [
    typescript({tsBuildInfoFile:'AMD/tsconfig.tsbuildinfo'} ),
    //typescriptPaths(),
    terser(),
  ]
}
