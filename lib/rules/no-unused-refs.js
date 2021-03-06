/**
 * @fileoverview Disallow unused refs.
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
 * Extract names from references objects.
 * @param {KReference[]} references
 */
function getReferences(references) {
  return references.filter((ref) => ref.variable == null).map((ref) => ref.id)
}

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'disallow unused refs',
      categories: undefined,
      url: 'https://kdujs-eslint.web.app/rules/no-unused-refs.html'
    },
    fixable: null,
    schema: [],
    messages: {
      unused: "'{{name}}' is defined as ref, but never used."
    }
  },
  /** @param {RuleContext} context */
  create(context) {
    /** @type {Set<string>} */
    const usedRefs = new Set()

    /** @type {KLiteral[]} */
    const defineRefs = []
    let hasUnknown = false

    /**
     * Report all unused refs.
     */
    function reportUnusedRefs() {
      for (const defineRef of defineRefs) {
        if (usedRefs.has(defineRef.value)) {
          continue
        }

        context.report({
          node: defineRef,
          messageId: 'unused',
          data: {
            name: defineRef.value
          }
        })
      }
    }

    /**
     * Extract the use ref names for ObjectPattern.
     * @param {ObjectPattern} node
     * @returns {void}
     */
    function extractUsedForObjectPattern(node) {
      for (const prop of node.properties) {
        if (prop.type === 'Property') {
          const name = utils.getStaticPropertyName(prop)
          if (name) {
            usedRefs.add(name)
          } else {
            hasUnknown = true
            return
          }
        } else {
          hasUnknown = true
          return
        }
      }
    }
    /**
     * Extract the use ref names.
     * @param {Identifier | MemberExpression} refsNode
     * @returns {void}
     */
    function extractUsedForPattern(refsNode) {
      /** @type {Identifier | MemberExpression | ChainExpression} */
      let node = refsNode
      while (node.parent.type === 'ChainExpression') {
        node = node.parent
      }
      const parent = node.parent
      if (parent.type === 'AssignmentExpression') {
        if (parent.right === node) {
          if (parent.left.type === 'ObjectPattern') {
            // `({foo} = $refs)`
            extractUsedForObjectPattern(parent.left)
          } else if (parent.left.type === 'Identifier') {
            // `foo = $refs`
            hasUnknown = true
          }
        }
      } else if (parent.type === 'VariableDeclarator') {
        if (parent.init === node) {
          if (parent.id.type === 'ObjectPattern') {
            // `const {foo} = $refs`
            extractUsedForObjectPattern(parent.id)
          } else if (parent.id.type === 'Identifier') {
            // `const foo = $refs`
            hasUnknown = true
          }
        }
      } else if (parent.type === 'MemberExpression') {
        if (parent.object === node) {
          // `$refs.foo`
          const name = utils.getStaticPropertyName(parent)
          if (name) {
            usedRefs.add(name)
          } else {
            hasUnknown = true
          }
        }
      } else if (parent.type === 'CallExpression') {
        const argIndex = parent.arguments.indexOf(node)
        if (argIndex > -1) {
          // `foo($refs)`
          hasUnknown = true
        }
      } else if (
        parent.type === 'ForInStatement' ||
        parent.type === 'ReturnStatement'
      ) {
        hasUnknown = true
      }
    }

    return utils.defineTemplateBodyVisitor(
      context,
      {
        /**
         * @param {KExpressionContainer} node
         */
        KExpressionContainer(node) {
          if (hasUnknown) {
            return
          }
          for (const id of getReferences(node.references)) {
            if (id.name !== '$refs') {
              continue
            }
            extractUsedForPattern(id)
          }
        },
        /**
         * @param {KAttribute} node
         */
        'KAttribute[directive=false]'(node) {
          if (hasUnknown) {
            return
          }
          if (node.key.name === 'ref' && node.value != null) {
            defineRefs.push(node.value)
          }
        },
        "KElement[parent.type!='KElement']:exit"() {
          if (hasUnknown) {
            return
          }
          reportUnusedRefs()
        }
      },
      utils.compositingVisitors(
        utils.isScriptSetup(context)
          ? {
              Program() {
                const globalScope =
                  context.getSourceCode().scopeManager.globalScope
                if (!globalScope) {
                  return
                }
                for (const variable of globalScope.variables) {
                  if (variable.defs.length > 0) {
                    usedRefs.add(variable.name)
                  }
                }
                const moduleScope = globalScope.childScopes.find(
                  (scope) => scope.type === 'module'
                )
                if (!moduleScope) {
                  return
                }
                for (const variable of moduleScope.variables) {
                  if (variable.defs.length > 0) {
                    usedRefs.add(variable.name)
                  }
                }
              }
            }
          : {},
        utils.defineKduVisitor(context, {
          onKduObjectEnter(node) {
            for (const prop of utils.iterateProperties(
              node,
              new Set(['setup'])
            )) {
              usedRefs.add(prop.name)
            }
          }
        }),
        {
          Identifier(id) {
            if (hasUnknown) {
              return
            }
            if (id.name !== '$refs') {
              return
            }
            /** @type {Identifier | MemberExpression} */
            let refsNode = id
            if (id.parent.type === 'MemberExpression') {
              if (id.parent.property === id) {
                // `this.$refs.foo`
                refsNode = id.parent
              }
            }
            extractUsedForPattern(refsNode)
          }
        }
      )
    )
  }
}
