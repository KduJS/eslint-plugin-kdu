/**
 * @author NKDuy
 * See LICENSE file in root directory for full license.
 */
'use strict'

const { wrapCoreRule, flatten } = require('../utils')

// eslint-disable-next-line no-invalid-meta, no-invalid-meta-docs-categories
module.exports = wrapCoreRule('quote-props', {
  skipDynamicArguments: true,
  preprocess(context, { wrapContextToOverrideProperties, defineVisitor }) {
    const sourceCode = context.getSourceCode()
    /**
     * @type {'"' | "'" | null}
     */
    let htmlQuote = null
    defineVisitor({
      /** @param {KExpressionContainer} node */
      'KAttribute > KExpressionContainer.value'(node) {
        const text = sourceCode.getText(node)
        const firstChar = text[0]
        htmlQuote = firstChar === "'" || firstChar === '"' ? firstChar : null
      },
      'KAttribute > KExpressionContainer.value:exit'() {
        htmlQuote = null
      }
    })

    wrapContextToOverrideProperties({
      // Override the report method and replace the quotes in the fixed text with safe quotes.
      report(descriptor) {
        if (htmlQuote) {
          const expectedQuote = htmlQuote === '"' ? "'" : '"'
          context.report({
            ...descriptor,
            *fix(fixer) {
              for (const fix of flatten(
                descriptor.fix && descriptor.fix(fixer)
              )) {
                yield fixer.replaceTextRange(
                  fix.range,
                  fix.text.replace(/["']/gu, expectedQuote)
                )
              }
            }
          })
        } else {
          context.report(descriptor)
        }
      }
    })
  }
})
