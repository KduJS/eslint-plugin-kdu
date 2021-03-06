/**
 * @author NKDuy
 * See LICENSE file in root directory for full license.
 */
'use strict'

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const { defineTemplateBodyVisitor } = require('../utils')

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

/**
 * count ObjectExpression element
 * @param {KDirective & {value: KExpressionContainer & {expression: ArrayExpression}}} node
 * @return {number}
 */
function countObjectExpression(node) {
  return node.value.expression.elements.filter(
    (element) => element && element.type === 'ObjectExpression'
  ).length
}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'disallow to pass multiple objects into array to class',
      categories: undefined,
      url: 'https://kdujs-eslint.web.app/rules/no-multiple-objects-in-class.html'
    },
    fixable: null,
    schema: [],
    messages: {
      unexpected: 'Unexpected multiple objects. Merge objects.'
    }
  },
  /** @param {RuleContext} context */
  create(context) {
    return defineTemplateBodyVisitor(context, {
      /** @param {KDirective & {value: KExpressionContainer & {expression: ArrayExpression}}} node */
      'KAttribute[directive=true][key.argument.name="class"][key.name.name="bind"][value.expression.type="ArrayExpression"]'(
        node
      ) {
        if (countObjectExpression(node) > 1) {
          context.report({
            node,
            loc: node.loc,
            messageId: 'unexpected'
          })
        }
      }
    })
  }
}
