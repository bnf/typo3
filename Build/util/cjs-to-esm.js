const provideImports = (imports) => {
  const src = []
  imports.forEach(module => {
    const variableName = '__import_' + module.replace('/', '_').replace('@','').replace('-', '_')
    src.push('import ' + variableName + ' from "' + module + '"')
  })

  src.push('var require = function(name) {');
  src.push('  switch (name) {');
  imports.forEach(module => {
    const variableName = '__import_' + module.replace('/', '_').replace('@','').replace('-', '_')
    src.push('  case "' + module + '":');
    src.push('    return ' + variableName)
  })

  src.push('  }');
  src.push('  throw new Error("module " + name + " missing")')
  src.push('}');

  return src.join('\n');
}

const cjsToEsm = (source, imports, prefix) => {
  imports = imports || [];
  prefix = prefix || ''
  source = source.replace(/\/\/# sourceMappingURL=[^ ]+/, '');
  const code = [
    'export default (new function () {',
    '  const module = { exports: {} };',
    '  const exports = module.exports;',
    '  const define = null;',
    source,
    '  this.module = module',
    '}).module.exports'
  ];

  if (imports.length > 0) {
    code.unshift(provideImports(imports));
  }

  if (prefix) {
    code.unshift(prefix);
  }

  return code.join('\n');
}

exports.cjsToEsm = cjsToEsm;
