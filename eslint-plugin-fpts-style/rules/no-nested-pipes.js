module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow nested pipe expressions (configurable threshold for small pipes)",
      category: "Best Practices",
      recommended: true,
    },
    messages: {
      nestedPipe:
        "Nested pipe expression with {{argCount}} arguments detected. Extract inner pipe to a separate function and use function pointer instead.{{allowedMessage}}",
    },
    schema: [
      {
        type: "object",
        properties: {
          maxNestedPipeArgs: {
            type: "number",
            default: 3,
            minimum: 0,
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    let hasFptsImport = false
    let pipeDepth = 0
    const maxNestedPipeArgs =
      context.options[0]?.maxNestedPipeArgs !== undefined
        ? context.options[0].maxNestedPipeArgs
        : 3

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

          if (pipeDepth > 1) {
            const argCount = node.arguments.length
            if (argCount > maxNestedPipeArgs) {
              const allowedMessage =
                maxNestedPipeArgs > 0
                  ? ` (Pipes with ${maxNestedPipeArgs} or fewer arguments are allowed)`
                  : ""
              context.report({
                node,
                messageId: "nestedPipe",
                data: {
                  argCount: argCount,
                  allowedMessage: allowedMessage,
                },
              })
            }
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
