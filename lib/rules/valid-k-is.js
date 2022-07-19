/**
 * @fileoverview enforce valid `k-is` directives
 * @author NKDuy
 */
'use strict'

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const utils = require('../utils')

// ------------------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------------------

/**
 * Check whether the given node is valid or not.
 * @param {KElement} node The element node to check.
 * @returns {boolean} `true` if the node is valid.
 */
function isValidElement(node) {
  if (
    utils.isHtmlElementNode(node) &&
    !utils.isHtmlWellKnownElementName(node.rawName)
  ) {
    // Kdu-component
    return false
  }
  return true
}

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'enforce valid `k-is` directives',
      categories: ['kdu3-essential'],
      url: 'https://kdujs-eslint.web.app/rules/valid-k-is.html'
    },
    fixable: null,
    schema: [],
    messages: {
      unexpectedArgument: "'k-is' directives require no argument.",
      unexpectedModifier: "'k-is' directives require no modifier.",
      expectedValue: "'k-is' directives require that attribute value.",
      ownerMustBeHTMLElement:
        "'k-is' directive must be owned by a native HTML element, but '{{name}}' is not."
    }
  },
  /** @param {RuleContext} context */
  create(context) {
    return utils.defineTemplateBodyVisitor(context, {
      "KAttribute[directive=true][key.name.name='is']"(node) {
        if (node.key.argument) {
          context.report({
            node: node.key.argument,
            messageId: 'unexpectedArgument'
          })
        }
        if (node.key.modifiers.length > 0) {
          context.report({
            node,
            loc: {
              start: node.key.modifiers[0].loc.start,
              end: node.key.modifiers[node.key.modifiers.length - 1].loc.end
            },
            messageId: 'unexpectedModifier'
          })
        }
        if (!node.value || utils.isEmptyValueDirective(node, context)) {
          context.report({
            node,
            messageId: 'expectedValue'
          })
        }

        const element = node.parent.parent

        if (!isValidElement(element)) {
          const name = element.name
          context.report({
            node,
            messageId: 'ownerMustBeHTMLElement',
            data: { name }
          })
        }
      }
    })
  }
}