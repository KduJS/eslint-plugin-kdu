/**
 * @fileoverview Define the number of attributes allows per line
 * @author NKDuy
 */
'use strict'

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------
const utils = require('../utils')

module.exports = {
  meta: {
    type: 'layout',
    docs: {
      description: 'enforce the maximum number of attributes per line',
      categories: ['kdu3-strongly-recommended', 'strongly-recommended'],
      url: 'https://kdujs-eslint.web.app/rules/max-attributes-per-line.html'
    },
    fixable: 'whitespace', // or "code" or "whitespace"
    schema: [
      {
        type: 'object',
        properties: {
          singleline: {
            anyOf: [
              {
                type: 'number',
                minimum: 1
              },
              {
                type: 'object',
                properties: {
                  max: {
                    type: 'number',
                    minimum: 1
                  }
                },
                additionalProperties: false
              }
            ]
          },
          multiline: {
            anyOf: [
              {
                type: 'number',
                minimum: 1
              },
              {
                type: 'object',
                properties: {
                  max: {
                    type: 'number',
                    minimum: 1
                  }
                },
                additionalProperties: false
              }
            ]
          }
        },
        additionalProperties: false
      }
    ]
  },
  /** @param {RuleContext} context */
  create(context) {
    const sourceCode = context.getSourceCode()
    const configuration = parseOptions(context.options[0])
    const multilineMaximum = configuration.multiline
    const singlelinemMaximum = configuration.singleline
    const template =
      context.parserServices.getTemplateBodyTokenStore &&
      context.parserServices.getTemplateBodyTokenStore()

    return utils.defineTemplateBodyVisitor(context, {
      KStartTag(node) {
        const numberOfAttributes = node.attributes.length

        if (!numberOfAttributes) return

        if (utils.isSingleLine(node)) {
          if (numberOfAttributes > singlelinemMaximum) {
            showErrors(node.attributes.slice(singlelinemMaximum))
          }
        }

        if (!utils.isSingleLine(node)) {
          groupAttrsByLine(node.attributes)
            .filter((attrs) => attrs.length > multilineMaximum)
            .forEach((attrs) => showErrors(attrs.splice(multilineMaximum)))
        }
      }
    })

    // ----------------------------------------------------------------------
    // Helpers
    // ----------------------------------------------------------------------
    /**
     * @param {any} options
     */
    function parseOptions(options) {
      const defaults = {
        singleline: 1,
        multiline: 1
      }

      if (options) {
        if (typeof options.singleline === 'number') {
          defaults.singleline = options.singleline
        } else if (typeof options.singleline === 'object') {
          if (typeof options.singleline.max === 'number') {
            defaults.singleline = options.singleline.max
          }
        }

        if (options.multiline) {
          if (typeof options.multiline === 'number') {
            defaults.multiline = options.multiline
          } else if (typeof options.multiline === 'object') {
            if (typeof options.multiline.max === 'number') {
              defaults.multiline = options.multiline.max
            }
          }
        }
      }

      return defaults
    }

    /**
     * @param {(KDirective | KAttribute)[]} attributes
     */
    function showErrors(attributes) {
      attributes.forEach((prop, i) => {
        context.report({
          node: prop,
          loc: prop.loc,
          message: "'{{name}}' should be on a new line.",
          data: { name: sourceCode.getText(prop.key) },
          fix(fixer) {
            if (i !== 0) return null

            // Find the closest token before the current prop
            // that is not a white space
            const prevToken = /** @type {Token} */ (
              template.getTokenBefore(prop, {
                filter: (token) => token.type !== 'HTMLWhitespace'
              })
            )

            /** @type {Range} */
            const range = [prevToken.range[1], prop.range[0]]

            return fixer.replaceTextRange(range, '\n')
          }
        })
      })
    }

    /**
     * @param {(KDirective | KAttribute)[]} attributes
     */
    function groupAttrsByLine(attributes) {
      const propsPerLine = [[attributes[0]]]

      attributes.reduce((previous, current) => {
        if (previous.loc.end.line === current.loc.start.line) {
          propsPerLine[propsPerLine.length - 1].push(current)
        } else {
          propsPerLine.push([current])
        }
        return current
      })

      return propsPerLine
    }
  }
}
