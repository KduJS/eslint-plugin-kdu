/**
 * @author NKDuy
 * See LICENSE file in root directory for full license.
 */
'use strict'

const utils = require('../utils')
const scopeAttribute = require('./syntaxes/scope-attribute')

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'disallow deprecated `scope` attribute (in Kdu.js 2.5.0+)',
      categories: ['kdu3-essential'],
      url: 'https://kdujs-eslint.web.app/rules/no-deprecated-scope-attribute.html'
    },
    fixable: 'code',
    schema: [],
    messages: {
      forbiddenScopeAttribute: '`scope` attributes are deprecated.'
    }
  },
  /** @param {RuleContext} context */
  create(context) {
    const templateBodyVisitor =
      scopeAttribute.createTemplateBodyVisitor(context)
    return utils.defineTemplateBodyVisitor(context, templateBodyVisitor)
  }
}
