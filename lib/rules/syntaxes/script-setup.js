/**
 * @author NKDuy
 * See LICENSE file in root directory for full license.
 */
'use strict'

const utils = require('../../utils')

module.exports = {
  supported: '>=3.0.0',
  /** @param {RuleContext} context @returns {TemplateListener} */
  createScriptVisitor(context) {
    const scriptSetup = utils.getScriptSetupElement(context)
    if (!scriptSetup) {
      return {}
    }
    const reportNode =
      utils.getAttribute(scriptSetup, 'setup') || scriptSetup.startTag
    return {
      Program() {
        context.report({
          node: reportNode,
          messageId: 'forbiddenScriptSetup'
        })
      }
    }
  }
}
