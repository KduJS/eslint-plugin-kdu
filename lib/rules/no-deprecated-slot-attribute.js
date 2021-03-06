/**
 * @author NKDuy
 * See LICENSE file in root directory for full license.
 */
'use strict'

const utils = require('../utils')
const slotAttribute = require('./syntaxes/slot-attribute')

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'disallow deprecated `slot` attribute (in Kdu.js 2.6.0+)',
      categories: ['kdu3-essential'],
      url: 'https://kdujs-eslint.web.app/rules/no-deprecated-slot-attribute.html'
    },
    fixable: 'code',
    schema: [],
    messages: {
      forbiddenSlotAttribute: '`slot` attributes are deprecated.'
    }
  },
  /** @param {RuleContext} context */
  create(context) {
    const templateBodyVisitor = slotAttribute.createTemplateBodyVisitor(context)
    return utils.defineTemplateBodyVisitor(context, templateBodyVisitor)
  }
}
