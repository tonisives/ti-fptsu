module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow long inline functions inside pipe expressions",
      category: "Best Practices",
      recommended: true,
    },
    messages: {
      longInlineFunction:
        "Inline function in pipe has {{lines}} lines (max {{maxLines}} allowed). Extract to a separate named function.",
    },
    schema: [
      {
        type: "object",
        properties: {
          maxLines: {
            type: "integer",
            minimum: 1,
            default: 5,
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    let hasFptsImport = false
    let pipeDepth = 0
    const options = context.options[0] || {}
    const maxLines = options.maxLines || 5

    function countFunctionLines(node) {
      if (!node.loc) return 0
      return node.loc.end.line - node.loc.start.line + 1
    }

    function isInlineFunctionExpression(node) {
      return (
        node.type === "ArrowFunctionExpression" ||
        node.type === "FunctionExpression"
      )
    }

    return {
      ImportDeclaration(node) {
        if (
          node.source.value === "ti-fptsu/lib" ||
          node.source.value.startsWith("fp-ts/") ||
          node.source.value === "fp-ts"
        ) {
          hasFptsImport = true
        }
      },

      CallExpression(node) {
        if (!hasFptsImport) return

        let isPipe = false

        if (node.callee.type === "Identifier" && node.callee.name === "pipe") {
          isPipe = true
        }

        if (isPipe) {
          pipeDepth++

          // Check all arguments in the pipe
          if (pipeDepth === 1) {
            node.arguments.forEach((arg) => {
              // Check direct inline functions
              if (isInlineFunctionExpression(arg)) {
                const lines = countFunctionLines(arg)
                if (lines > maxLines) {
                  context.report({
                    node: arg,
                    messageId: "longInlineFunction",
                    data: {
                      lines: lines.toString(),
                      maxLines: maxLines.toString(),
                    },
                  })
                }
              }

              // Check for inline functions passed to fp-ts operators like te.map, te.flatMap, etc.
              if (arg.type === "CallExpression") {
                arg.arguments.forEach((innerArg) => {
                  if (isInlineFunctionExpression(innerArg)) {
                    const lines = countFunctionLines(innerArg)
                    if (lines > maxLines) {
                      context.report({
                        node: innerArg,
                        messageId: "longInlineFunction",
                        data: {
                          lines: lines.toString(),
                          maxLines: maxLines.toString(),
                        },
                      })
                    }
                  }
                })
              }
            })
          }
        }
      },

      "CallExpression:exit"(node) {
        if (!hasFptsImport) return

        let isPipe = false

        if (node.callee.type === "Identifier" && node.callee.name === "pipe") {
          isPipe = true
        }

        if (isPipe) {
          pipeDepth--
        }
      },
    }
  },
}
