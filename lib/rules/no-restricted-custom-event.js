/**
 * @author NKDuy
 * See LICENSE file in root directory for full license.
 */
'use strict'

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const { findVariable } = require('eslint-utils')
const utils = require('../utils')
const regexp = require('../utils/regexp')

// ------------------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------------------

/**
 * @typedef {object} ParsedOption
 * @property { (name: string) => boolean } test
 * @property {string|undefined} [message]
 * @property {string|undefined} [suggest]
 */

/**
 * @param {string} str
 * @returns {(str: string) => boolean}
 */
function buildMatcher(str) {
  if (regexp.isRegExp(str)) {
    const re = regexp.toRegExp(str)
    return (s) => {
      re.lastIndex = 0
      return re.test(s)
    }
  }
  return (s) => s === str
}
/**
 * @param {string|{event: string, message?: string, suggest?: string}} option
 * @returns {ParsedOption}
 */
function parseOption(option) {
  if (typeof option === 'string') {
    const matcher = buildMatcher(option)
    return {
      test(name) {
        return matcher(name)
      }
    }
  }
  const parsed = parseOption(option.event)
  parsed.message = option.message
  parsed.suggest = option.suggest
  return parsed
}

/**
 * Get the name param node from the given CallExpression
 * @param {CallExpression} node CallExpression
 * @returns { Literal & { value: string } | null }
 */
function getNameParamNode(node) {
  const nameLiteralNode = node.arguments[0]
  if (
    !nameLiteralNode ||
    nameLiteralNode.type !== 'Literal' ||
    typeof nameLiteralNode.value !== 'string'
  ) {
    // cannot check
    return null
  }

  return /** @type {Literal & { value: string }} */ (nameLiteralNode)
}
/**
 * Get the callee member node from the given CallExpression
 * @param {CallExpression} node CallExpression
 */
function getCalleeMemberNode(node) {
  const callee = utils.skipChainExpression(node.callee)

  if (callee.type === 'MemberExpression') {
    const name = utils.getStaticPropertyName(callee)
    if (name) {
      return { name, member: callee }
    }
  }
  return null
}
module.exports = {
  meta: {
    hasSuggestions: true,
    type: 'suggestion',
    docs: {
      description: 'disallow specific custom event',
      categories: undefined,
      url: 'https://kdujs-eslint.web.app/rules/no-restricted-custom-event.html'
    },
    fixable: null,
    schema: {
      type: 'array',
      items: {
        oneOf: [
          { type: ['string'] },
          {
            type: 'object',
            properties: {
              event: { type: 'string' },
              message: { type: 'string', minLength: 1 },
              suggest: { type: 'string' }
            },
            required: ['event'],
            additionalProperties: false
          }
        ]
      },
      uniqueItems: true,
      minItems: 0
    },

    messages: {
      // eslint-disable-next-line eslint-plugin/report-message-format
      restrictedEvent: '{{message}}',
      instead: 'Instead, change to `{{suggest}}`.'
    }
  },
  /** @param {RuleContext} context */
  create(context) {
    /** @type {Map<ObjectExpression, {contextReferenceIds:Set<Identifier>,emitReferenceIds:Set<Identifier>}>} */
    const setupContexts = new Map()
    /** @type {ParsedOption[]} */
    const options = context.options.map(parseOption)

    /**
     * @param { Literal & { value: string } } nameLiteralNode
     */
    function verify(nameLiteralNode) {
      const name = nameLiteralNode.value

      for (const option of options) {
        if (option.test(name)) {
          const message =
            option.message || `Using \`${name}\` event is not allowed.`
          context.report({
            node: nameLiteralNode,
            messageId: 'restrictedEvent',
            data: { message },
            suggest: option.suggest
              ? [
                  {
                    fix(fixer) {
                      const sourceCode = context.getSourceCode()
                      return fixer.replaceText(
                        nameLiteralNode,
                        `${
                          sourceCode.text[nameLiteralNode.range[0]]
                        }${JSON.stringify(option.suggest)
                          .slice(1, -1)
                          .replace(/'/gu, "\\'")}${
                          sourceCode.text[nameLiteralNode.range[1] - 1]
                        }`
                      )
                    },
                    messageId: 'instead',
                    data: { suggest: option.suggest }
                  }
                ]
              : []
          })
          break
        }
      }
    }

    return utils.defineTemplateBodyVisitor(
      context,
      {
        CallExpression(node) {
          const callee = node.callee
          const nameLiteralNode = getNameParamNode(node)
          if (!nameLiteralNode) {
            // cannot check
            return
          }
          if (callee.type === 'Identifier' && callee.name === '$emit') {
            verify(nameLiteralNode)
          }
        }
      },
      utils.compositingVisitors(
        utils.defineKduVisitor(context, {
          onSetupFunctionEnter(node, { node: kduNode }) {
            const contextParam = utils.skipDefaultParamValue(node.params[1])
            if (!contextParam) {
              // no arguments
              return
            }
            if (
              contextParam.type === 'RestElement' ||
              contextParam.type === 'ArrayPattern'
            ) {
              // cannot check
              return
            }
            const contextReferenceIds = new Set()
            const emitReferenceIds = new Set()
            if (contextParam.type === 'ObjectPattern') {
              const emitProperty = utils.findAssignmentProperty(
                contextParam,
                'emit'
              )
              if (!emitProperty || emitProperty.value.type !== 'Identifier') {
                return
              }
              const emitParam = emitProperty.value
              // `setup(props, {emit})`
              const variable = findVariable(context.getScope(), emitParam)
              if (!variable) {
                return
              }
              for (const reference of variable.references) {
                emitReferenceIds.add(reference.identifier)
              }
            } else {
              // `setup(props, context)`
              const variable = findVariable(context.getScope(), contextParam)
              if (!variable) {
                return
              }
              for (const reference of variable.references) {
                contextReferenceIds.add(reference.identifier)
              }
            }
            setupContexts.set(kduNode, {
              contextReferenceIds,
              emitReferenceIds
            })
          },
          CallExpression(node, { node: kduNode }) {
            const nameLiteralNode = getNameParamNode(node)
            if (!nameLiteralNode) {
              // cannot check
              return
            }

            // verify setup context
            const setupContext = setupContexts.get(kduNode)
            if (setupContext) {
              const { contextReferenceIds, emitReferenceIds } = setupContext
              if (
                node.callee.type === 'Identifier' &&
                emitReferenceIds.has(node.callee)
              ) {
                // verify setup(props,{emit}) {emit()}
                verify(nameLiteralNode)
              } else {
                const emit = getCalleeMemberNode(node)
                if (
                  emit &&
                  emit.name === 'emit' &&
                  emit.member.object.type === 'Identifier' &&
                  contextReferenceIds.has(emit.member.object)
                ) {
                  // verify setup(props,context) {context.emit()}
                  verify(nameLiteralNode)
                }
              }
            }
          },
          onKduObjectExit(node) {
            setupContexts.delete(node)
          }
        }),
        {
          CallExpression(node) {
            const nameLiteralNode = getNameParamNode(node)
            if (!nameLiteralNode) {
              // cannot check
              return
            }
            const emit = getCalleeMemberNode(node)
            // verify $emit
            if (emit && emit.name === '$emit') {
              // verify this.$emit()
              verify(nameLiteralNode)
            }
          }
        }
      )
    )
  }
}
