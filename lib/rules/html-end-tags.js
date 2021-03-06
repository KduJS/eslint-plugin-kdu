/**
 * @author NKDuy
 * See LICENSE file in root directory for full license.
 */
'use strict'

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const utils = require('../utils')

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'enforce end tag style',
      categories: ['kdu3-strongly-recommended', 'strongly-recommended'],
      url: 'https://kdujs-eslint.web.app/rules/html-end-tags.html'
    },
    fixable: 'code',
    schema: []
  },
  /** @param {RuleContext} context */
  create(context) {
    let hasInvalidEOF = false

    return utils.defineTemplateBodyVisitor(
      context,
      {
        KElement(node) {
          if (hasInvalidEOF) {
            return
          }

          const name = node.name
          const isVoid = utils.isHtmlVoidElementName(name)
          const isSelfClosing = node.startTag.selfClosing
          const hasEndTag = node.endTag != null

          if (!isVoid && !hasEndTag && !isSelfClosing) {
            context.report({
              node: node.startTag,
              loc: node.startTag.loc,
              message: "'<{{name}}>' should have end tag.",
              data: { name },
              fix: (fixer) => fixer.insertTextAfter(node, `</${name}>`)
            })
          }
        }
      },
      {
        Program(node) {
          hasInvalidEOF = utils.hasInvalidEOF(node)
        }
      }
    )
  }
}
