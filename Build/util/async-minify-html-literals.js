const { default: MagicString } = require('magic-string');
const { parseLiterals } = require('parse-literals');
const {
  defaultValidation: validation,
  defaultShouldMinifyCSS: shouldMinifyCSS,
  defaultShouldMinify: shouldMinify
} = require('minify-html-literals');
const {
  defaultStrategy: strategy,
  defaultMinifyOptions
} = require('minify-html-literals/src/strategy');

/* Modification of 'minify-html-literals' to support a asynchronous minifyCSS routine */
async function minifyHTMLLiterals(source, options = {}) {
  const minifyOptions = {
    ...defaultMinifyOptions,
    ...(options.minifyOptions || {})
  };
  const templates = parseLiterals(source, { fileName: options.fileName });
  const ms = new MagicString(source);
  for (const template of templates) {
    const minifyHTML = shouldMinify(template);
    const minifyCSS = shouldMinifyCSS(template);
    if (!minifyHTML && !minifyCSS) {
      continue;
    }
    const placeholder = strategy.getPlaceholder(template.parts);
    validation.ensurePlaceholderValid(placeholder);
    const combined = strategy.combineHTMLStrings(template.parts, placeholder);
    let min;
    if (minifyCSS) {
      min = await minifyOptions.minifyCSS(combined);
    } else {
      min = strategy.minifyHTML(combined, minifyOptions);
    }
    const minParts = strategy.splitHTMLByPlaceholder(min, placeholder);
    validation.ensureHTMLPartsValid(template.parts, minParts);
    template.parts.forEach((part, index) => {
      if (part.start < part.end) {
        // Only overwrite if the literal part has text content
        ms.overwrite(part.start, part.end, minParts[index]);
      }
    });
  }

  const code = ms.toString();
  return code === source ? null : { code };
}
exports.minifyHTMLLiterals = minifyHTMLLiterals;
