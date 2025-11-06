module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow nested pipe expressions",
      category: "Best Practices",
      recommended: true,
    },
    messages: {
      nestedPipe:
        "Nested pipe expression detected. Extract inner pipe to a separate function and use function pointer instead.",
    },
    schema: [],
  },

  create(context) {
    let hasFptsImport = false
    let pipeDepth = 0

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
            context.report({
              node,
              messageId: "nestedPipe",
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
