module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow async/await functions, use Task or TaskEither instead. Exception: top-level await.",
      category: "Best Practices",
      recommended: true,
    },
    messages: {
      noAsync: "Do not use async functions. Use Task or TaskEither from fp-ts instead.",
      noAwaitInFunction: "Do not use await inside functions. Use Task or TaskEither from fp-ts instead.",
    },
    schema: [],
  },

  create(context) {
    let hasFptsImport = false

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

      ArrowFunctionExpression(node) {
        if (!hasFptsImport) return

        if (node.async) {
          context.report({
            node,
            messageId: "noAsync",
          })
        }
      },

      FunctionDeclaration(node) {
        if (!hasFptsImport) return

        if (node.async) {
          context.report({
            node,
            messageId: "noAsync",
          })
        }
      },

      FunctionExpression(node) {
        if (!hasFptsImport) return

        if (node.async) {
          context.report({
            node,
            messageId: "noAsync",
          })
        }
      },

      AwaitExpression(node) {
        if (!hasFptsImport) return

        let parent = node.parent
        while (parent) {
          if (
            parent.type === "ArrowFunctionExpression" ||
            parent.type === "FunctionExpression" ||
            parent.type === "FunctionDeclaration"
          ) {
            context.report({
              node,
              messageId: "noAwaitInFunction",
            })
            return
          }
          parent = parent.parent
        }
      },
    }
  },
}
