/**
 * @fileoverview enforce specific casing for component definition name
 * @author NKDuy
 */
'use strict'

const utils = require('../utils')
const casing = require('../utils/casing')
const allowedCaseOptions = ['PascalCase', 'kebab-case']

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'enforce specific casing for component definition name',
      categories: ['kdu3-strongly-recommended', 'strongly-recommended'],
      url: 'https://kdujs-eslint.web.app/rules/component-definition-name-casing.html'
    },
    fixable: 'code', // or "code" or "whitespace"
    schema: [
      {
        enum: allowedCaseOptions
      }
    ]
  },
  /** @param {RuleContext} context */
  create(context) {
    const options = context.options[0]
    const caseType =
      allowedCaseOptions.indexOf(options) !== -1 ? options : 'PascalCase'

    // ----------------------------------------------------------------------
    // Public
    // ----------------------------------------------------------------------

    /**
     * @param {Literal | TemplateLiteral} node
     */
    function convertName(node) {
      /** @type {string} */
      let nodeValue
      /** @type {Range} */
      let range
      if (node.type === 'TemplateLiteral') {
        const quasis = node.quasis[0]
        nodeValue = quasis.value.cooked
        range = quasis.range
      } else {
        nodeValue = `${node.value}`
        range = node.range
      }

      if (!casing.getChecker(caseType)(nodeValue)) {
        context.report({
          node,
          message: 'Property name "{{value}}" is not {{caseType}}.',
          data: {
            value: nodeValue,
            caseType
          },
          fix: (fixer) =>
            fixer.replaceTextRange(
              [range[0] + 1, range[1] - 1],
              casing.getExactConverter(caseType)(nodeValue)
            )
        })
      }
    }

    /**
     * @param {Expression | SpreadElement} node
     * @returns {node is (Literal | TemplateLiteral)}
     */
    function canConvert(node) {
      return (
        node.type === 'Literal' ||
        (node.type === 'TemplateLiteral' &&
          node.expressions.length === 0 &&
          node.quasis.length === 1)
      )
    }

    return Object.assign(
      {},
      utils.executeOnCallKduComponent(context, (node) => {
        if (node.arguments.length === 2) {
          const argument = node.arguments[0]

          if (canConvert(argument)) {
            convertName(argument)
          }
        }
      }),
      utils.executeOnKdu(context, (obj) => {
        const node = utils.findProperty(obj, 'name')

        if (!node) return
        if (!canConvert(node.value)) return
        convertName(node.value)
      })
    )
  }
}
