/**
 * @author NKDuy
 */
'use strict'

const { wrapCoreRule } = require('../utils')

// eslint-disable-next-line no-invalid-meta, no-invalid-meta-docs-categories
module.exports = wrapCoreRule('template-curly-spacing', {
  skipDynamicArguments: true,
  applyDocument: true
})
